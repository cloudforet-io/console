<template>
    <p-widget-layout title="Cloud Services">
        <template #default>
            <div class="grid gap-2
                        grid-cols-1
                        sm:grid-cols-2
                        lg:grid-cols-3
                        xl:grid-cols-4
                        2xl:grid-cols-6"
            >
                <template v-if="loading">
                    <div v-for="v in skeletons" :key="v" class="flex items-center p-4">
                        <p-skeleton width="2rem" height="2rem" class="mr-4" />
                        <div class="grid grid-cols-1 gap-1 w-full">
                            <p-skeleton width="80%" height="0.625rem" />
                            <p-skeleton width="100%" height="0.625rem" />
                        </div>
                    </div>
                </template>
                <router-link v-else-if="data.length === 0" to="/inventory/cloud-service"
                             class="no-data rounded-sm bg-gray-100 flex items-center justify-center"
                >
                    <p-i name="ic_plus_square" width="1rem" height="1rem"
                         class="mr-4"
                    />
                    Create a Collector
                </router-link>
                <template v-else>
                    <p-selectable-item v-for="(item, index) in data" :key="index"
                                       :icon-url="iconUrl(item)" theme="card"
                                       @click="onSelected(item, index)"
                    >
                        <template #contents>
                            <div class="group-name">
                                {{ item.group }}
                            </div>
                            <div class="name">
                                {{ item.name }}
                            </div>
                        </template>
                        <template #extra>
                            <span class="count">{{ item.count }}</span>
                        </template>
                    </p-selectable-item>
                </template>
            </div>
        </template>
        <template #extra>
            <router-link to="inventory/cloud-service" class="more">
                MORE
                <p-i name="ic_arrow_right" width="1rem" height="1rem"
                     color="transparent currentColor" class="ml-1"
                />
            </router-link>
        </template>
    </p-widget-layout>
</template>

<script lang="ts">
import {
    computed,
    defineComponent, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import PWidgetLayout from '@/components/organisms/layouts/widget-layout/WidgetLayout.vue';
import PBadge from '@/components/atoms/badges/Badge.vue';
import { fluentApi } from '@/lib/fluent-api';
import { OPERATORS } from '@/lib/fluent-api/statistics/toolset';
import { useStore, ProviderStoreType, ProviderInfo } from '@/store/toolset';
import _ from 'lodash';
import { UnwrapRef } from '@vue/composition-api/dist/reactivity';
import casual, { arrayOf } from '@/lib/casual';
import PGridLayout from '@/components/molecules/layouts/grid-layout/GridLayout.vue';
import PSkeleton from '@/components/atoms/skeletons/Skeleton.vue';
import PSelectableItem from '@/components/molecules/selectable-item/SelectableItem.vue';
import PI from '@/components/atoms/icons/PI.vue';

export default defineComponent({
    name: 'CloudServices',
    components: {
        PWidgetLayout,
        PSelectableItem,
        PBadge,
        PGridLayout,
        PSkeleton,
        PI,
    },
    setup() {
        const vm: any = getCurrentInstance();

        const {
            provider,
        } = useStore();
        const providerStore: ProviderStoreType = provider;

        interface Value {
            provider: string;
            group: string;
            name: string;
            count: number;
        }

        interface StateInterface {
            data: Value[];
            loading: boolean;
            providers: ProviderInfo;
        }
        const state: UnwrapRef<StateInterface> = reactive({
            data: [],
            loading: true,
            providers: computed(() => providerStore.state.providers),
        });


        const api = fluentApi.statisticsTest().stat().query<Value>()
            .setServiceType('inventory.cloud-service')
            .addField('cloud_service_id', OPERATORS.count, 'count')
            .addField('provider', OPERATORS.value, 'provider')
            .addField('cloud_service_group', OPERATORS.value, 'group')
            .addField('cloud_service_type', OPERATORS.value, 'name')
            .setGroupBy('provider', 'cloud_service_group', 'cloud_service_type')
            .setSort('cloud_service_id')
            .setLimit(12);

        const getData = async (): Promise<void> => {
            state.loading = true;
            await providerStore.getProvider();
            try {
                const res = await api.execute();
                state.data = res.data.values;
            } catch (e) {
                state.data = arrayOf(12, () => ({
                    provider: 'aws',
                    group: 'group name',
                    name: 'name',
                    count: casual.integer(0),
                })) as Value[];
            } finally {
                state.loading = false;
            }
        };

        setTimeout(() => {
            getData();
        }, 1000);

        return {
            ...toRefs(state),
            skeletons: _.range(12),
            iconUrl: (item: Value): string => _.get(
                state.providers,
                `state.providers[${item.provider}].icon`,
                '',
            ) as string,
            onSelected(item: Value): void {
                vm.$router.push({
                    path: '/identity/service-account',
                    query: { provider: item.provider },
                });
            },
        };
    },
});
</script>

<style lang="postcss" scoped>
.group-name {
    @apply text-base font-bold mb-1;
    font-family: theme('fontFamily.sans');
}
.name {
    @apply text-xs text-gray;
    font-family: theme('fontFamily.serif');
}
.count {
    @apply text-lg font-bold ml-1;
}
.more {
    @apply text-sm text-blue-600 font-normal float-right inline-flex items-center cursor-pointer;
}
.no-data {
    height: 3.5rem;
}
</style>
