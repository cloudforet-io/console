<template>
    <section class="api-key-wrapper">
        <div class="flex">
            <p-breadcrumbs v-if="isAdmin" class="flex-grow" :routes="routeState.adminRoutes" />
            <p-breadcrumbs v-else class="flex-grow" :routes="routeState.userRoutes" />
            <handbook-button :tabs="tabState.tabs" :active-tab.sync="tabState.activeTab"
                             type="identity/user/api-key"
                             class="flex-shrink-0"
            >
                <template #spacectl>
                    <keep-alive>
                        <user-a-p-i-key-handbook />
                    </keep-alive>
                </template>
            </handbook-button>
        </div>
        <p-page-title :title="$t('IDENTITY.USER.MAIN.API_KEY')"
                      :title-info="$t('IDENTITY.USER.API_KEY.TITLE_INFO')" class="page-title"
        />
        <user-a-p-i-key-table
            :user-id="userId"
        />
        <p-pane-layout class="sub-table-wrapper">
            <div class="sub-table-header">
                {{ $t('IDENTITY.USER.MAIN.ENDPOINTS') }}
            </div>
            <p-data-table
                :items="items"
                :loading="loading"
                :fields="fields"
                :striped="false"
            />
        </p-pane-layout>
    </section>
</template>

<script lang="ts">
import {
    PBreadcrumbs, PDataTable, PPageTitle, PPaneLayout,
} from '@spaceone/design-system';
import HandbookButton from '@/common/modules/portals/HandbookButton.vue';
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import UserAPIKeyTable from '@/services/identity/user/user-api-key/modules/APIKeyTable.vue';
import { store } from '@/store';
import { TabItem } from '@spaceone/design-system/dist/src/navigation/tabs/tab/type';
import UserAPIKeyHandbook from '@/services/identity/user/user-api-key/modules/APIKeyHandbook.vue';

interface EndpointItem {
    endpoint: string;
    name: string;
    service: string;
    state?: string;
    version?: string;
}

export default {
    name: 'UserAPIKeyPage',
    components: {
        HandbookButton,
        UserAPIKeyTable,
        UserAPIKeyHandbook,
        PPaneLayout,
        PBreadcrumbs,
        PDataTable,
        PPageTitle,
    },
    setup(props) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            loading: true,
            fields: [
                { name: 'service', label: 'Service' },
                { name: 'name', label: 'Name' },
                { name: 'version', label: 'Version' },
                { name: 'endpoint', label: 'Endpoint' },
                { name: 'status', label: 'Status' },
            ],
            items: [] as EndpointItem[],
            userId: computed(() => store.state.user.userId),
            isAdmin: computed(() => store.getters['user/isAdmin']).value,
        });
        const routeState = reactive({
            userRoutes: computed(() => ([
                { name: vm.$t('IDENTITY.USER.MAIN.MY_ACCOUNT'), path: '/identity/user/account' },
                { name: vm.$t('IDENTITY.USER.MAIN.API_KEY') },
            ])),
            adminRoutes: computed(() => ([
                { name: vm.$t('MENU.IDENTITY.IDENTITY'), path: '/identity' },
                { name: vm.$t('MENU.IDENTITY.USER'), path: '/identity/user/user-management' },
                { name: vm.$t('IDENTITY.USER.MAIN.MY_ACCOUNT'), path: '/identity/user/account' },
                { name: vm.$t('IDENTITY.USER.MAIN.API_KEY') },
            ])),
        });
        const tabState = reactive({
            tabs: computed(() => ([
                { name: 'spacectl', label: 'Spacectl', keepAlive: true },
            ] as TabItem[])),
            activeTab: 'spacectl',
        });
        const listEndpoints = async () => {
            state.loading = true;
            try {
                const res = await SpaceConnector.client.identity.endpoint.list();
                state.items = [res.results.find(d => d.service === 'inventory')];
            } catch (e) {
                console.error(e);
            } finally {
                state.loading = false;
            }
        };

        (async () => {
            await listEndpoints();
        })();

        return {
            ...toRefs(state),
            routeState,
            tabState,
        };
    },

};
</script>

<style lang="postcss" scoped>
.page-title {
    align-items: center;
}
.sub-table-header {
    padding-left: 1rem;
    padding-top: 2rem;
    margin-bottom: 1rem;
    font-size: 1.375rem;
    line-height: 145%;
}
</style>
