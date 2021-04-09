/* eslint-disable camelcase */

/*
 * Some reference types are added for routing purposes.
 * These are used only on the front end, so be careful when binding to the api.
 */
const referenceTypes = ['inventory.Server', 'identity.Project', 'identity.ProjectGroup',
    'inventory.Collector', 'identity.ServiceAccount', 'identity.Provider',
    'inventory.Region', 'inventory.CloudService', 'inventory.CloudServiceType',
    'secret.Secret', 'spot_automation.SpotGroup'];
export type ReferenceType = typeof referenceTypes[number]

export interface Reference {
    resource_type: ReferenceType;
    reference_key?: string;
}
