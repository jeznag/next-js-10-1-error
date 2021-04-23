import { call, put, select, take, race } from 'typed-redux-saga'
import { Logger } from '@services'
import { IAction } from '@shared-types'

import { ProductApi, Desco } from '@api'

import {
    FetchProductsAction,
    FetchProductsFailedAction,
    FetchProductsSuccessAction
} from './actions'
import { getProductState } from '../state-selectors'

export function* fetchProducts (action: IAction<FetchProductsAction>, productApi?: ProductApi) {
    const api = productApi || new ProductApi()
    const selectedDesco = action.payload.desco

    const products = yield* call([api, api.getAllFromDesco], selectedDesco.descoPk)

    if (products instanceof Error) {
        yield* put(new FetchProductsFailedAction(products).create())
        return
    }

    yield* put(new FetchProductsSuccessAction(products).create())
}

export function* getProducts (selectedDesco: Desco) {
    const productState = yield* select(getProductState)

    if (productState.isReloadRequired) {
        yield* put(new FetchProductsAction(selectedDesco).create())
        const { success, failed } = yield* race({
            success: take<IAction<FetchProductsSuccessAction>>(FetchProductsSuccessAction.name),
            failed: take<IAction<FetchProductsFailedAction>>(FetchProductsFailedAction.name)
        })

        if (failed) {
            return failed.payload.error
        } else if (success) {
            return success.payload.products
        } else {
            const error = new Error('Fetching products neither failed or succeeded.')
            Logger.error(error)
            return error
        }
    }

    return productState.products
}
