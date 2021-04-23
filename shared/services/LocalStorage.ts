import { IStorage } from '@shared-types'
import { Logger } from '@services'

export class LocalStorage implements IStorage {
    public load<T> (key: string): T | undefined {
        try {
            const serializableState = localStorage.getItem(key)

            if (!serializableState) {
                return undefined
            }

            return JSON.parse(serializableState) as T
        } catch (err) {
            Logger.error(err)
            throw new Error(err)
        }
    }

    public save<T> (key: string, data: T): void {
        try {
            const serializableState = JSON.stringify(data)
            localStorage.setItem(key, serializableState)
        } catch (err) {
            Logger.error(err)
            throw new Error(err)
        }
    }

    public remove (key: string): void {
        try {
            localStorage.removeItem(key)
        } catch (err) {
            Logger.error(err)
            throw new Error(err)
        }
    }
}
