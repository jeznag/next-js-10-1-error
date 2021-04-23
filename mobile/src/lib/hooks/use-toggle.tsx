import { useState, useCallback } from 'react'

function useToggle (initialState = false): [boolean, () => void] {
    const [isToggled, setToggled] = useState(initialState)
    const toggle = useCallback(() => setToggled(isToggled => !isToggled), [])

    return [isToggled, toggle]
}

export { useToggle }
