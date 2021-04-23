import { message } from 'antd'
import { MessageType } from 'antd/lib/message'

message.config({
    top: 100,
    duration: 5
})

export class Notification {
    public static error (errorMessage: string) {
        void message.error({ content: errorMessage, key: errorMessage, duration: 0 })
    }

    public static success (successMessage: string) {
        void message.success({ content: successMessage, key: successMessage })
    }

    public static warning (warningMessage: string) {
        void message.warning({ content: warningMessage, key: warningMessage })
    }

    // Returns the message close method that you can call
    // once loading is finished.
    // Reference: https://ant.design/components/message/
    public static loading (loadingMessage: string): MessageType {
        return message.loading({ content: loadingMessage, key: loadingMessage, duration: 0 })
    }

    public static destroyAll () {
        message.destroy()
    }
}
