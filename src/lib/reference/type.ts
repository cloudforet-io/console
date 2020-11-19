/* eslint-disable camelcase */

const referenceTypes = ['inventory.Server', 'identity.Project', 'identity.ProjectGroup',
    'inventory.Collector', 'identity.ServiceAccount', 'identity.Provider',
    'inventory.Region', 'inventory.CloudService', 'inventory.CloudServiceType',
    'secret.Secret'];
export type ReferenceType = typeof referenceTypes[number]

export interface Reference {
    resource_type: ReferenceType;
    reference_key?: string;
}
