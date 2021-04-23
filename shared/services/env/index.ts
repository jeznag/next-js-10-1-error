import { EnvironmentClass } from './Environment'
import { Config } from '../config'

const config = {
    serverUrl: Config.get('SERVER_URL'),
    serverPort: Config.get('SERVER_PORT'),
    clientUrl: Config.get('CLIENT_URL'),
    clientPort: Config.get('CLIENT_PORT')
}
const Environment = new EnvironmentClass(config)

export { Environment }
export * from './Environment'
