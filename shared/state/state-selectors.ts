import { ConsumerState } from './consumer/actions'
import { DescoState } from './desco/actions'
import { ProductState } from './product/actions'
import { UserState } from './user/actions'
import { VillageState } from './village/actions'

export const getConsumerState = (state: { consumer: ConsumerState }) => state.consumer
export const getDescoState = (state: { desco: DescoState }) => state.desco
export const getUserState = (state: { user: UserState }) => state.user
export const getVillageState = (state: { village: VillageState }) => state.village
export const getProductState = (state: { product: ProductState }) => state.product
