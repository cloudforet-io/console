import { computed } from 'vue';

import { flatMap, groupBy, uniqBy } from 'lodash';

import type { CloudServiceTypeModel } from '@/api-clients/inventory/cloud-service-type/schema/model';

import { useCloudServiceAnalyzeQuery } from '@/services/asset-inventory/composables/use-cloud-service-analyze-query';
import { getCloudServiceAnalyzeQuery } from '@/services/asset-inventory/helpers/cloud-service-analyze-query-helper';

import { useCloudServiceTypeListQuery } from './use-cloud-service-type-list-query';


interface CloudServiceTypeListItem {
    group?: string;
    items?: CloudServiceTypeModel[];
}


export const useSecurityCloudServiceTypeList = () => {
    const { data: cloudServiceAnalyzeListData, isFetching: isCloudServiceAnalyzeListLoading } = useCloudServiceAnalyzeQuery({
        params: computed(() => ({
            query: getCloudServiceAnalyzeQuery([{ k: 'ref_cloud_service_type.labels', v: ['CSPM'], o: '=' }]),
        })),
    });

    const { data: cloudServiceTypeListData, isFetching: isCloudServiceTypeListLoading } = useCloudServiceTypeListQuery({
        params: {
            query: { only: ['cloud_service_type_id', 'name', 'group', 'provider', 'tags', 'cloud_service_type_key'] },
        },
    });


    const cloudServiceTypeList = computed<CloudServiceTypeListItem[]>(() => {
        const cloudServiceAnalyzeList = cloudServiceAnalyzeListData.value?.results;
        const _cloudServiceTypeList = cloudServiceTypeListData.value;
        if (cloudServiceAnalyzeList && _cloudServiceTypeList) {
            return Object.values(groupBy(cloudServiceAnalyzeList, 'cloud_service_group')).map((group) => {
                const items = flatMap(group, (listItem) => {
                    const cloudServiceTypeItem = _cloudServiceTypeList.filter((dataItem) => dataItem.group === listItem.cloud_service_group
                        && dataItem.provider === listItem.provider);
                    return uniqBy(cloudServiceTypeItem || [], 'name');
                });

                return {
                    group: group[0].cloud_service_group,
                    items,
                };
            });
        }
        return [];
    });

    return {
        cloudServiceTypeList,
        isLoading: computed(() => isCloudServiceAnalyzeListLoading.value || isCloudServiceTypeListLoading.value),
    };
};
