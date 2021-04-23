import { DateTime } from 'luxon'

import { ApiMetaData, Dictionary } from '@shared-types'
import { ObjectUtil } from '@utils'
import { HttpClient } from '@services'
import {
    XMysqlApi,
    InstalledNodeApi,
    InstalledNode,
    PackageTypeApi,
    PackageType,
    TransactionApi,
    Transaction,
    AggregationsApi,
    Aggregation,
    ApplianceApi,
    Appliance,
    Village
} from '@api'

export type ConsumerDTO = {
    consumer_pk: number
    uuid: string
    alias: string
    first_name: string
    last_name: string
    mobile_number: string | null
    package_state: ConsumerPackageState
    package_start_date: string | null
    package_end_date: string | null
    package_type_fk: number | null
    village_fk: number
    created_at: string
}

export type RawConsumer = {
    consumerPk: number
    uuid: string
    alias: string
    firstName: string
    lastName: string
    mobileNumber?: string
    packageState: ConsumerPackageState
    packageStartDate?: DateTime
    packageEndDate?: DateTime
    packageTypeFk?: number
    villageFk: number
    createdAt: DateTime
}

export type Consumer = {
    consumerPk: number
    uuid: string
    alias: string
    firstName: string
    lastName: string
    mobileNumber?: string
    isBilled: boolean
    packageState: ConsumerPackageState
    packageStartDate?: DateTime
    packageEndDate?: DateTime
    packageTypeFk?: number
    villageFk: number
    nodes: InstalledNode[]
    package?: PackageType
    latestTransaction?: Transaction
    outageHrsPastWeek?: number
    appliances: Appliance[]
    createdAt: DateTime
}

export enum ConsumerPackageState {
    ACTIVE = 'ACTIVE',
    DISABLED_CREDIT = 'DISABLED_CREDIT',
    DISABLED_DAILY = 'DISABLED_DAILY',
    NOT_INSTALLED = 'NOT_INSTALLED',
    REMOVED = 'REMOVED',
    BOOST = 'BOOST'
}

export type CreateConsumerParams = {
    alias: string
    uuid: string
    firstName: string
    lastName: string
    villageKey: number
    packageTypeKey: number
    mobileNumber?: string
}

export type UpdatableConsumerProperties = {
    consumerPk: number
    firstName?: string
    lastName?: string
    mobileNumber?: string | null
    packageTypeFk?: number | null
    packageStartDate?: DateTime | null
}

export class ConsumerApi {
    private readonly baseApi: XMysqlApi<ConsumerDTO>
    private readonly fields = [
        'consumer_pk',
        'uuid',
        'alias',
        'first_name',
        'last_name',
        'mobile_number',
        'package_state',
        'package_start_date',
        'package_end_date',
        'package_type_fk',
        'village_fk',
        'created_at'
    ]

    constructor (private readonly client?: HttpClient) {
        this.baseApi = new XMysqlApi<ConsumerDTO>('consumer', this.fields, client)
    }

    /*
   * This function retrieves all consumers for multiple villages and also
   * joins the related entities: Nodes, PackageType, and LatestTransaction
   * Total API calls is 4, although each will reoccur if more then 99 rows exist
   */
    public async getAllFromVillages (villages: Village[]): Promise<Consumer[] | Error> {
        const villageKeys = villages.map((village: Village) => {
            return village.villagePk
        })
        const fetchedRawConsumersFromVillages = await this.getRawConsumersFromVillages(villageKeys)

        if (fetchedRawConsumersFromVillages instanceof Error) {
            return fetchedRawConsumersFromVillages
        }

        return this.fillWithDetailsFromOtherTables(fetchedRawConsumersFromVillages)
    }

    public async getFromKey (consumerKey: number) {
        const rawConsumer = await this.baseApi.getFromKey(consumerKey)

        if (!rawConsumer || rawConsumer instanceof Error) {
            return rawConsumer
        }

        const consumers = await this.fillWithDetailsFromOtherTables([rawConsumer])

        if (consumers instanceof Error) {
            return consumers
        }

        return consumers[0]
    }

    /*
    * This function retrieves raw consumers for multiple
    */
    private getRawConsumersFromVillages (villageKeys: number[]): Promise<ConsumerDTO[] | Error> {
        const uniqueKeys = [...new Set(villageKeys)]

        return this.baseApi.getAll({ _where: `(village_fk,in,${uniqueKeys.join(',')})` })
    }

    public async getAllFromKeys (consumerKeys: number[]): Promise<RawConsumer[] | Error> {
        const uniqueKeys = [...new Set(consumerKeys)]

        const consumers = await this.baseApi.getAll({ _where: `(consumer_pk,in,${uniqueKeys.join(',')})` })

        if (consumers instanceof Error) return consumers

        return consumers.map(consumer => this.parseDto(consumer))
    }

