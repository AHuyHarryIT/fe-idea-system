import { notification } from 'antd'

type NotificationType = 'success' | 'error' | 'info' | 'warning'

interface AppNotificationOptions {
  description?: string
  duration?: number
}

function openNotification(
  type: NotificationType,
  message: string,
  options?: AppNotificationOptions,
) {
  notification[type]({
    title: message,
    description: options?.description,
    duration: options?.duration ?? 3.5,
    placement: 'topRight',
  })
}

export const appNotification = {
  success: (message: string, options?: AppNotificationOptions) =>
    openNotification('success', message, options),
  error: (message: string, options?: AppNotificationOptions) =>
    openNotification('error', message, options),
  info: (message: string, options?: AppNotificationOptions) =>
    openNotification('info', message, options),
  warning: (message: string, options?: AppNotificationOptions) =>
    openNotification('warning', message, options),
}
