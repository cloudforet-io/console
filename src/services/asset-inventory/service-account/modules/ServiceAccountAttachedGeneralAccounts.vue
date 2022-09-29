<template>
    <p-pane-layout class="service-account-attached-general-accounts">
        <p-panel-top :title="$t('INVENTORY.SERVICE_ACCOUNT.DETAIL.ATTACHED_GENERAL_ACCOUNTS_TITLE')" />
        <div class="content-wrapper">
            <p-data-table :fields="fields" :items="items"
                          sortable
                          sort-by:="name"
                          :sort-desc="true"
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

<script lang="ts">
import type { PropType } from 'vue';
import {
    defineComponent, reactive, toRefs,
} from 'vue';

import {
    PPaneLayout,
    PPanelTop,
    PDataTable,
    PAnchor,
} from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';
import type { ServiceAccountModel } from '@/services/asset-inventory/service-account/type';

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
        attachedGeneralAccounts: {
            type: Array as PropType<ServiceAccountModel[]>,
            default: () => ([]),
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            items: [] as any,
        });
        const fields = [
            { name: 'name', label: 'Name', sortable: true },
            { name: 'service_account_id', label: 'Account ID', sortable: false },
        ];

        const init = async () => {
            try {
                const { results } = await SpaceConnector.client.identity.serviceAccount.list({
                    trusted_service_account_id: props.serviceAccountId,
                });
                state.items = results;
                emit('update:attached-general-accounts', results);
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
