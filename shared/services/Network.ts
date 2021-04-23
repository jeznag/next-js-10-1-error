interface ExtendedNavigator extends Navigator {
    connection?: {
        downlink: number
    }
}

declare const navigator: ExtendedNavigator

export class Network {
    public static async isOnline () {
        if (navigator.connection) {
            return navigator.connection.downlink && navigator.connection.downlink > 0
        }

        try {
            // Ping Google to ensure connection to the internet.
            await fetch('https://www.google.com', { mode: 'no-cors' })
            return true
        } catch {
            return false
        }
    }
}
