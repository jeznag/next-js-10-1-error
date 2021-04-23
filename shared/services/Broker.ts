import mqtt from 'async-mqtt'

type BrokerCredentials = {
    host: string
    port: number
    username: string
    password: string
}

export class Broker {
    private readonly url: string
    private readonly options: {
        readonly username: string
        readonly password: string
    }

    constructor (credentials: BrokerCredentials) {
        this.url = `mqtt://${credentials.host}:${credentials.port}`
        this.options = {
            username: credentials.username,
            password: credentials.password
        }
    }

    public async publish (topic: string, payload = ''): Promise<void> {
        const client = await mqtt.connectAsync(this.url, this.options)

        await client.publish(topic, payload, { qos: 1 })

        await client.end()
    }
}
