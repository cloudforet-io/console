<script setup lang="ts">
import { PHeading, PButton } from '@spaceone/design-system';
import {
    onUnmounted, reactive,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { useManagePermissionState } from '@/common/composables/page-manage-permission';

import PolicyListDataTable from '@/services/administration/modules/PolicyListDataTable.vue';
import { ADMINISTRATION_ROUTE } from '@/services/administration/route-config';
import { usePolicyStore } from '@/services/administration/store/policy-page-store';


const policyStore = usePolicyStore();
const policyState = policyStore.$state;

const { t } = useI18n();
const router = useRouter();

const state = reactive({
    hasManagePermission: useManagePermissionState(),
});

onUnmounted(() => {
    policyStore.$dispose();
    policyStore.$reset();
});
</script>

<template>
    <section>
        <p-heading
            :title="t('IAM.POLICY.POLICY')"
            use-total-count
            :total-count="policyState.totalCount"
        >
            <template #extra>
                <p-button style-type="primary"
                          icon-left="ic_plus_bold"
                          :disabled="!state.hasManagePermission"
                          @click="router.push({ name: ADMINISTRATION_ROUTE.IAM.POLICY.CREATE._NAME })"
                >
                    {{ t('PLUGIN.COLLECTOR.MAIN.CREATE') }}
                </p-button>
            </template>
        </p-heading>
        <policy-list-data-table hide-anchor-icon />
    </section>
</template>
