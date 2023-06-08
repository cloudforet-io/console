<template>
    <div class="collector-detail-page">
        <p-heading :title="collectorName"
                   show-back-button
                   @click-back-button="handleClickBackButton"
        >
            <p-skeleton v-if="!collectorName"
                        width="20rem"
                        height="1.5rem"
            />
            <template #extra>
                <router-link :to="{name: ASSET_INVENTORY_ROUTE.COLLECTOR.HISTORY._NAME }">
                    <p-button v-if="props.collectorId"
                              style-type="tertiary"
                    >
                        {{ $t('INVENTORY.COLLECTOR.DETAIL.COLLECTOR_HISTORY') }}
                    </p-button>
                </router-link>
            </template>
        </p-heading>

        <collector-base-info-section class="section"
                                     :loading="state.loading"
        />
        <collector-schedule-section class="section" />
        <collector-options-section class="section"
                                   :loading="state.loading"
                                   :collector-options="state.collectorOptions"
        />
        <collector-service-accounts-section class="section"
                                            :providers="state.collectorProviders"
        />
    </div>
</template>

<script lang="ts">
// eslint-disable-next-line import/order,import/no-duplicates
import { defineComponent, type ComponentPublicInstance } from 'vue';

interface IInstance extends ComponentPublicInstance {
    setPathFrom(from: any): void
}

export default defineComponent({
    beforeRouteEnter(to, from, next) {
        next((vm) => {
            const instance = vm as unknown as IInstance;
            instance.setPathFrom(from);
        });
    },
});
</script>

<script lang="ts" setup>
/* eslint-disable import/first */
import {
    defineProps, defineExpose, reactive, onMounted, computed,
// eslint-disable-next-line import/no-duplicates
} from 'vue';

import { PHeading, PSkeleton, PButton } from '@spaceone/design-system';

import { useGoBack } from '@/common/composables/go-back';

import CollectorBaseInfoSection from '@/services/asset-inventory/collector/collector-detail/modules/CollectorBaseInfoSection.vue';
import CollectorOptionsSection
    from '@/services/asset-inventory/collector/collector-detail/modules/CollectorOptionsSection.vue';
import CollectorScheduleSection from '@/services/asset-inventory/collector/collector-detail/modules/CollectorScheduleSection.vue';
import CollectorServiceAccountsSection
    from '@/services/asset-inventory/collector/collector-detail/modules/CollectorServiceAccountsSection.vue';
import { useCollectorFormStore } from '@/services/asset-inventory/collector/shared/collector-forms/collector-form-store';
import type { CollectorModel, CollectorPluginModel } from '@/services/asset-inventory/collector/type';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';

const props = defineProps<{
    collectorId: string;
}>();

const collectorFormStore = useCollectorFormStore();
const collectorFormState = collectorFormStore.$state;

const collectorName = 'Collector';
const state = reactive({
    loading: true,
    collector: computed<CollectorModel|null>(() => collectorFormState.originCollector),
    collectorOptions: computed<null|CollectorPluginModel['options']>(() => state.collector?.plugin_info?.options ?? null),
    // TODO: must be updated after backend api spec is updated
    collectorProviders: computed<undefined|string[]>(() => (state.collector?.provider ? [state.collector.provider] : undefined)),
});



const { setPathFrom, handleClickBackButton } = useGoBack({ name: ASSET_INVENTORY_ROUTE.COLLECTOR._NAME });

defineExpose({ setPathFrom });

const getCollector = async (): Promise<CollectorModel> => {
    state.loading = true;
    // TODO: change to real data
    const result = await new Promise<CollectorModel>((resolve) => {
        setTimeout(() => {
            resolve({
                collector_id: 'collector-1',
                name: 'collector-1',
                state: 'ENABLED',
                provider: 'aws',
                capability: {
                    supported_providers: ['aws'],
                    supported_schemas: ['aws_access_key', 'aws_access_key_pair'],
                    monitoring_type: 'METRIC',
                    use_resource_secret: true,
                },
                schedule: {
                    hours: [3],
                },
                plugin_info: {
                    plugin_id: 'plugin-aws-phd-inven-collector',
                    version: '1.4.3',
                    upgrade_mode: 'AUTO',
                    metadata: {},
                    secret_filter: {},
                    options: {
                        supported_resource_type: ['inventory.Server'],
                        filter_format: [],
                    },
                },
                tags: {
                    'spaceone:region': 'kr',
                    'spaceone:zone': 'kr-1',
                },
                last_collected_at: '2021-08-31T00:00:00Z',
                created_at: '2021-08-31T00:00:00Z',
            });
        }, 2000);
    });
    state.loading = false;
    return result;
};

onMounted(async () => {
    collectorFormStore.$reset();
    const collector = await getCollector();
    collectorFormStore.setOriginCollector(collector);
});

</script>

<style lang="postcss" scoped>
.section {
    margin-bottom: 1rem;
}

</style>


