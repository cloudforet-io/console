<template>
    <p-tab :tabs="tabState.tabs" :active-tab.sync="tabState.activeTab"
           class="alert-detail-timeline"
    >
        <template #timeline>
            <p-panel-top>{{ $t('MONITORING.ALERT.DETAIL.TIMELINE.TIMELINE') }}</p-panel-top>
            <alert-detail-vertical-timeline />
        </template>
        <template #event-list>
            <p-panel-top>Event list</p-panel-top>
            <alert-detail-event-list />
        </template>
    </p-tab>
</template>

<script lang="ts">
import { PPanelTop, PTab } from '@spaceone/design-system';
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive,
} from '@vue/composition-api';
import { TabItem } from '@spaceone/design-system/dist/src/navigation/tabs/tab/type';
import AlertDetailVerticalTimeline
    from '@/views/monitoring/alert-manager/modules/alert-detail/AlertDetailVerticalTimeline.vue';
import AlertDetailEventList from '@/views/monitoring/alert-manager/modules/alert-detail/AlertDetailEventList.vue';

export default {
    name: 'AlertDetailTimeline',
    components: {
        AlertDetailEventList,
        AlertDetailVerticalTimeline,
        PTab,
        PPanelTop,
    },
    props: {
        id: {
            type: String,
            default: '',
        },
    },
    setup(props) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const tabState = reactive({
            tabs: computed(() => ([
                { name: 'timeline', label: vm.$t('MONITORING.ALERT.DETAIL.TIMELINE.TIMELINE') },
                { name: 'event-list', label: 'Event List' },
            ] as TabItem[])),
            activeTab: 'timeline',
        });
        return {
            tabState,
        };
    },
};


</script>

<style lang="postcss" scoped>
</style>
