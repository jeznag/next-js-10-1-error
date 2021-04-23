import { HttpClient } from '@services'
import { ApiMetaData } from '@shared-types'
import { ApolloApi } from './ApolloApi'
import { PackageState } from './ConsumerApi'

export type CreateSignupParams = {
    villageId: number
    packageTypeId: number
    firstName: string
    lastName: string
    mobileNumber?: string
    latitude: number
    longitude: number
}

export type SignupDTO = {
    node_uuid: string
    consumer_uuid: string
    consumer_id: number
    village_id: number
    package_type_id: number
    alias: string
    first_name: string
    last_name: string
    mobile_number: string | null
    package_state: PackageState
}

export type Signup = {
    nodeUuid: string
    consumerUuid: string
    consumerId: number
    villageId: number
    packageTypeId: number
    alias: string
    firstName: string
    lastName: string
    mobileNumber?: string
    packageState: PackageState
}

export class SignupApi {
    private readonly baseApi: ApolloApi<SignupDTO>

    constructor (client?: HttpClient) {
        this.baseApi = new ApolloApi('signups', client)
    }

    public async create (consumerUuid: string, signupParams: CreateSignupParams, metadata?: ApiMetaData): Promise<Signup | Error> {
        const data = {
            consumer_uuid: consumerUuid,
            village_id: signupParams.villageId,
            package_type_id: signupParams.packageTypeId,
            first_name: signupParams.firstName,
            last_name: signupParams.lastName,
            mobile_number: signupParams.mobileNumber,
            latitude: signupParams.latitude,
            longitude: signupParams.longitude
        }

        const result = await this.baseApi.create(data, metadata)

        if (result instanceof Error) {
            return result
        }

        return this.parseDto(result)
    }

    private parseDto (dto: SignupDTO): Signup {
        return {
            nodeUuid: dto.node_uuid,
            consumerUuid: dto.consumer_uuid,
            consumerId: dto.consumer_id,
            villageId: dto.village_id,
            packageTypeId: dto.package_type_id,
            alias: dto.alias,
            firstName: dto.first_name,
            lastName: dto.last_name,
            mobileNumber: dto.mobile_number ?? undefined,
            packageState: dto.package_state
        }
    }
}
