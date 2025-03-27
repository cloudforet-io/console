<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';

import { PHeading, PTab } from '@cloudforet/mirinae';
import type { TabItem } from '@cloudforet/mirinae/types/navigation/tabs/tab/type';

import { i18n } from '@/translations';

import AlertDetailTabsDetails from '@/services/alert-manager/v1/components/AlertDetailTabsDetails.vue';
import AlertDetailTabsPushedEvent from '@/services/alert-manager/v1/components/AlertDetailTabsPushedEvent.vue';

const props = withDefaults(defineProps<{
    id: string;
}>(), {
    id: '',
});

const tabState = reactive({
    tabs: computed(() => ([
        { name: 'details', label: i18n.t('MONITORING.ALERT.DETAIL.DETAILS.ADDITIONAL_INFO') },
        { name: 'pushed-event', label: i18n.t('MONITORING.ALERT.DETAIL.PUSHED_EVENT.PUSHED_EVENT') },
    ] as TabItem[])),
    activeTab: 'details',
});
</script>

<template>
    <p-tab :tabs="tabState.tabs"
           :active-tab.sync="tabState.activeTab"
    >
        <template #pushed-event>
            <p-heading class="pt-8 px-4 pb-4"
                       heading-type="sub"
                       :title="$t('MONITORING.ALERT.DETAIL.PUSHED_EVENT.PUSHED_EVENT')"
            />
            <alert-detail-tabs-pushed-event :id="props.id" />
        </template>
        <template #details>
            <alert-detail-tabs-details :id="props.id" />
        </template>
    </p-tab>
</template>
