<template>
    <section class="right-contents-container">
        <p-breadcrumbs :routes="routeState.routes" />
        <p-page-title :title="$t('IDENTITY.USER.MAIN.API_KEY')"
                      :title-info="$t('IDENTITY.USER.MAIN.API_KEY_TITLE_INFO')" class="page-title"
        >
            <template #extra>
                <handbook-button :tabs="tabState.tabs" :active-tab.sync="tabState.activeTab"
                                 type="identity/user/api-key"
                >
                    <template #tab1>
                        <keep-alive>
                            <p>test</p>
                        </keep-alive>
                    </template>
                    <template #tab2>
                        <p> this tab is</p>
                    </template>
                    <template #tab3>
                        <p> this tab is</p>
                    </template>
                </handbook-button>
            </template>
        </p-page-title>
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
import HandbookButton from '@/common/components/HandbookButton.vue';
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import { SpaceConnector } from '@/lib/space-connector';
import UserAPIKeyTable from '@/views/identity/user/modules/UserAPIKeyTable.vue';
import { store } from '@/store';
import { TabItem } from '@spaceone/design-system/dist/src/navigation/tabs/tab/type';

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
        });
        const routeState = reactive({
            routes: computed(() => ([
                { name: vm.$t('MENU.IDENTITY.IDENTITY'), path: '/identity' },
                { name: vm.$t('MENU.IDENTITY.USER'), path: '/identity/user/account' },
                { name: vm.$t('IDENTITY.USER.MAIN.API_KEY') },
            ])),
        });
        const tabState = reactive({
            tabs: computed(() => ([
                { name: 'tab1', label: 'Spacectl', keepAlive: true },
            ] as TabItem[])),
            activeTab: 'tab1',
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
