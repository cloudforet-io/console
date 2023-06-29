<script lang="ts" setup>


import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PPaneLayout,
    PHeading,
    PDataTable,
    PAnchor,
} from '@spaceone/design-system';
import {
    reactive,
} from 'vue';
import { useI18n } from 'vue-i18n';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';
import type { ServiceAccountModel } from '@/services/asset-inventory/service-account/type';

interface Props {
    serviceAccountId?: string;
    attachedGeneralAccounts?: ServiceAccountModel[];
}

const props = withDefaults(defineProps<Props>(), {
    serviceAccountId: undefined,
    attachedGeneralAccounts: () => [],
});
const emit = defineEmits<{(e: 'update:attached-general-accounts', value: any): void}>();
const { t } = useI18n();

const state = reactive({
    loading: true,
    items: [] as any,
    sortBy: 'name',
    sortDesc: true,
});
const fields = [
    { name: 'name', label: 'Name', sortable: true },
    { name: 'service_account_id', label: 'Account ID', sortable: false },
];

const apiQueryHelper = new ApiQueryHelper();
const getAttachedGeneralAccountList = async () => {
    state.loading = true;
    try {
        const { results } = await SpaceConnector.client.identity.serviceAccount.list({
            trusted_service_account_id: props.serviceAccountId,
            query: apiQueryHelper.setSort(state.sortBy, state.sortDesc).data,
        });
        state.items = results;
        emit('update:attached-general-accounts', results);
    } catch (e) {
        ErrorHandler.handleError(e);
        state.items = [];
    } finally {
        state.loading = false;
    }
};

const handleChange = async (sortBy, sortDesc) => {
    state.sortBy = sortBy;
    state.sortDesc = sortDesc;
    try {
        await getAttachedGeneralAccountList();
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

const init = async () => {
    await getAttachedGeneralAccountList();
};

(async () => {
    await init();
})();

</script>

<template>
    <p-pane-layout class="service-account-attached-general-accounts">
        <p-heading heading-type="sub"
                   :title="t('INVENTORY.SERVICE_ACCOUNT.DETAIL.ATTACHED_GENERAL_ACCOUNTS_TITLE')"
        />
        <div class="content-wrapper">
            <p-data-table :fields="fields"
                          :items="state.items"
                          sortable
                          :loading="state.loading"
                          :sort-by="state.sortBy"
                          :sort-desc="state.sortDesc"
                          @change-sort="handleChange"
            >
                <template #col-name-format="{value, item}">
                    <p-anchor
                        :to="{
                            name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT.DETAIL._NAME,
                            params: { serviceAccountId: item.service_account_id },
                        }"
                    >
                        {{ value }}
                    </p-anchor>
                </template>
            </p-data-table>
        </div>
    </p-pane-layout>
</template>
