import { find } from 'lodash';
import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import type { Query } from '@cloudforet/core-lib/space-connector/type';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { CloudServiceTypeInfo, CloudServiceDetailPageParams } from '@/services/asset-inventory/cloud-service/cloud-service-detail/type';


const _cloudServiceTypeQuery = new ApiQueryHelper()
    .setOnly('cloud_service_type_id', 'name', 'group', 'provider', 'tags', 'is_primary', 'resource_type', 'cloud_service_type_key')
    .setMultiSort([{ key: 'is_primary', desc: true }, { key: 'name', desc: false }]);
const _getCloudServiceTypeQuery = (provider: string, group: string): Query => {
    _cloudServiceTypeQuery.setFilters([
        { k: 'provider', v: provider, o: '=' },
        { k: 'group', v: group, o: '=' },
    ]);
    return _cloudServiceTypeQuery.data;
};

export const useCloudServiceDetailPageStore = defineStore('cloud-service-detail-page', {
    state: () => ({
        provider: '' as string,
        group: '' as string,
        name: undefined as undefined | string,
        cloudServiceTypeList: [] as CloudServiceTypeInfo[],
        selectedCloudServiceType: undefined as undefined | CloudServiceTypeInfo,
    }),
    actions: {
        async listCloudServiceTypeData() {
            try {
                const { results } = await SpaceConnector.client.inventory.cloudServiceType.list({
                    query: _getCloudServiceTypeQuery(this.provider, this.group),
                });
                this.cloudServiceTypeList = results;
                await this.setSelectedCloudServiceType(this.name);
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        },
        async setSelectedCloudServiceType(name?: string) {
            if (name) this.selectedCloudServiceType = find(this.cloudServiceTypeList, { name });
            else this.selectedCloudServiceType = this.cloudServiceTypeList[0];
        },
        setProviderGroupName({ provider, group, name }: CloudServiceDetailPageParams) {
            this.provider = provider;
            this.group = group;
            this.name = name;
        },
    },
});
