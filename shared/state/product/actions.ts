import { Status, ActionPayload } from '@shared-types'
import { Product, Desco } from '@services/api'

export type ProductState = {
    isReloadRequired: boolean
    products: Array<Product>
    currentStatus: Status
    error?: Error
}

export const defaultProductState: ProductState = {
    isReloadRequired: true,
    products: [],
    currentStatus: Status.Idle
}

export const isProductAction = (payload: any): payload is ProductActionPayload => {
    return payload?.stateName === 'product'
}

export abstract class ProductActionPayload extends ActionPayload<ProductState> {
    protected readonly _stateName = 'product'
}

export class FetchProductsAction extends ProductActionPayload {
    constructor (public readonly desco: Desco) { super() }

    public reduce (state: ProductState): ProductState {
        return { ...state, currentStatus: Status.InProgress }
    }
}

export class FetchProductsSuccessAction extends ProductActionPayload {
    constructor (public readonly products: Product[]) { super() }

    public reduce (state: ProductState): ProductState {
        return {
            ...state,
            products: this.products,
            isReloadRequired: false,
            currentStatus: Status.Success
        }
    }
}

export class FetchProductsFailedAction extends ProductActionPayload {
    constructor (public readonly error: Error) {
        super()
        this.error = error
    }

    public reduce (state: ProductState): ProductState {
        return {
            ...state,
            error: this.error,
            isReloadRequired: true,
            currentStatus: Status.Failed
        }
    }
}

export class SetProductReloadRequired extends ProductActionPayload {
    constructor (public readonly isReloadRequired: boolean) { super() }

    public reduce (state: ProductState): ProductState {
        return {
            ...state,
            isReloadRequired: this.isReloadRequired
        }
    }
}

export class UpdateProductsInListAction extends ProductActionPayload {
    constructor (public readonly updatedProducts: Product[]) { super() }

    public reduce (state: ProductState): ProductState {
        const updatedProductIds = this.updatedProducts.map(product => product.productPk)

        const products = state.products.map(product => {
            if (updatedProductIds.includes(product.productPk)) {
                const updatedProduct = this.updatedProducts.find(updatedProduct => updatedProduct.productPk === product.productPk)

                return updatedProduct as Product
            }

            return product
        })

        return { ...state, products, currentStatus: Status.Success }
    }
}
