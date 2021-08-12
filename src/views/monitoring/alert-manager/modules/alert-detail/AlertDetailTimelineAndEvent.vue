<template>
    <p-tab :tabs="tabState.tabs" :active-tab.sync="tabState.activeTab"
           class="alert-detail-timeline"
    >
        <template #pushed-event>
            <p-panel-top>{{ $t('MONITORING.ALERT.DETAIL.EVENT_LIST.PUSHED_EVENT') }}</p-panel-top>
            <alert-detail-pushed-event :id="id" />
        </template>
    </p-tab>
</template>

<script lang="ts">
import { PPanelTop, PTab } from '@spaceone/design-system';
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive,
} from '@vue/composition-api';
import { TabItem } from '@spaceone/design-system/dist/src/navigation/tabs/tab/type';
import AlertDetailPushedEvent from '@/views/monitoring/alert-manager/modules/alert-detail/AlertDetailPushedEvent.vue';
import { i18n } from '@/translations';

export default {
    name: 'AlertDetailTimelineAndEvent',
    components: {
        AlertDetailPushedEvent,
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
                { name: 'pushed-event', label: i18n.t('MONITORING.ALERT.DETAIL.EVENT_LIST.PUSHED_EVENT') },
            ] as TabItem[])),
            activeTab: 'pushed-event',
        });
        return {
            tabState,
        };
    },
};


</script>

<style lang="postcss" scoped>
</style>
