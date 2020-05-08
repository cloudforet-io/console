<template>
    <p-widget-layout ref="widgetRef" class="health-dashboard" title="HEALTH DASHBOARD"
                     help="Health Dashboard"
    >
        <template #default>
            <div v-if="loading" class="flex items-center overflow-hidden">
                <p-skeleton width="2rem" height="2rem" class="mr-4" />
                <div class="grid grid-cols-1 gap-1 w-full">
                    <p-skeleton width="80%" height="0.625rem" />
                    <p-skeleton width="100%" height="0.625rem" />
                </div>
            </div>
            <div v-else-if="data.length === 0" class="h-full flex flex-col justify-center">
                <img class="w-40 mx-auto mb-4" src="@/assets/images/illust_astronaut_walking2.svg">
                <p class="no-issue-text">
                    No Issue
                </p>
            </div>
            <p-grid-layout v-else :items="data"
                           row-gap="0.5rem" column-gap="0"
                           :fix-column="1" card-height="auto"
                           card-min-width="0"
                           :card-class="() => []"
            >
                <template #card="{item, index}">
                    <p-selectable-item theme="card" @click="onItemClick(item.reference.external_link)">
                        <template #side>
                            &zwnj;
                        </template>
                        <template #contents>
                            <div v-tooltip.bottom="{content: item.group, delay: {show: 500}}" class="group-name">
                                {{ item.eventTypeCode }}
                                <p-i name="ic_external-link" width=".7rem" height=".7rem" />
                            </div>
                            <div v-tooltip.bottom="{content: item.name, delay: {show: 500}}" class="name">
                                <p-i v-if="item.eventTypeCategory === 'issue' || item.eventTypeCategory === 'investigation'" name="ic_wrench" width=".8rem"
                                     height=".8rem"
                                />
                                <p-i v-else name="ic_notification" width=".8rem"
                                     height=".8rem"
                                />
                                {{ item.eventTypeCategory }} / {{ item.region }}
                            </div>
                        </template>
                        <template #extra>
                            <div class="items-center">
                                <p class="count">
                                    {{ Math.abs(item.count) }}
                                </p>
                                <p class="count-info">
                                    entities
                                </p>
                            </div>
                        </template>
                    </p-selectable-item>
                </template>
            </p-grid-layout>
        </template>
    </p-widget-layout>
</template>

<script lang="ts">
import {
    computed, defineComponent, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import PWidgetLayout from '@/components/organisms/layouts/widget-layout/WidgetLayout.vue';
import PSelectableList from '@/components/organisms/lists/selectable-list/SelectableList.vue';
import PI from '@/components/atoms/icons/PI.vue';
import PGridLayout from '@/components/molecules/layouts/grid-layout/GridLayout.vue';
import PSelectableItem from '@/components/molecules/selectable-item/SelectableItem.vue';
import PSkeleton from '@/components/atoms/skeletons/Skeleton.vue';
import PTooltipButton from '@/components/organisms/buttons/tooltip-button/TooltipButton.vue';
import { fluentApi } from '@/lib/fluent-api';
import PLazyImg from '@/components/organisms/lazy-img/PLazyImg.vue';
// import {
//     DiffQueryAPI, DiffResponse, HistoryResponse, OPERATORS,
// } from '@/lib/fluent-api/statistics/toolset_origin';
import moment from 'moment';
import { getTimestamp } from '@/lib/util';
import { ProviderInfo, ProviderStoreType, useStore } from '@/store/toolset';
import { number } from '@storybook/addon-knobs';
import casual, { arrayOf } from '@/lib/casual';
import { UnwrapRef } from '@vue/composition-api/dist/reactivity';
import _ from 'lodash';
import { VTooltip } from 'v-tooltip';
import router from '@/routes';

export default defineComponent({
    name: 'HealthDashboard',
    components: {
        PWidgetLayout,
        PSelectableList,
        PI,
        PGridLayout,
        PSelectableItem,
        PSkeleton,
        PTooltipButton,
        PLazyImg,
    },
    setup(props, context) {
        const vm: any = getCurrentInstance();
        const projectId = computed<string>(() => context.root.$route.params.id as string);

        interface Data {
            eventTypeCode: string;
            eventTypeCategory: string;
            region: string;
            count: number;
        }

        interface StateInterface {
            data: Data[];
            loading: boolean;
            // widgetRef: any;
        }

        const state: UnwrapRef<StateInterface> = reactive({
            data: [],
            loading: true,
            // widgetRef: null,
        });

        const api = fluentApi.addons().awsHealth().list().setId(projectId.value)
            .setDateSubtractor(10);


        const getData = async (): Promise<void> => {
            state.loading = true;
            state.data = [];
            try {
                const res = await api.execute();
                state.data = res.data.logs.map(item => ({
                    eventTypeCode: item.eventTypeCode,
                    eventTypeCategory: item.eventTypeCategory,
                    region: item.region,
                    count: item.count,
                    ...item,
                }));
            } catch (e) {
                console.error(e);
            } finally {
                state.loading = false;
            }
        };

        setTimeout(() => {
            getData();
            console.log(vm.$el);
        }, 1000);

        return {
            ...toRefs(state),
            onItemClick(item) {
                console.log('item test', item)
                window.location.href = item;
            },
            // iconUrl: (item: Data): string => _.get(
            //     state.providers,
            //     `state.providers[${item.provider}].icon`,
            //     '',
            // ) as string,
        };
    },
});
</script>

<style lang="postcss" scoped>
.health-dashboard {
    background-color: rgba(theme('colors.white'), 0.8);
    &::v-deep .widget-contents {
        overflow-y: auto;
    }
}
.group-name {
    @apply text-base font-bold text-blue-700 mb-1 truncate leading-tight;
}
.name {
    @apply text-xs text-gray truncate leading-tight;
}
.count {
    @apply text-lg text-center font-bold;
}

.no-issue-text {
    @apply text-center text-gray-300;
    font-size: 1.5rem;
}

.count-info {
    @apply text-gray-400;
    font-size: .75rem;
}
.help {
    display: inline-flex;
    cursor: help;
}
</style>
