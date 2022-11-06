import type { Action } from 'vuex';

import { find } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { CloudServiceDetailPageParams, CloudServiceTypeInfo } from '@/services/asset-inventory/cloud-service/cloud-service-detail/type';
import type { CloudServiceDetailStoreState } from '@/services/asset-inventory/store/cloud-service-detail/type';

export const setProviderGroupName: Action<CloudServiceDetailStoreState, any> = ({ commit }, { provider, group, name }: CloudServiceDetailPageParams) => {
    commit('setProvider', provider);
    commit('setGroup', group);
    commit('setName', name);
};

export const setCloudServiceTypeList: Action<CloudServiceDetailStoreState, any> = ({ commit }, typeList: CloudServiceTypeInfo[]) => {
    commit('setCloudServiceTypeList', typeList);
};

export const setSelectedItem: Action<CloudServiceDetailStoreState, any> = ({ state, commit }, name?: string) => {
    let selectedItem: CloudServiceTypeInfo|undefined;
    if (name) selectedItem = find(state.cloudServiceTypeList, { name });
    else selectedItem = state.cloudServiceTypeList[0];
    commit('setSelectedItem', selectedItem);
};

const cloudServiceTypeQuery = new ApiQueryHelper()
    .setOnly('cloud_service_type_id', 'name', 'group', 'provider', 'tags', 'is_primary', 'resource_type', 'cloud_service_type_key')
    .setMultiSort([{ key: 'is_primary', desc: true }, { key: 'name', desc: false }]);

const getCloudServiceTypeQuery = (provider: string, group: string) => {
    cloudServiceTypeQuery.setFilters([
        { k: 'provider', v: provider, o: '=' },
        { k: 'group', v: group, o: '=' },
    ]);
    return cloudServiceTypeQuery.data;
};

export const listCloudServiceTypeData: Action<CloudServiceDetailStoreState, any> = async ({ state, commit, dispatch }) => {
    try {
        const res = await SpaceConnector.client.inventory.cloudServiceType.list({
            query: getCloudServiceTypeQuery(state.provider, state.group),
        });
        commit('setCloudServiceTypeList', res.results);
        dispatch('setSelectedItem', state.name);
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};
