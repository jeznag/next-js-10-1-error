import { useEffect, useState } from 'react'
import { Environment } from 'shared/services'

export const useNetwork = () => {
    const [isOnline, setIsOnline] = useState(true)

    useEffect(() => {
        void handleConnectionChange()
        window.addEventListener('online', handleConnectionChange)
        window.addEventListener('offline', handleConnectionChange)

        return () => {
            window.removeEventListener('online', handleConnectionChange)
            window.removeEventListener('offline', handleConnectionChange)
        }
    }, [])

    const handleConnectionChange = async () => {
        // `navigator.online` only states that you are connected to
        // a network but not necessarily have an internet connection.
        if (Environment.isClient && navigator?.onLine) {
            try {
                // Ping Google to ensure connection to the internet.
                await fetch('https://www.google.com', { mode: 'no-cors' })
                setIsOnline(true)
            } catch {
                setIsOnline(false)
            }
        } else {
            setIsOnline(false)
        }
    }

    return isOnline
}
