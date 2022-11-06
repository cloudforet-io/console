<template>
    <p-tab :tabs="tabState.tabs"
           :active-tab.sync="tabState.activeTab"
           class="alert-detail-timeline"
    >
        <template #pushed-event>
            <p-panel-top>{{ $t('MONITORING.ALERT.DETAIL.PUSHED_EVENT.PUSHED_EVENT') }}</p-panel-top>
            <alert-pushed-event :id="id" />
        </template>
        <template #details>
            <alert-details :id="id"
                           :alert-data="alertData"
            />
        </template>
    </p-tab>
</template>

<script lang="ts">

import {
    computed, reactive,
} from 'vue';

import { PPanelTop, PTab } from '@spaceone/design-system';
import type { TabItem } from '@spaceone/design-system/dist/src/navigation/tabs/tab/type';

import { i18n } from '@/translations';

import AlertPushedEvent from '@/services/alert-manager/alert/alert-detail/modules/alert-pushed-event/AlertPushedEvent.vue';
import AlertDetails from '@/services/alert-manager/alert/alert-detail/modules/AlertDetails.vue';

export default {
    name: 'AlertTimelineAndEvent',
    components: {
        AlertPushedEvent,
        AlertDetails,
        PTab,
        PPanelTop,
    },
    props: {
        id: {
            type: String,
            default: '',
        },
        alertData: {
            type: Object,
            default: () => ({}),
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
