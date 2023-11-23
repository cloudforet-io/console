<template>
    <p-tab :tabs="tabState.tabs"
           :active-tab.sync="tabState.activeTab"
    >
        <template #pushed-event>
            <p-heading heading-type="sub"
                       :title="$t('MONITORING.ALERT.DETAIL.PUSHED_EVENT.PUSHED_EVENT')"
            />
            <alert-detail-tabs-pushed-event :id="id" />
        </template>
        <template #details>
            <alert-detail-tabs-details :id="id" />
        </template>
    </p-tab>
</template>

<script lang="ts">
import {
    computed, reactive,
} from 'vue';

import { PHeading, PTab } from '@spaceone/design-system';
import type { TabItem } from '@spaceone/design-system/types/navigation/tabs/tab/type';

import { i18n } from '@/translations';

import AlertDetailTabsDetails from '@/services/alert-manager/components/AlertDetailTabsDetails.vue';
import AlertDetailTabsPushedEvent from '@/services/alert-manager/components/AlertDetailTabsPushedEvent.vue';

export default {
    name: 'AlertDetailTabs',
    components: {
        AlertDetailTabsPushedEvent,
        AlertDetailTabsDetails,
        PTab,
        PHeading,
    },
    props: {
        id: {
            type: String,
            default: '',
        },
    },
    setup() {
        const tabState = reactive({
            tabs: computed(() => ([
                { name: 'pushed-event', label: i18n.t('MONITORING.ALERT.DETAIL.PUSHED_EVENT.PUSHED_EVENT') },
                { name: 'details', label: i18n.t('MONITORING.ALERT.DETAIL.DETAILS.DETAILS') },
            ] as TabItem[])),
            activeTab: 'pushed-event',
        });
        return {
            tabState,
        };
    },
};

</script>
