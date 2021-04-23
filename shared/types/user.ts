import { Coords } from 'shared/types'
import { ExternalUser, SupportedLanguageCodes } from '@services/api'

export enum UserType {
    Internal = 'Internal',
    External = 'External',
    Unknown = 'Unknown'
}

export type ActiveUser = {
    type: UserType
    email: string
    language?: SupportedLanguageCodes
    externalUser?: ExternalUser,
    currentLocation?: Coords
}
