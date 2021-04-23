import { Condition, Constants } from '@shared-types'
import { DateTime } from 'luxon'

import { XMysqlApi, ApplianceType } from '@api'
import { HttpClient } from '@services'
import { nanoid } from 'nanoid'

export enum ApplianceState {
    Active = 'ACTIVE',
    Inactive = 'INACTIVE'
}

export type ApplianceDTO = {
    uuid: string
    appliance_pk: number
    lease_start_date?: string
    appliance_state: ApplianceState
    outstanding_balance: number
    appliance_type_fk: number
    consumer_fk: number
    village_fk: number
}

export type ApplianceWithTypeDTO = ApplianceDTO & {
    description: string,
    full_price: number
}

export type Appliance = {
    uuid: string
    appliancePk: number
    leaseStartDate?: string
    applianceState: ApplianceState
    outstandingBalance: number
    applianceTypeFk: number
    consumerFk: number
    applianceName: string
    appliancePrice: number
}

export type UpdatableApplianceProperties = {
    applianceKey: number
    leaseStartDate?: string
    applianceState?: ApplianceState
}

export class ApplianceApi {
    private readonly baseApi: XMysqlApi<ApplianceDTO>
    private readonly fields = [
        'uuid',
        'appliance_pk',
        'lease_start_date',
        'appliance_state',
        'outstanding_balance',
        'appliance_type_fk',
        'consumer_fk'
    ]

    constructor (private readonly client?: HttpClient) {
        this.baseApi = new XMysqlApi<ApplianceDTO>('appliance', this.fields, client)
    }

    public async getAllFromVillages (uniqueVillageKeys: number[]): Promise<Appliance[] | Error> {
        return this.getAllAppliances({ village_fk: uniqueVillageKeys.join(',') }, 'c')
    }

    public async getAllFromConsumerUuid (consumerUuid: string): Promise<Appliance[] | Error> {
        return this.getAllAppliances({ uuid: consumerUuid }, 'c')
    }

    private async getAllAppliances (condition?: Condition, aliasName?: string): Promise<Appliance[] | Error> {
        const parsedCondition = condition
            ? this.baseApi.parseCondition(condition, aliasName)
            : undefined

        const dataForJoin = {
            _join: 'c.consumer,_j,a.appliance,_j,at.appliance_type',
            _on1: '(c.consumer_pk,eq,a.consumer_fk)',
            _on2: '(a.appliance_type_fk,eq,at.appliance_type_pk)',
            _fields: [
                ...this.fields.map(field => `a.${field}`),
                'at.description',
                'at.full_price',
                'c.village_fk',
                'c.uuid'
            ].join(','),
            ...parsedCondition
        }

        const appliances = await this.baseApi.getJoin<ApplianceWithTypeDTO>(dataForJoin)

        if (appliances instanceof Error) {
            return appliances
        }

        return appliances.map(appliance => ({
            uuid: appliance.uuid,
            appliancePk: appliance.appliance_pk,
            leaseStartDate: appliance.lease_start_date,
            applianceState: appliance.appliance_state,
            outstandingBalance: appliance.outstanding_balance,
            applianceTypeFk: appliance.appliance_type_fk,
            consumerFk: appliance.consumer_fk,
            applianceName: appliance.description,
            appliancePrice: appliance.full_price
        }))
    }

    public async createAppliance (applianceType: ApplianceType, consumerPk: number): Promise<Appliance | Error> {
        const appliance = {
            uuid: nanoid(Constants.STANDARD_UUID_LENGTH),
            lease_start_date: DateTime.utc().toISO(),
            appliance_state: ApplianceState.Active,
            outstanding_balance: applianceType.fullPrice,
            appliance_type_fk: applianceType.applianceTypePk,
            consumer_fk: consumerPk
        }
        const result = await this.baseApi.insert(appliance)

        if (result instanceof Error) {
            return result
        }

        return {
            uuid: appliance.uuid,
            appliancePk: result,
            leaseStartDate: appliance.lease_start_date,
            applianceState: appliance.appliance_state,
            outstandingBalance: appliance.outstanding_balance,
            applianceTypeFk: appliance.appliance_type_fk,
            consumerFk: appliance.consumer_fk,
            applianceName: applianceType.description,
            appliancePrice: applianceType.fullPrice
        }
    }

    public async updateAppliance (updatableProps: UpdatableApplianceProperties) {
        // Skip update if all params are undefined
        if ([
            updatableProps.leaseStartDate,
            updatableProps.applianceState
        ].every((param) => param === undefined)) {
            return true
        }

        const applianceData = {
            lease_start_date: updatableProps.leaseStartDate,
            appliance_state: updatableProps.applianceState
        }

        return this.baseApi.updateFromKey(
            updatableProps.applianceKey,
            applianceData
        )
    }

    /**
     * This would permanently delete the user from the database.
     * Only use this for test user clean-up.
     * @param applianceKey
     */
    public async permanentlyDeleteAppliance (applianceKey: number): Promise<boolean | Error> {
        return this.baseApi.deleteFromKey(applianceKey)
    }
}
