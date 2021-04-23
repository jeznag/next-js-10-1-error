type Exactly<T, U> = T & Record<Exclude<keyof U, keyof T>, never>

/**
* Type to use if you need to have an exact replica of the a type but only need
* a fragment of it. The type would return an error if additional properties were
* to be added to the type.
* Reference: https://stackoverflow.com/questions/56606614/is-there-an-alternative-to-partial-to-accept-only-fields-from-another-type-and-n/56620917#56620917
*
* Example:
*```
* type Chihuahua = { food: string, size: 'standard' | 'toy', color: string }
*
* const labrador = {
*     food: 'beef',
*     energyLevel: 'high'
* }
*
* class Dog<T> {
*     public create<P extends Fragment<P,T>> (updateParams: P) {
*         return 'test'
*     }
* }
*
* const dogClass = new Dog<Chihuahua>()
* const dog = dogClass.create(labrador) // This would return an error because `energyLevel` is not a valid property
*
*```
*/
export type Fragment<Fragments, Exact> = Exactly<Partial<Exact>, Fragments>


