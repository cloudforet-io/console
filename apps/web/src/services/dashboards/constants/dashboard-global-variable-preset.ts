import ProjectVariableModel from '@/lib/variable-models/managed-model/resource-model/project-variable-model';
import RegionVariableModel from '@/lib/variable-models/managed-model/resource-model/region-variable-model';
import ServiceAccountVariableModel
    from '@/lib/variable-models/managed-model/resource-model/service-account-variable-model';
import UserVariableModel from '@/lib/variable-models/managed-model/resource-model/user-variable-model';



export const DASHBOARD_GLOBAL_VARIABLES_PRESET_LIST = [
    {
        name: ProjectVariableModel.meta.resourceType,
        label: ProjectVariableModel.meta.name,
    },
    {
        name: ServiceAccountVariableModel.meta.resourceType,
        label: ServiceAccountVariableModel.meta.name,
    },
    {
        name: RegionVariableModel.meta.resourceType,
        label: RegionVariableModel.meta.name,
    },
    {
        name: UserVariableModel.meta.resourceType,
        label: UserVariableModel.meta.name,
    },
] as const;
