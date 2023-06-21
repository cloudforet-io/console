<script lang="ts" setup>

import { PHeading, PTab } from '@spaceone/design-system';
import type { TabItem } from '@spaceone/design-system/types/navigation/tabs/tab/type';
import {
    computed, reactive,
} from 'vue';
import { useI18n } from 'vue-i18n';

import AlertPushedEvent from '@/services/alert-manager/alert/alert-detail/modules/alert-pushed-event/AlertPushedEvent.vue';
import AlertDetails from '@/services/alert-manager/alert/alert-detail/modules/AlertDetails.vue';

interface Props {
    id: string;
}

defineProps<Props>();
const { t } = useI18n();

const tabState = reactive({
    tabs: computed(() => ([
        { name: 'pushed-event', label: t('MONITORING.ALERT.DETAIL.PUSHED_EVENT.PUSHED_EVENT') },
        { name: 'details', label: t('MONITORING.ALERT.DETAIL.DETAILS.DETAILS') },
    ] as TabItem[])),
    activeTab: 'pushed-event',
});

</script>

<template>
    <p-tab v-model:active-tab="tabState.activeTab"
           :tabs="tabState.tabs"
           class="alert-detail-timeline"
    >
        <template #pushed-event>
            <p-heading heading-type="sub"
                       :title="t('MONITORING.ALERT.DETAIL.PUSHED_EVENT.PUSHED_EVENT')"
            />
            <alert-pushed-event :id="id" />
        </template>
        <template #details>
            <alert-details :id="id" />
        </template>
    </p-tab>
</template>
