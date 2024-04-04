import { find, uniqBy } from 'lodash';
import { defineStore } from 'pinia';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { CloudServiceTypeListParameters } from '@/schema/inventory/cloud-service-type/api-verbs/list';
import type { CloudServiceTypeModel } from '@/schema/inventory/cloud-service-type/model';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { getCloudServiceTypeQuery } from '@/services/asset-inventory/helpers/cloud-service-type-list-helper';
import type { CloudServiceDetailPageParams } from '@/services/asset-inventory/types/cloud-service-detail-page-type';

export const useCloudServiceDetailPageStore = defineStore('page-cloud-service-detail', {
    state: () => ({
        provider: '' as string,
        group: '' as string,
        name: undefined as undefined | string,
        cloudServiceTypeList: [] as CloudServiceTypeModel[],
        selectedCloudServiceType: undefined as undefined | CloudServiceTypeModel,
        searchFilters: [] as ConsoleFilter[],
    }),
    getters: {
        sheetNamePrefix: (state) => (`${state.provider}_${state.group}_${state.name}`.replace(/\//g, '')).toLowerCase(),
    },
    actions: {
        async listCloudServiceTypeData() {
            try {
                const { results } = await SpaceConnector.clientV2.inventory.cloudServiceType.list<CloudServiceTypeListParameters, ListResponse<CloudServiceTypeModel>>({
                    query: getCloudServiceTypeQuery(this.provider, this.group),
                });
                this.cloudServiceTypeList = uniqBy(results || [], 'cloud_service_type_key');
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
