import React from 'react'
import renderer from 'react-test-renderer'
import { NotFound } from '@components'
import '../__mocks__/match-media'

describe('NotFound', () => {
    it('should render correctly with a 404 error', () => {
        const tree = renderer
            .create(<NotFound code='404' />)
            .toJSON()

        expect(tree).toMatchSnapshot()
    })

    it('should render correctly with a 401 error', () => {
        const tree = renderer
            .create(<NotFound code='401' />)
            .toJSON()

        expect(tree).toMatchSnapshot()
    })

    it('should render correctly with a 418 error', () => {
        const tree = renderer
            .create(<NotFound code='418' />)
            .toJSON()

        expect(tree).toMatchSnapshot()
    })
})
