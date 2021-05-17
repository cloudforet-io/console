<template>
    <section class="right-contents-container">
        <p-breadcrumbs :routes="routeState.routes" />
        <p-page-title :title="$t('IDENTITY.USER.MAIN.API_KEY')"
                      :title-info="$t('IDENTITY.USER.MAIN.API_KEY_TITLE_INFO')"
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
    PEmpty, PI, PBreadcrumbs, PIconTextButton,
    PDropdownMenuBtn, PDataTable, PPageTitle, PPaneLayout, PTableCheckModal,
} from '@spaceone/design-system';
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import { SpaceConnector } from '@/lib/space-connector';
import { ApiQueryHelper } from '@/lib/space-connector/helper';
import UserAPIKeyTable from '@/views/identity/user/modules/UserAPIKeyTable.vue';
import {store} from "@/store";

export default {
    name: 'UserAPIKeyPage',
    components: {
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
            items: [] as any,
            userId: computed(() => store.state.user.userId),
        });
        const routeState = reactive({
            routes: computed(() => ([
                { name: vm.$t('MENU.IDENTITY.IDENTITY'), path: '/identity' },
                { name: vm.$t('MENU.IDENTITY.USER'), path: '/identity/user/account' },
                { name: vm.$t('IDENTITY.USER.MAIN.API_KEY') },
            ])),
        });
        const apiQueryHelper = new ApiQueryHelper();
        const listEndpoints = async () => {
            state.loading = true;
            try {
                const res = await SpaceConnector.client.identity.endpoint.list();
                state.items = res.results;
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
        };
    },

};
</script>

<style lang="postcss" scoped>
.sub-table-header {
    padding-left: 1rem;
    padding-top: 2rem;
    margin-bottom: 1rem;
    font-size: 1.375rem;
    line-height: 145%;
}
</style>
