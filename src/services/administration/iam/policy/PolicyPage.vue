<template>
    <section>
        <p-page-title
            title="Policy"
            use-total-count
            :total-count="1"
        >
            <template #extra>
                <router-link to="#">
                    <p-button style-type="primary-dark"
                              name="ic_plus_bold"
                    >
                        {{ $t('PLUGIN.COLLECTOR.MAIN.CREATE') }}
                    </p-button>
                </router-link>
            </template>
        </p-page-title>
        <policy-list-data-table />
    </section>
</template>

<script lang="ts">
import { PPageTitle, PButton } from '@spaceone/design-system';
import { ADMINISTRATION_ROUTE } from '@/services/administration/route-config';
import PolicyListDataTable from '@/services/administration/iam/policy/modules/PolicyListDataTable.vue';

export default {
    name: 'PolicyPage',
    components: {
        PPageTitle,
        PButton,
        PolicyListDataTable,
    },
    setup() {
        return {
            ADMINISTRATION_ROUTE,
        };
    },
};
</script>
