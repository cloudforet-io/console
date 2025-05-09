<template>
    <div />
</template>

<script lang="ts">
import type { Vue } from 'vue/types/vue';

import { isEmpty } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { ROOT_ROUTE } from '@/router/constant';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import { locationQueryToString } from '@/lib/router-query-string';

import { NoSearchResourceError } from '@/common/composables/error/error';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';

const DEFAULT_URL = '/asset-inventory/cloud-service';

export default {
    name: 'CloudServiceTypeSearch',
    beforeRouteEnter(to, from, next) {
        const userWorkspaceStore = useUserWorkspaceStore();
        const currentWorkspaceId = userWorkspaceStore.getters.currentWorkspaceId;
        if (!currentWorkspaceId) {
            ErrorHandler.handleError('Not found workspace id. (CloudServiceTypeSearchPage.vue)');
            next({ name: ROOT_ROUTE._NAME });
            return;
        }
        (async () => {
            try {
                const result = await SpaceConnector.client.addOns.pageDiscovery.get({
                    resource_type: 'inventory.CloudServiceType',
                    search: to.params.id,
                });
                if (result.url === DEFAULT_URL || userWorkspaceStore.getters.currentWorkspaceId === undefined) {
                    ErrorHandler.handleError(new NoSearchResourceError({
                        name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.NO_RESOURCE._NAME,
                        params: {
                            workspaceId: currentWorkspaceId,
                        },
                    }));
                } else {
                    let link = `workspace/${userWorkspaceStore.getters.currentWorkspaceId}${result.url}`;
                    if (!isEmpty(to.query)) {
                        const queryString = locationQueryToString(to.query);
                        link += `?${queryString}`;
                    }
                    next((vm: Vue) => {
                        const targetLocation = vm.$router.match(link);
                        if (!targetLocation.name) {
                            ErrorHandler.handleError('Not found page. (CloudServiceTypeSearchPage.vue)');
                            return;
                        }
                        vm.$router.replace({
                            name: targetLocation.name,
                            params: targetLocation.params,
                            query: targetLocation.query,
                        });
                    });
                }
            } catch (e) {
                ErrorHandler.handleError(new NoSearchResourceError({
                    name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.NO_RESOURCE._NAME,
                    params: {
                        workspaceId: currentWorkspaceId,
                    },
                }));
            }
        })();
    },
    props: {
        id: {
            type: String,
            default: undefined,
        },
    },
};
</script>
