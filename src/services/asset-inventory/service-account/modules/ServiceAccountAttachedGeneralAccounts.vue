<template>
    <p-pane-layout class="service-account-attached-general-accounts">
        <p-panel-top :title="$t('INVENTORY.SERVICE_ACCOUNT.DETAIL.ATTACHED_GENERAL_ACCOUNTS_TITLE')" />
        <div class="content-wrapper">
            <p-data-table :fields="fields" />
        </div>
    </p-pane-layout>
</template>

<script lang="ts">
import {
    PPaneLayout,
    PPanelTop,
    PDataTable,
} from '@spaceone/design-system';
import {
    defineComponent,
} from 'vue';


export default defineComponent({
    name: 'ServiceAccountAttachedGeneralAccounts',
    components: {
        PPaneLayout,
        PPanelTop,
        PDataTable,
    },
    setup() {
        const fields = [
            { name: 'name', label: 'Name' },
            { name: 'account_id', label: 'Account ID' },
        ];

        return {
            fields,
        };
    },
});
</script>
