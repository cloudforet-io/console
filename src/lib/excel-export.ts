export const FILE_NAME_PREFIX = Object.freeze({
    cloudService: 'cloud_service',
    server: 'server',
    serviceAccount: 'service_account',
    user: 'user',
    collector: 'collector',
    projectWebhook: 'projectWebhook',
    alert: 'alert',
});
export type FILE_NAME_PREFIX = typeof FILE_NAME_PREFIX[keyof typeof FILE_NAME_PREFIX]
