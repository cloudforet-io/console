<template>
    <p-tab :tabs="tabState.tabs" :active-tab.sync="tabState.activeTab"
           class="alert-detail-timeline"
    >
        <template #timeline>
            <p-panel-top>{{$t('MONITORING.ALERT.DETAIL.TIMELINE')}}</p-panel-top>
            <ul class="timeline-wrapper">
                <li class="timeline-item">
                    <span class="date">2021/05/17 17:33</span>
                    <span class="content">ljh@mz.co.kr (이제훈) updated urgency to low</span>
                </li>
                <li class="timeline-item">
                    <span class="date">2021/05/17 17:33</span>
                    <span class="content">ljh@mz.co.kr (이제훈) updated urgency to low</span>
                </li>
            </ul>

        </template>
    </p-tab>
</template>

<script lang="ts">
import { PPanelTop, PTab } from '@spaceone/design-system';
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive,
} from '@vue/composition-api';
import { TabItem } from '@spaceone/design-system/dist/src/navigation/tabs/tab/type';

export default {
    name: 'AlertDetailTimeline',
    components: {
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
                { name: 'timeline', label: vm.$t('MONITORING.ALERT.DETAIL.TIMELINE') },
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
.timeline-wrapper {
    display: flex;
    padding-left: 1rem;
    flex-direction: column;
    gap: 1rem;
}
.timeline-item {
    display: inherit;
    gap: 2rem;
    .date {
        @apply text-gray-500;
        font-size: 0.875rem;
        line-height: 170%;
    }
    .content {
        font-size: 0.875rem;
        line-height: 170%;
    }
}
</style>