    public async getFromUuid (uuid: string): Promise<Consumer | Error> {
        const rawConsumers = await this.baseApi.getAll({ _where: `(uuid,eq,${uuid})` })

        if (rawConsumers instanceof Error) {
            return rawConsumers
        }

        if (rawConsumers.length > 1) {
            return new Error(`UUID ${uuid} returned multiple results.`)
        }

        const completeConsumers = await this.fillWithDetailsFromOtherTables(rawConsumers)

        return (completeConsumers instanceof Error)
            ? completeConsumers
            : completeConsumers[0]
    }

    public async findUsingAliasOrNameAndVillages (aliasOrName: string, villageKeys: number[]): Promise<Consumer[] | Error> {
        const condition = { _where: `(village_fk,in,${villageKeys.join(',')})` }

        const [aliasMatches, firstNameMatches, lastNameMatches] = await Promise.all([
            this.baseApi.getAllMatches('alias', aliasOrName, condition),
            this.baseApi.getAllMatches('first_name', aliasOrName, condition),
            this.baseApi.getAllMatches('last_name', aliasOrName, condition)
        ])

        if (aliasMatches instanceof Error) return aliasMatches
        if (firstNameMatches instanceof Error) return firstNameMatches
        if (lastNameMatches instanceof Error) return lastNameMatches

        const uniqueConsumers: ConsumerDTO[] = []

        aliasMatches
            .concat(firstNameMatches)
            .concat(lastNameMatches)
            .forEach(match => {
                const isDuplicate = uniqueConsumers.some(consumer => consumer.consumer_pk === match.consumer_pk)
                if (!isDuplicate) uniqueConsumers.push(match)
            })

        return this.fillWithDetailsFromOtherTables(uniqueConsumers)
    }

    /*
     * Update behaviour:
     * Any properties that are undefined will be skipped
     * Any value that is null will be set to null in the database, i.e removing the value
     * Setting a property to null should only be possible for nullable database fields
     */
    public async updateConsumer (updatableProps: UpdatableConsumerProperties, metaData?: ApiMetaData) {
        // Skip update if all params are undefined
        if ([
            updatableProps.firstName,
            updatableProps.lastName,
            updatableProps.mobileNumber,
            updatableProps.packageStartDate,
            updatableProps.packageTypeFk
        ].every((param) => param === undefined)) {
            return true
        }

        const consumerData = {
            first_name: updatableProps.firstName,
            last_name: updatableProps.lastName,
            mobile_number: updatableProps.mobileNumber,
            package_start_date: updatableProps.packageStartDate?.toSQL(),
            package_type_fk: updatableProps.packageTypeFk
        }


        return this.baseApi.updateFromKey(
            updatableProps.consumerPk,
            consumerData,
            metaData
        )
    }

    public async createConsumer (createParams: CreateConsumerParams) {
        return this.baseApi.insert({
            alias: createParams.alias,
            uuid: createParams.uuid,
            first_name: createParams.firstName,
            last_name: createParams.lastName,
            village_fk: createParams.villageKey,
            package_type_fk: createParams.packageTypeKey,
            mobile_number: createParams.mobileNumber
        })
    }

    public async getLatestConsumerFromVillage (villageKey: number) {
        const result = await this.baseApi.get({
            _where: `(village_fk,eq,${villageKey})`,
            _size: 1,
            _sort: '-created_at'
        })

        if (result instanceof Error) {
            return result
        }

        return result.length ? this.parseDto(result[0]) : undefined
    }

