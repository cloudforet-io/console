<template>
    <p-tab :tabs="tabState.tabs" :active-tab.sync="tabState.activeTab"
           class="alert-detail-timeline"
    >
        <template #event-list>
            <p-panel-top>{{ $t('MONITORING.ALERT.DETAIL.EVENT_LIST.EVENT_LIST') }}</p-panel-top>
            <alert-detail-event-list :id="id" />
        </template>
    </p-tab>
</template>

<script lang="ts">
import { PPanelTop, PTab } from '@spaceone/design-system';
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive,
} from '@vue/composition-api';
import { TabItem } from '@spaceone/design-system/dist/src/navigation/tabs/tab/type';
import AlertDetailEventList from '@/views/monitoring/alert-manager/modules/alert-detail/AlertDetailEventList.vue';
import { i18n } from '@/translations';

export default {
    name: 'AlertDetailTimeline',
    components: {
        AlertDetailEventList,
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
                { name: 'event-list', label: i18n.t('MONITORING.ALERT.DETAIL.EVENT_LIST.EVENT_LIST') },
            ] as TabItem[])),
            activeTab: 'event-list',
        });
        return {
            tabState,
        };
    },
};


</script>

<style lang="postcss" scoped>
</style>
