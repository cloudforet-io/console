<template>
    <p-pane-layout class="service-account-attached-general-accounts">
        <p-panel-top :title="$t('INVENTORY.SERVICE_ACCOUNT.DETAIL.ATTACHED_GENERAL_ACCOUNTS_TITLE')" />
        <div class="content-wrapper">
            <p-data-table :fields="fields" :items="items" sortable>
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

<script lang="ts">
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import {
    PPaneLayout,
    PPanelTop,
    PDataTable,
    PAnchor,
} from '@spaceone/design-system';
import {
    defineComponent, reactive, toRefs,
} from 'vue';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';

export default defineComponent({
    name: 'ServiceAccountAttachedGeneralAccounts',
    components: {
        PPaneLayout,
        PPanelTop,
        PDataTable,
        PAnchor,
    },
    props: {
        serviceAccountId: {
            type: String,
            default: undefined,
        },
    },
    setup(props) {
        const state = reactive({
            items: [] as any,
        });
        const fields = [
            { name: 'name', label: 'Name' },
            { name: 'service_account_id', label: 'Account ID' },
        ];

        const init = async () => {
            try {
                const { results } = await SpaceConnector.client.identity.serviceAccount.list({
                    trusted_service_account_id: props.serviceAccountId,
                });
                state.items = results;
            } catch (e) {
                ErrorHandler.handleError(e);
                state.items = [];
            }
        };

        (async () => {
            await init();
        })();

        return {
            ...toRefs(state),
            fields,
            ASSET_INVENTORY_ROUTE,
        };
    },
});
</script>
