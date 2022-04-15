export const FAVORITE_TYPE = Object.freeze({
    PROJECT: 'project',
    CLOUD_SERVICE_TYPE: 'cloudServiceType',
});
export type FAVORITE_TYPE = typeof FAVORITE_TYPE[keyof typeof FAVORITE_TYPE];
