<script setup lang="ts">
import {
    computed, onUnmounted, reactive, watch,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import ServiceDetailTabsSettings from '@/services/alert-manager/v2/components/ServiceDetailTabsSettings.vue';
import ServiceDetailTabsSettingsEventRule
    from '@/services/alert-manager/v2/components/ServiceDetailTabsSettingsEventRule.vue';
import { useServiceDetailPageStore } from '@/services/alert-manager/v2/stores/service-detail-page-store';
import type { Service } from '@/services/alert-manager/v2/types/alert-manager-type';

const serviceDetailPageStore = useServiceDetailPageStore();
const serviceDetailPageGetters = serviceDetailPageStore.getters;

const route = useRoute();

const storeState = reactive({
    serviceInfo: computed<Service>(() => serviceDetailPageGetters.serviceInfo),
});
const state = reactive({
    isSettingMode: computed<boolean>(() => route.query?.mode !== 'eventRule'),
});

watch(() => state.isSettingMode, async (isSettingMode) => {
    if (!isSettingMode || !storeState.serviceInfo.service_id) return;
    await serviceDetailPageStore.fetchEventRuleList({
        service_id: storeState.serviceInfo.service_id,
    });
}, { immediate: true });
onUnmounted(() => {
    serviceDetailPageStore.setCurrentTab(undefined);
});
</script>

<template>
    <div class="service-detail-tabs-settings-container">
        <service-detail-tabs-settings v-if="state.isSettingMode" />
        <service-detail-tabs-settings-event-rule v-else />
    </div>
</template>
