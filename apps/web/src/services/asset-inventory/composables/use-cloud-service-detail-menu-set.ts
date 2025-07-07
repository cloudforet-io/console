import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { get } from 'lodash';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import type { LSBItem } from '@/common/modules/navigations/lsb/type';
import { MENU_ITEM_TYPE } from '@/common/modules/navigations/lsb/type';

import { useCloudServiceTypeListQuery } from '@/services/asset-inventory/composables/use-cloud-service-type-list-query';
import { getCloudServiceTypeQuery } from '@/services/asset-inventory/helpers/cloud-service-type-list-helper';
import { ADMIN_ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/admin/route-constant';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import type { CloudServiceDetailPageParams } from '@/services/asset-inventory/types/cloud-service-detail-page-type';

interface UseCloudServiceDetailLSBMenuSetOptions {
    params: ComputedRef<CloudServiceDetailPageParams>;
}


export const useCloudServiceDetailLSBMenuSet = ({ params }: UseCloudServiceDetailLSBMenuSetOptions) => {
    const provider = computed(() => params.value.provider);
    const group = computed(() => params.value.group);

    const appContextStore = useAppContextStore();
    const isAdminMode = computed<boolean>(() => appContextStore.getters.isAdminMode);

    const { data: cloudServiceTypeList } = useCloudServiceTypeListQuery({
        params: computed(() => ({
            query: getCloudServiceTypeQuery(provider.value, group.value),
        })),
        enabled: computed(() => !!provider.value && !!group.value && !!params.value?.name),
    });

    const menuSet = computed<LSBItem[]>(() => {
        const selectedItem = cloudServiceTypeList.value?.[0];
        const baseMenu: LSBItem[] = [
            {
                type: MENU_ITEM_TYPE.DIVIDER,
            },
        ];
        if (!selectedItem) return baseMenu;
        const results: LSBItem[] = [
            ...baseMenu,
            {
                type: MENU_ITEM_TYPE.BUTTON_TITLE,
                label: group.value,
                id: selectedItem?.group,
                isBackLink: true,
                to: { name: isAdminMode.value ? ADMIN_ASSET_INVENTORY_ROUTE.CLOUD_SERVICE._NAME : ASSET_INVENTORY_ROUTE.CLOUD_SERVICE._NAME },
                titleIcon: get(selectedItem, ['tags', 'spaceone:icon'], ''),
            },
        ];
        (cloudServiceTypeList.value || []).forEach((d) => {
            results.push({
                type: MENU_ITEM_TYPE.ITEM,
                label: d.name,
                id: d.cloud_service_type_key,
                to: {
                    name: isAdminMode.value ? ADMIN_ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME : ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
                    params: {
                        ...params.value,
                        name: d.name,
                    },
                },
            });
        });
        return results;
    });

    return {
        menuSet,
    };
};
