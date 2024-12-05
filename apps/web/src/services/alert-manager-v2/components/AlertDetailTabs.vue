<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';

import { PTab } from '@cloudforet/mirinae';
import type { TabItem } from '@cloudforet/mirinae/types/navigation/tabs/tab/type';

import { i18n } from '@/translations';

import AlertDetailTabsDetails from '@/services/alert-manager-v2/components/AlertDetailTabsDetails.vue';
import AlertDetailTabsTimeline from '@/services/alert-manager-v2/components/AlertDetailTabsTimeline.vue';

const tabState = reactive({
    tabs: computed<TabItem[]>(() => ([
        { name: 'details', label: i18n.t('ALERT_MANAGER.ALERTS.DETAILS') },
        { name: 'timeline', label: i18n.t('ALERT_MANAGER.ALERTS.TIMELINE') },
    ])),
    activeTab: 'details',
});
</script>

<template>
    <p-tab :tabs="tabState.tabs"
           :active-tab.sync="tabState.activeTab"
    >
        <template #details>
            <alert-detail-tabs-details />
        </template>
        <template #timeline>
            <alert-detail-tabs-timeline />
        </template>
    </p-tab>
</template>
