<template>
    <section>
        <p-page-title
            :title="$t('IAM.POLICY.POLICY')"
            use-total-count
            :total-count="totalCount"
        >
            <template #extra>
                <router-link :to="{name: ADMINISTRATION_ROUTE.IAM.POLICY.CREATE._NAME}">
                    <p-button style-type="primary-dark"
                              name="ic_plus_bold"
                    >
                        {{ $t('PLUGIN.COLLECTOR.MAIN.CREATE') }}
                    </p-button>
                </router-link>
            </template>
        </p-page-title>
        <policy-list-data-table :anchor-icon-visible="false" @update-total-count="handleUpdate" />
    </section>
</template>

<script lang="ts">
import { PPageTitle, PButton } from '@spaceone/design-system';
import { ADMINISTRATION_ROUTE } from '@/services/administration/route-config';
import PolicyListDataTable from '@/services/administration/modules/PolicyListDataTable.vue';
import { reactive, toRefs } from '@vue/composition-api';

export default {
    name: 'PolicyPage',
    components: {
        PPageTitle,
        PButton,
        PolicyListDataTable,
    },
    setup() {
        const state = reactive({
            totalCount: 0,
        });

        const handleUpdate = (value: number) => { state.totalCount = value; };

        return {
            ...toRefs(state),
            ADMINISTRATION_ROUTE,
            handleUpdate,
        };
    },
};
</script>
