<template>
    <div class="collector-detail-page">
        <p-heading :title="collectorName">
            <p-skeleton v-if="!collectorName"
                        width="20rem"
                        height="1.5rem"
            />
            <template #extra>
                <router-link :to="{name: ASSET_INVENTORY_ROUTE.COLLECTOR.HISTORY._NAME }">
                    <p-button v-if="props.collectorId"
                              style-type="tertiary"
                    >
                        {{ i18n.t('INVENTORY.COLLECTOR.DETAIL.COLLECTOR_HISTORY') }}
                    </p-button>
                </router-link>
            </template>
        </p-heading>

        <collector-base-info-section class="section"
                                     :collector="state.collector"
                                     :loading="state.loading"
        />
        <collector-schedule-section class="section" />
        <collector-options-section class="section"
                                   :loading="state.loading"
                                   :collector-options="state.collectorOptions"
        />
        <collector-service-accounts-section class="section" />
    </div>
</template>

<script lang="ts" setup>
import {
    defineProps, reactive, onMounted, computed,
} from 'vue';

import { PHeading, PSkeleton, PButton } from '@spaceone/design-system';

import { i18n } from '@/translations';

import CollectorBaseInfoSection from '@/services/asset-inventory/collector/collector-detail/modules/CollectorBaseInfoSection.vue';
import CollectorOptionsSection
    from '@/services/asset-inventory/collector/collector-detail/modules/CollectorOptionsSection.vue';
import CollectorScheduleSection from '@/services/asset-inventory/collector/collector-detail/modules/CollectorScheduleSection.vue';
import CollectorServiceAccountsSection
    from '@/services/asset-inventory/collector/collector-detail/modules/CollectorServiceAccountsSection.vue';
import type { CollectorModel, CollectorPluginModel } from '@/services/asset-inventory/collector/type';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';

const props = defineProps<{
    collectorId: string;
}>();

const collectorName = 'Collector';
const state = reactive({
    loading: true,
    collector: null as null|CollectorModel,
    collectorOptions: computed<null|CollectorPluginModel['options']>(() => state.collector?.plugin_info?.options ?? null),
});

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
                    supported_schema: ['aws_access_key', 'aws_access_key_pair'],
                    supported_mode: ['FULL', 'DIFF'],
                    supported_schedule: ['* * * * *'],
                },
                plugin_info: {
                    plugin_id: 'plugin-1',
                    version: '1.0',
                    upgrade_mode: 'AUTO',
                    options: {
                        supported_resource_type: ['inventory.Server'],
                        filter_format: [],
                    },
                },
                priority: 1,
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
    state.collector = await getCollector();
});

</script>

<style lang="postcss" scoped>
.section {
    margin-bottom: 1rem;
}

</style>


