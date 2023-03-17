<template>
    <p-tab :tabs="tabState.tabs"
           :active-tab.sync="tabState.activeTab"
           class="alert-detail-timeline"
    >
        <template #pushed-event>
            <p-heading heading-type="sub"
                       :title="$t('MONITORING.ALERT.DETAIL.PUSHED_EVENT.PUSHED_EVENT')"
            />
            <alert-pushed-event :id="id" />
        </template>
        <template #details>
            <alert-details :id="id" />
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

import AlertPushedEvent from '@/services/alert-manager/alert/alert-detail/modules/alert-pushed-event/AlertPushedEvent.vue';
import AlertDetails from '@/services/alert-manager/alert/alert-detail/modules/AlertDetails.vue';

export default {
    name: 'AlertTimelineAndEvent',
    components: {
        AlertPushedEvent,
        AlertDetails,
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
