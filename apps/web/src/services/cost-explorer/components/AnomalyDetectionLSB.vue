<script setup lang="ts">
import { computed, reactive } from 'vue';

import { i18n } from '@/translations';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import { MENU_ID } from '@/lib/menu/config';

import LSB from '@/common/modules/navigations/lsb/LSB.vue';
import type { LSBMenu } from '@/common/modules/navigations/lsb/type';
import { MENU_ITEM_TYPE } from '@/common/modules/navigations/lsb/type';

import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';

const MENU_ITEMS = [
    {
        name: i18n.t('BILLING.COST_MANAGEMENT.ANOMALY_DETECTION.CONFIG.TITLE'),
        to: COST_EXPLORER_ROUTE.ANOMALY_DETECTION.CONFIGURATION._NAME,
        id: MENU_ID.ANOMALY_DETECTION_CONFIGURATION,
    },
    {
        name: i18n.t('BILLING.COST_MANAGEMENT.ANOMALY_DETECTION.POLICY.TITLE'),
        to: COST_EXPLORER_ROUTE.ANOMALY_DETECTION.POLICY._NAME,
        id: MENU_ID.ANOMALY_DETECTION_POLICY,
    },
    {
        name: i18n.t('BILLING.COST_MANAGEMENT.ANOMALY_DETECTION.HISTORY.TITLE'),
        to: COST_EXPLORER_ROUTE.ANOMALY_DETECTION.HISTORY._NAME,
        id: MENU_ID.ANOMALY_DETECTION_HISTORY,
    },
];

const userWorkspaceStore = useUserWorkspaceStore();
const userWorkspaceGetters = userWorkspaceStore.getters;

const storeState = reactive({
    currentWorkspaceId: computed(() => userWorkspaceGetters.currentWorkspaceId),
});

const state = reactive({
    menuSet: computed<LSBMenu[]>(() => MENU_ITEMS.map((i) => ({
        type: MENU_ITEM_TYPE.ITEM,
        label: i.name,
        id: i.id,
        to: {
            name: i.to,
            params: { workspaceId: storeState.currentWorkspaceId || '' },
        },
    }))),
});
</script>

<template>
    <l-s-b :menu-set="state.menuSet" />
</template>
