/* eslint-disable camelcase */

/*
 * Some reference types are added for routing purposes.
 * These are used only on the front end, so be careful when binding to the api.
 */

const referenceTypes = ['inventory.Server', 'identity.Project', 'identity.ProjectGroup',
    'inventory.Collector', 'identity.ServiceAccount', 'identity.Provider',
    'inventory.Region', 'inventory.CloudService', 'inventory.CloudServiceType',
    'secret.Secret'];
export type ReferenceType = typeof referenceTypes[number]

export const referenceTypeLabels = Object.freeze({
    'inventory.Server': 'Server',
    'identity.Project': 'Project',
    'identity.ProjectGroup': 'Project Group',
    'inventory.Collector': 'Collector',
    'inventory.ResourceGroup': 'Resource Group',
    'identity.ServiceAccount': 'Service Account',
    'identity.Provider': 'Provider',
    'inventory.Region': 'Region',
    'inventory.CloudService': 'Cloud Service',
    'inventory.CloudServiceType': 'Cloud Service Type',
    'secret.Secret': 'Secret',
});

export interface Reference {
    resource_type: ReferenceType;
    reference_key?: string;
}
