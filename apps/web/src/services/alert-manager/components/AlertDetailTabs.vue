<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';

import { PHeading, PTab } from '@spaceone/design-system';
import type { TabItem } from '@spaceone/design-system/types/navigation/tabs/tab/type';

import { i18n } from '@/translations';

import AlertDetailTabsDetails from '@/services/alert-manager/components/AlertDetailTabsDetails.vue';
import AlertDetailTabsPushedEvent from '@/services/alert-manager/components/AlertDetailTabsPushedEvent.vue';

const props = withDefaults(defineProps<{
    id: string;
}>(), {
    id: '',
});

const tabState = reactive({
    tabs: computed(() => ([
        { name: 'pushed-event', label: i18n.t('MONITORING.ALERT.DETAIL.PUSHED_EVENT.PUSHED_EVENT') },
        { name: 'details', label: i18n.t('MONITORING.ALERT.DETAIL.DETAILS.DETAILS') },
    ] as TabItem[])),
    activeTab: 'pushed-event',
});
</script>

<template>
    <p-tab :tabs="tabState.tabs"
           :active-tab.sync="tabState.activeTab"
    >
        <template #pushed-event>
            <p-heading heading-type="sub"
                       :title="$t('MONITORING.ALERT.DETAIL.PUSHED_EVENT.PUSHED_EVENT')"
            />
            <alert-detail-tabs-pushed-event :id="props.id" />
        </template>
        <template #details>
            <alert-detail-tabs-details :id="props.id" />
        </template>
    </p-tab>
</template>
