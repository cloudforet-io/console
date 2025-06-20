import type { RoleModel, BasicRoleModel } from '@/api-clients/identity/role/schema/model';
import { useReferenceDataModel } from '@/query/resource-query/reference-model/composables/use-reference-data-model';
import type {
    ReferenceItem, ReferenceMap,
} from '@/query/resource-query/reference-model/types/reference-type';
import { RESOURCE_CONFIG_MAP } from '@/query/resource-query/shared/contants/resource-config-map';


export type RoleReferenceItem = ReferenceItem<RoleModel|BasicRoleModel>;
export type RoleReferenceMap = ReferenceMap<RoleReferenceItem>;

export const useRoleReferenceModel = () => {
    const fetchOptions = {
        only: ['name', 'role_id', 'role_type'],
    };

    const {
        referenceMap,
    } = useReferenceDataModel<RoleModel|BasicRoleModel, RoleReferenceItem>(
        RESOURCE_CONFIG_MAP.role.resourceKey,
        (roleInfo: RoleModel|BasicRoleModel) => ({
            key: roleInfo.role_id,
            label: roleInfo.name,
            name: roleInfo.name,
            data: roleInfo,
        }),
        fetchOptions,
    );

    return {
        map: referenceMap,
    };
};
