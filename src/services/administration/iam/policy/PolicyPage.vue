<template>
    <section>
        <p-page-title
            title="Policy"
            use-total-count
            :total-count="1"
        >
            <template #extra>
                <router-link to="#">
                    <p-icon-text-button
                        style-type="primary-dark"
                        name="ic_plus_bold"
                    >
                        {{ $t('PLUGIN.COLLECTOR.MAIN.CREATE') }}
                    </p-icon-text-button>
                </router-link>
            </template>
        </p-page-title>
        <policy-list-data-table />
    </section>
</template>

<script lang="ts">
import { PPageTitle, PIconTextButton } from '@spaceone/design-system';
import { ADMINISTRATION_ROUTE } from '@/services/administration/route-config';
import PolicyListDataTable from '@/services/administration/iam/policy/modules/PolicyListDataTable.vue';

export default {
    name: 'PolicyPage',
    components: {
        PPageTitle,
        PIconTextButton,
        PolicyListDataTable,
    },
    setup() {
        return {
            ADMINISTRATION_ROUTE,
        };
    },
};
</script>
