<template>
    <widget-frame v-bind="widgetFrameProps"
                  :currency="state.currency"
                  @refresh="handleRefresh"
    >
        <div class="widget-contents">
            <p-balloon-tab v-model="state.activeTab"
                           :tabs="state.tabs"
                           class="tab-container"
            />
            <widget-data-table :loading="state.loading"
                               :fields="state.tableFields"
                               :items="state.tableItems"
                               :style="{height: '100%'}"
            >
                <template #col-affected_projects-text="{value}">
                    {{ value.length ?? '--' }}
                </template>
                <template #detail-affected_projects="{value}">
                    <div class="popover-container">
                        <!--song-lang-->
                        <div class="popover-title">
                            {{ $t('Affected resources') }}
                        </div>
                        <p-divider class="divider" />
                        <div v-for="item in value"
                             :key="item"
                             class="popover-item"
                        >
                            <span>{{ item }}</span>
                        </div>
                    </div>
                </template>
            </widget-data-table>
        </div>
    </widget-frame>
</template>

<script setup lang="ts">
import type { ComputedRef } from 'vue';
import {
    computed, defineExpose,
    defineProps, reactive, toRefs,
} from 'vue';


import { PBalloonTab, PDivider } from '@spaceone/design-system';

import { store } from '@/store';
import { i18n } from '@/translations';

import type { Field } from '@/services/dashboards/widgets/_components/type';
import WidgetDataTable from '@/services/dashboards/widgets/_components/WidgetDataTable.vue';
import WidgetFrame from '@/services/dashboards/widgets/_components/WidgetFrame.vue';
import type { WidgetProps, WidgetExpose } from '@/services/dashboards/widgets/_configs/config';
import { useWidgetFrameProps } from '@/services/dashboards/widgets/_hooks/use-widget-frame-props';
// eslint-disable-next-line import/no-cycle
import { useWidgetState } from '@/services/dashboards/widgets/_hooks/use-widget-state';

interface Data {
    event: string;
    region_code: string;
    start_time: string;
    last_update_time: string;
    affected_projects: string[];
}

const props = defineProps<WidgetProps>();

const storeState = reactive({
    regionItems: computed(() => store.state.reference.region.items),
});

const state = reactive({
    ...toRefs(useWidgetState<Data[]>(props)),
    tabs: [
        { name: 'open_issues', label: i18n.t('Open issues') }, // song-lang
        { name: 'scheduled_changes', label: i18n.t('Scheduled changes') }, // song-lang
        { name: 'other_notifications', label: i18n.t('Other notifications') }, // song-lang
    ],
    activeTab: 'open_issues',
    tableFields: computed<Field[]>(() => [ // song-lang
        { label: 'Event', name: 'event' },
        { label: 'Region', name: 'region_code' },
        { label: 'Start time', name: 'start_time' },
        { label: 'Last update time', name: 'last_update_time' },
        {
            label: 'Affected projects',
            name: 'affected_projects',
            detailOptions: {
                enabled: true,
                type: 'popover',
            },
        },
    ]),
    tableItems: computed<Data[]>(() => state.data?.map((d) => ({
        ...d,
        region_code: storeState.regionItems[d.region_code]?.name,
    })) || []),
});

const widgetFrameProps:ComputedRef = useWidgetFrameProps(props, state);

const fetchData = async ():Promise<Data[]> => new Promise((resolve) => {
    setTimeout(() => {
        resolve([
            {
                event: 'Quicksight Operational Issue',
                start_time: '2021-09-01 00:00:00',
                last_update_time: '2021-09-01 00:00:00',
                region_code: 'us-east-1',
                affected_projects: ['project-aaa', 'project-bbb'],
            },
            {
                event: 'Quicksight Operational Issue2',
                start_time: '2021-09-01 00:00:00',
                last_update_time: '2021-09-01 00:00:00',
                region_code: 'us-east-1',
                affected_projects: ['project-aaa', 'project-bbb'],
            },
            {
                event: 'Quicksight Operational Issue3',
                start_time: '2021-09-01 00:00:00',
                last_update_time: '2021-09-01 00:00:00',
                region_code: 'us-east-1',
                affected_projects: ['project-aaa', 'project-bbb'],
            },
        ]);
    }, 2000);
});

const initWidget = async (data?: Data[]) => {
    state.loading = true;
    state.data = data ?? await fetchData();
    state.loading = false;
    return state.data;
};

const refreshWidget = async () => {
    state.loading = true;
    state.data = await fetchData();
    state.loading = false;
    return state.data;
};

const handleRefresh = () => {
    refreshWidget();
};

(() => {
    store.dispatch('reference/region/load');
})();

defineExpose<WidgetExpose<Data[]>>({
    initWidget,
    refreshWidget,
});

</script>
<style lang="postcss" scoped>
.widget-contents {
    padding: 0 1.5625rem;
    height: 100%;

    .tab-container {
        margin-bottom: 0.25rem;
    }

    .popover-container {
        padding-top: 0.59375rem;
        padding-bottom: 0.34375rem;
        .popover-title {
            @apply text-gray-500;
            font-size: 1rem;
            font-weight: 700;
        }
        .divider {
            margin: 0.75rem 0;
        }
        .popover-item {
            @apply text-gray-900;
            font-size: 0.875rem;
            font-weight: 400;
            margin-bottom: 0.5rem;

            &:last-child {
                margin-bottom: 0;
            }
        }
    }
}

</style>
