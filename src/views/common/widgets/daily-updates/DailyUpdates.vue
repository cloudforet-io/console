<template>
    <p-widget-layout ref="widgetRef" class="daily-updates" title="Daily Updates"
                     help="Daily Updates"
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
                <img :src="'./images/illust_no-update.svg'" class="mb-4 flex-shrink-0 ">
                <img :src="'./images/illust_list.svg'" class="hidden lg:block">
            </div>
            <p-grid-layout v-else :items="data"
                           row-gap="0.5rem" column-gap="0"
                           :fix-column="1" card-height="auto"
                           card-min-width="0"
                           :card-class="() => []"
            >
                <template #card="{item, index}">
                    <p-selectable-item :icon-url="iconUrl(item)" theme="card" @click="onItemClick(item, idx)">
                        <template #contents>
                            <div v-tooltip.bottom="{content: item.group, delay: {show: 500}}" class="group-name">
                                {{ item.group }}
                            </div>
                            <div v-tooltip.bottom="{content: item.name, delay: {show: 500}}" class="name">
                                {{ item.name }}
                            </div>
                        </template>
                        <template #extra>
                            <div class="inline-flex items-center">
                                <p-i :name="getIcon(item.count)" height="0.75rem" width="0.75rem" />
                                <span class="count">{{ Math.abs(item.count) }}</span>
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
import moment from 'moment';
import { getTimestamp } from '@/lib/util';
import { ProviderInfo, ProviderStoreType, useStore } from '@/store/toolset';
import casual, { arrayOf } from '@/lib/casual';
import { UnwrapRef } from '@vue/composition-api/dist/reactivity';
import _ from 'lodash';

export default defineComponent({
    name: 'DailyUpdates',
    components: {
        PWidgetLayout,
        PSelectableList,
        PI,
        PGridLayout,
        PSelectableItem,
        PSkeleton,
        PTooltipButton,
    },
    setup() {
        const vm: any = getCurrentInstance();

        const {
            provider,
        } = useStore();
        const providerStore: ProviderStoreType = provider;

        interface CloudService {
            provider: string;
            // eslint-disable-next-line camelcase
            cloud_service_type: string;
            // eslint-disable-next-line camelcase
            cloud_service_group: string;
            count: number;
        }

        interface Server {
            count: number;
        }

        interface Data {
            group: string;
            name?: string;
            count: number;
            provider?: string;
        }

        interface StateInterface {
            serverData: Server[];
            cloudServiceData: CloudService[];
            data: Data[];
            loading: boolean;
            providers: ProviderInfo;
            widgetRef: any;
        }

        const state: UnwrapRef<StateInterface> = reactive({
            serverData: [],
            cloudServiceData: [],
            data: [],
            loading: true,
            providers: computed(() => providerStore.state.providers),
            widgetRef: null,
        });


        // const serverApi = fluentApi.statisticsTest().history().diff<Server>()
        //     .setTopic('inventory_server_daily_diff')
        //     .setFrom(getTimestamp(moment().subtract(1, 'day')))
        //     .setField('count');

        const getServerData = async (): Promise<void> => {
            try {
                // const res = await serverApi.execute();
                // state.serverData = res.data.values;
            } catch (e) {
                state.serverData = [{
                    count: casual.integer(-30, 30),
                }];
            }
        };

        // const cloudServiceApi = fluentApi.statisticsTest().history().diff<CloudService>()
        //     .setTopic('inventory_cloud_service_daily_diff')
        //     .setGroupBy('cloud_service_type', 'cloud_service_group', 'provider')
        //     .setFrom(getTimestamp(moment().subtract(1, 'day')))
        //     .setField('count');

        const getCloudServiceData = async (): Promise<void> => {
            try {
                // const res = await cloudServiceApi.execute();
                // state.cloudServiceData = res.data.values;
            } catch (e) {
                state.cloudServiceData = arrayOf(casual.integer(5, 15), () => ({
                    provider: casual.random_element(['aws', 'azure', 'google_cloud']),
                    // eslint-disable-next-line camelcase
                    cloud_service_type: casual.title,
                    // eslint-disable-next-line camelcase
                    cloud_service_group: casual.full_name,
                    count: casual.integer(-30, 30),
                })) as CloudService[];
            }
        };


        const getData = async (): Promise<void> => {
            state.loading = true;
            await providerStore.getProvider();
            state.data = [];
            await Promise.all([getServerData(), getCloudServiceData()]);
            state.data = [
                ...state.serverData.map(d => ({
                    group: 'Server',
                    count: d.count,
                })),
                ...state.cloudServiceData.map(d => ({
                    group: d.cloud_service_group,
                    name: d.cloud_service_type,
                    count: d.count,
                    provider: d.provider,
                })),
            ];
            state.loading = false;
        };

        setTimeout(() => {
            getData();
            console.log(vm.$el);
        }, 1000);

        return {
            ...toRefs(state),
            onItemClick(item) {
                vm.$router.push('/identity/service-account');
            },
            iconUrl: (item: Data): string => _.get(
                state.providers,
                `state.providers[${item.provider}].icon`,
                '',
            ) as string,
            getIcon(count: number): string {
                if (count > 0) return 'ic_list_increase';
                if (count < 0) return 'ic_list_decrease';
                return '';
            },
        };
    },
});
</script>

<style lang="postcss" scoped>
.daily-updates {
    background-color: rgba(theme('colors.white'), 0.8);
    &::v-deep .widget-contents {
        overflow-y: auto;
    }
}
.group-name {
    @apply text-base font-bold mb-1 truncate leading-tight;
    font-family: theme('fontFamily.sans');
}
.name {
    @apply text-xs text-gray truncate leading-tight;
    font-family: theme('fontFamily.serif');
}
.count {
    @apply text-lg font-bold ml-1;
}
.help {
    display: inline-flex;
    cursor: help;
}
</style>
