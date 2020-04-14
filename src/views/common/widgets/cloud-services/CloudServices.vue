<template>
    <p-widget-layout class="daily-updates" title="Cloud Services">
        <p-selectable-list class="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6"
                           :items="data" :mapper="mapper" theme="card"
                           :loading="loading"
                           @selected="onSelected"
        >
            <template #contents="{item}">
                <div class="group-name">
                    {{ item.group }}
                </div>
                <div class="name">
                    {{ item.name }}
                </div>
            </template>
            <template #extra="{item}">
                <span class="count">{{ item.count }}</span>
            </template>
        </p-selectable-list>
    </p-widget-layout>
</template>

<script lang="ts">
import {
    computed,
    defineComponent, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import PWidgetLayout from '@/components/organisms/layouts/widget-layout/WidgetLayout.vue';
import PSelectableList from '@/components/organisms/lists/selectable-list/SelectableList.vue';
import PBadge from '@/components/atoms/badges/Badge.vue';
import { fluentApi } from '@/lib/fluent-api';
import { OPERATORS } from '@/lib/fluent-api/statistics/toolset';
import { useStore, ProviderStoreType, ProviderInfo } from '@/store/toolset';
import _ from 'lodash';
import { UnwrapRef } from '@vue/composition-api/dist/reactivity';
import casual, { arrayOf } from '@/lib/casual';

export default defineComponent({
    name: 'CloudServices',
    components: {
        PWidgetLayout,
        PSelectableList,
        PBadge,
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
                console.error(e);
                // TODO: no data
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

        getData();

        return {
            ...toRefs(state),
            mapper: {
                iconUrl: (item: Value): string => _.get(
                    state.providers,
                    `state.providers[${item.provider}].icon`,
                    '',
                ) as string,
            },
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
</style>
