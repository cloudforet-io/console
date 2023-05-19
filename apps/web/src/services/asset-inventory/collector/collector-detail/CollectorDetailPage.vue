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

        <collector-base-info-section class="section" />
        <collector-schedule-section class="section" />
        <collector-options-section class="section" />
        <collector-service-accounts-section class="section" />
    </div>
</template>

<script lang="ts" setup>
import { defineProps } from 'vue';

import { PHeading, PSkeleton, PButton } from '@spaceone/design-system';

import { i18n } from '@/translations';

import CollectorBaseInfoSection from '@/services/asset-inventory/collector/collector-detail/modules/CollectorBaseInfoSection.vue';
import CollectorOptionsSection
    from '@/services/asset-inventory/collector/collector-detail/modules/CollectorOptionsSection.vue';
import CollectorScheduleSection from '@/services/asset-inventory/collector/collector-detail/modules/CollectorScheduleSection.vue';
import CollectorServiceAccountsSection
    from '@/services/asset-inventory/collector/collector-detail/modules/CollectorServiceAccountsSection.vue';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';

const props = defineProps<{
    collectorId: string;
}>();

const collectorName = 'Collector';



</script>

<style lang="postcss" scoped>
.section {
    margin-bottom: 1rem;
}

</style>


