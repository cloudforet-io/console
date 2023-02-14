<template>
    <section>
        <p-heading
            :title="$t('IAM.POLICY.POLICY')"
            use-total-count
            :total-count="totalCount"
        >
            <template #extra>
                <p-button style-type="primary"
                          icon-left="ic_plus_bold"
                          :disabled="!hasManagePermission"
                          @click="$router.push({ name: ADMINISTRATION_ROUTE.IAM.POLICY.CREATE._NAME })"
                >
                    {{ $t('PLUGIN.COLLECTOR.MAIN.CREATE') }}
                </p-button>
            </template>
        </p-heading>
        <policy-list-data-table :anchor-icon-visible="false" />
    </section>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs,
} from 'vue';

import { PHeading, PButton } from '@spaceone/design-system';

import { useManagePermissionState } from '@/common/composables/page-manage-permission';

import PolicyListDataTable from '@/services/administration/modules/PolicyListDataTable.vue';
import { ADMINISTRATION_ROUTE } from '@/services/administration/route-config';
import { administrationStore } from '@/services/administration/store';

export default {
    name: 'PolicyPage',
    components: {
        PHeading,
        PButton,
        PolicyListDataTable,
    },
    setup() {
        const state = reactive({
            totalCount: computed(() => administrationStore.state.policy.totalCount),
            hasManagePermission: useManagePermissionState(),
        });

        return {
            ...toRefs(state),
            ADMINISTRATION_ROUTE,
        };
    },
};
</script>
