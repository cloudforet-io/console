export const PLUGIN_STATE = {
    ENABLED: 'ENABLED',
    DISABLED: 'DISABLED',
} as const;

export const REGISTRY_TYPE = {
    DOCKER_HUB: 'DOCKER_HUB',
    AWS_PUBLIC_ECR: 'AWS_PUBLIC_ECR',
    HARBOR: 'HARBOR',
};
