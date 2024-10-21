import ProjectVariableModel from '@/lib/variable-models/managed-model/resource-model/project-variable-model';
import RegionVariableModel from '@/lib/variable-models/managed-model/resource-model/region-variable-model';
import ServiceAccountVariableModel
    from '@/lib/variable-models/managed-model/resource-model/service-account-variable-model';
import UserVariableModel from '@/lib/variable-models/managed-model/resource-model/user-variable-model';
import WorkspaceVariableModel from '@/lib/variable-models/managed-model/resource-model/workspace-variable-model';

import type { ReferenceVariable } from '@/services/dashboards/types/global-variable-type';



const _generateGVKey = (key: string): string => `managed_dashboard_global_variable_${key}`;
export const MANAGED_DASHBOARD_GLOBAL_VARIABLES_SCHEMA: Record<string, ReferenceVariable> = {
    [_generateGVKey(WorkspaceVariableModel.meta.key)]: { // managed_dashboard_global_variable_workspace
        management: 'managed',
        key: _generateGVKey(WorkspaceVariableModel.meta.key),
        name: WorkspaceVariableModel.meta.name,
        method: 'dynamic',
        reference: {
            resourceType: WorkspaceVariableModel.meta.resourceType,
        },
        options: {
            selectionType: 'multi',
        },
    },
    [_generateGVKey(ProjectVariableModel.meta.key)]: { // managed_dashboard_global_variable_project
        management: 'managed',
        key: _generateGVKey(ProjectVariableModel.meta.key),
        name: ProjectVariableModel.meta.name,
        method: 'dynamic',
        reference: {
            resourceType: ProjectVariableModel.meta.resourceType,
        },
        options: {
            selectionType: 'multi',
        },
    },
    [_generateGVKey(ServiceAccountVariableModel.meta.key)]: { // managed_dashboard_global_variable_service_account
        management: 'managed',
        key: _generateGVKey(ServiceAccountVariableModel.meta.key),
        name: ServiceAccountVariableModel.meta.name,
        method: 'dynamic',
        reference: {
            resourceType: ServiceAccountVariableModel.meta.resourceType,
        },
        options: {
            selectionType: 'multi',
        },
    },
    [_generateGVKey(RegionVariableModel.meta.key)]: { // managed_dashboard_global_variable_region
        management: 'managed',
        key: _generateGVKey(RegionVariableModel.meta.key),
        name: RegionVariableModel.meta.name,
        method: 'dynamic',
        reference: {
            resourceType: RegionVariableModel.meta.resourceType,
        },
        options: {
            selectionType: 'multi',
        },
    },
    [_generateGVKey(UserVariableModel.meta.key)]: { // managed_dashboard_global_variable_user
        management: 'managed',
        key: _generateGVKey(UserVariableModel.meta.key),
        name: UserVariableModel.meta.name,
        method: 'dynamic',
        reference: {
            resourceType: UserVariableModel.meta.resourceType,
        },
        options: {
            selectionType: 'multi',
        },
    },
};
