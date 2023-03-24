<template>
    <section class="api-key-wrapper">
        <p-heading :title="$t('IDENTITY.USER.MAIN.API_KEY')"
                   :title-info="$t('IDENTITY.USER.API_KEY.TITLE_INFO')"
                   class="page-title"
        />
        <user-a-p-i-key-table :user-id="userId" />
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
    computed, reactive, toRefs,
} from 'vue';

import {
    PDataTable, PHeading, PPaneLayout,
} from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { store } from '@/store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import UserAPIKeyTable from '@/services/my-page/my-account/user-api-key/modules/APIKeyTable.vue';

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
        UserAPIKeyTable,
        PPaneLayout,
        PDataTable,
        PHeading,
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
        });
        const listEndpoints = async () => {
            state.loading = true;
            try {
                const { results } = await SpaceConnector.client.identity.endpoint.list();
                state.items = results;
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
