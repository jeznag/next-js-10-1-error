import nock from 'nock'

import { BrokerClient, Environment } from '@services'

describe('Test BrokerClient class', () => {
    const mockConsumerUuid = 'PMyOSqi'
    const mockBrokerUrl = `/${mockConsumerUuid}/package/modify`

    it('returns true if the publish succeeded', async () => {
        const scope = nock(Environment.getInternalHarvestUrl('/broker'))
            .post(mockBrokerUrl)
            .reply(200)

        const brokerClient = new BrokerClient()
        const isSuccess = await brokerClient.publishUpdatePackage(mockConsumerUuid)

        expect(isSuccess).toBeUndefined()

        scope.done()
    })

    it('returns false if the publish failed', async () => {
        const scope = nock(Environment.getInternalHarvestUrl('/broker'))
            .post(mockBrokerUrl)
            .reply(500, 'Publish to broker failed: Bad connection')

        const brokerClient = new BrokerClient()
        const isSuccess = await brokerClient.publishUpdatePackage(mockConsumerUuid)

        expect(isSuccess).toBeInstanceOf(Error)

        scope.done()
    })
})