    private async fillWithDetailsFromOtherTables (consumers: ConsumerDTO[]): Promise<Consumer[] | Error> {
        const installedNodeApi = new InstalledNodeApi(this.client)
        const packageTypeApi = new PackageTypeApi(this.client)
        const transactionApi = new TransactionApi(this.client)
        const aggregationsApi = new AggregationsApi(this.client)
        const applianceApi = new ApplianceApi(this.client)

        const villageKeys: number[] = []
        const packageTypeKeys: number[] = []

        for (const consumer of consumers) {
            villageKeys.push(consumer.village_fk)
            consumer.package_type_fk && packageTypeKeys.push(consumer.package_type_fk)
        }

        const uniqueVillageKeys = [...new Set(villageKeys)]
        const nodesPromise = installedNodeApi.getAllFromVillages(uniqueVillageKeys)
        const transactionsPromise = transactionApi.getLatestFromVillages(uniqueVillageKeys)
        const chargeTransactionsPromise = transactionApi.getLatestChargeTransactionsFromVillages(uniqueVillageKeys)
        const packageTypePromise = packageTypeApi.getAllForKeys(packageTypeKeys)
        const aggregationsPromise = aggregationsApi.getAllFromVillages(
            uniqueVillageKeys,
            DateTime.utc().minus({ days: 7 }).toFormat('yyyy-MM-dd')
        )
        const appliancesPromise = applianceApi.getAllFromVillages(uniqueVillageKeys)

        const [
            nodes,
            latestTransactions,
            chargeTransactions,
            completePackages,
            aggregations,
            appliances
        ] = await Promise.all([
            nodesPromise,
            transactionsPromise,
            chargeTransactionsPromise,
            packageTypePromise,
            aggregationsPromise,
            appliancesPromise
        ])

        if (nodes instanceof Error) return nodes
        if (latestTransactions instanceof Error) return latestTransactions
        if (chargeTransactions instanceof Error) return chargeTransactions
        if (completePackages instanceof Error) return completePackages
        if (aggregations instanceof Error) return aggregations
        if (appliances instanceof Error) return appliances

        return consumers.map((consumer: ConsumerDTO): Consumer => {
            const relevantNodes = nodes.filter(node => node.consumerFk === consumer.consumer_pk)
            const relevantPackage = completePackages.find(billingPackage => billingPackage.packageTypePk === consumer.package_type_fk)
            const latestTransaction = latestTransactions.find(transaction => transaction.consumerFk === consumer.consumer_pk)
            const latestChargeTransaction = chargeTransactions.find(transaction => transaction.consumerFk === consumer.consumer_pk)
            const relevantAggs = aggregations.filter(agg => agg.consumerPk === consumer.consumer_pk)
            const relevantAppliances = appliances.filter(appliance => appliance.consumerFk === consumer.consumer_pk)

            const outageHrs = this.getOutageHours(relevantAggs)

            return {
                consumerPk: consumer.consumer_pk,
                uuid: consumer.uuid,
                alias: consumer.alias,
                firstName: consumer.first_name,
                lastName: consumer.last_name,
                mobileNumber: consumer.mobile_number ?? undefined,
                isBilled: !!latestChargeTransaction,
                packageState: this.getConsumerPackageState(consumer, relevantNodes),
                packageStartDate: consumer.package_start_date
                    ? DateTime.fromISO(consumer.package_start_date, { zone: 'utc' })
                    : undefined,
                packageEndDate: consumer.package_end_date
                    ? DateTime.fromISO(consumer.package_end_date, { zone: 'utc' })
                    : undefined,
                packageTypeFk: consumer.package_type_fk ?? undefined,
                villageFk: consumer.village_fk,
                nodes: relevantNodes,
                package: relevantPackage,
                latestTransaction: latestTransaction,
                outageHrsPastWeek: outageHrs,
                appliances: relevantAppliances,
                createdAt: DateTime.fromISO(consumer.created_at, { zone: 'utc' })
            }
        })
    }

    private parseDto (dto: ConsumerDTO): RawConsumer {
        return {
            consumerPk: dto.consumer_pk,
            uuid: dto.uuid,
            alias: dto.alias,
            firstName: dto.first_name,
            lastName: dto.last_name,
            mobileNumber: dto.mobile_number ?? undefined,
            packageState: dto.package_state,
            packageStartDate: dto.package_start_date
                ? DateTime.fromISO(dto.package_start_date, { zone: 'utc' })
                : undefined,
            packageEndDate: dto.package_end_date
                ? DateTime.fromISO(dto.package_end_date, { zone: 'utc' })
                : undefined,
            packageTypeFk: dto.package_type_fk ?? undefined,
            villageFk: dto.village_fk,
            createdAt: DateTime.fromISO(dto.created_at, { zone: 'utc' })
        }
    }

    private getConsumerPackageState (dto: ConsumerDTO, nodes: InstalledNode[]): ConsumerPackageState {
        const hasNoActiveNodes = nodes.every(node => ObjectUtil.isUndefinedOrNull(node.productFk))
        if (hasNoActiveNodes) {
            if (dto.package_end_date) return ConsumerPackageState.REMOVED

            return ConsumerPackageState.NOT_INSTALLED
        }

        return dto.package_state
    }

    private getOutageHours (aggregations: Aggregation[]): number {
        let numDaysWithData = 0
        let uptime = 0
        for (const agg of aggregations) {
            if (agg.percentSystemUptime) {
                numDaysWithData++
                uptime += agg.percentSystemUptime
            }
        }

        return Math.floor((numDaysWithData - uptime) * 24)
    }

    public static buildConsumerDict (consumers: Consumer[]): Dictionary<Consumer> {
        const consumerDict: Dictionary<Consumer> = {}

        for (const consumer of consumers) {
            consumerDict[consumer.consumerPk] = consumer
        }

        return consumerDict
    }
}
