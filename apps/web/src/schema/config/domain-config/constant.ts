export const DOMAIN_CONFIG_NAMES = {
    EXTRA_MENU: 'console:ext-menu', // NOTE: Will be deprecated after migration from domain-config to public-config
    SETTINGS: 'settings', // NOTE: Will be deprecated after migration from domain-config to public-config
    DORMANCY_WORKSPACE: 'identity:dormancy:workspace',
    ANOMALY_DETECTION_CONFIGURATION: 'anomaly_detection_configuration', // NOTE: Not used. Check if it is used and remove if not used
} as const;
