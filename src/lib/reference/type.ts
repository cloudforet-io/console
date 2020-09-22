/* eslint-disable camelcase */

const referenceTypes = ['inventory.Server', 'identity.Project',
    'inventory.Collector', 'identity.ServiceAccount', 'identity.Provider',
    'inventory.Region', 'inventory.CloudService', 'secret.Secret'];
export type ReferenceType = typeof referenceTypes[number]

export interface Reference {
    resource_type: ReferenceType;
    reference_key: string;
}
