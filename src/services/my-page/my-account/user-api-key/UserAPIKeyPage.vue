<template>
    <section class="api-key-wrapper">
        <p-page-title :title="$t('IDENTITY.USER.MAIN.API_KEY')"
                      :title-info="$t('IDENTITY.USER.API_KEY.TITLE_INFO')" class="page-title"
        >
            <template #extra>
                <div class="flex">
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
    PDataTable, PPageTitle, PPaneLayout,
} from '@spaceone/design-system';
import HandbookButton from '@/common/modules/portals/HandbookButton.vue';
import {
    computed, reactive, toRefs,
} from '@vue/composition-api';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import UserAPIKeyTable from '@/services/my-page/my-account/user-api-key/modules/APIKeyTable.vue';
import { store } from '@/store';
import { TabItem } from '@spaceone/design-system/dist/src/navigation/tabs/tab/type';
import UserAPIKeyHandbook from '@/services/my-page/my-account/user-api-key/modules/APIKeyHandbook.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';

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
        PDataTable,
        PPageTitle,
    },
    setup() {
        const state = reactive({
            loading: true,
            fields: [
                { name: 'service', label: 'Service' },
                { name: 'name', label: 'Name' },
                { name: 'version', label: 'Version' },
                { name: 'endpoint', label: 'Endpoint' },
            ],
            items: [] as EndpointItem[],
            userId: computed(() => store.state.user.userId),
            isAdmin: computed(() => store.getters['user/isAdmin']).value,
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
                const { results } = await SpaceConnector.client.identity.endpoint.list();
                state.items = results.filter(d => d.service === 'inventory' || d.service === 'statistics' || d.service === 'monitoring'
                    || d.service === 'cost-analysis' || d.service === 'notification');
            } catch (e) {
                ErrorHandler.handleError(e);
                state.items = [];
            } finally {
                state.loading = false;
            }
        };

        (async () => {
            await listEndpoints();
        })();

        return {
            ...toRefs(state),
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
