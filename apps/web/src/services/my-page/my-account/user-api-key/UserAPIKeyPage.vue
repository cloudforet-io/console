<script lang="ts" setup>
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PDataTable, PHeading, PPaneLayout,
} from '@spaceone/design-system';
import {
    computed, reactive,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

import ErrorHandler from '@/common/composables/error/errorHandler';

import UserAPIKeyTable from '@/services/my-page/my-account/user-api-key/modules/APIKeyTable.vue';

interface EndpointItem {
    endpoint: string;
    name: string;
    service: string;
    state?: string;
    version?: string;
}

const store = useStore();
const { t } = useI18n();

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

</script>

<template>
    <section class="api-key-wrapper">
        <p-heading :title="t('IDENTITY.USER.MAIN.API_KEY')"
                   :title-info="t('IDENTITY.USER.API_KEY.TITLE_INFO')"
                   class="page-title"
        />
        <user-a-p-i-key-table :user-id="state.userId" />
        <p-pane-layout class="sub-table-wrapper">
            <div class="sub-table-header">
                {{ t('IDENTITY.USER.MAIN.ENDPOINTS') }}
            </div>
            <p-data-table
                :items="state.items"
                :loading="state.loading"
                :fields="state.fields"
                :striped="false"
            />
        </p-pane-layout>
    </section>
</template>

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
