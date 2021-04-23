export interface IStorage {
    load<T> (key: string): T | undefined
    save<T> (key: string, data: T): void
    remove (key: string): void
}
