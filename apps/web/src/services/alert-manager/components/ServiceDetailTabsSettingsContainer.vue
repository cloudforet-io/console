<script setup lang="ts">
import { computed, reactive } from 'vue';

import ServiceDetailTabsSettings from '@/services/alert-manager/components/ServiceDetailTabsSettings.vue';
import { useServiceDetailPageStore } from '@/services/alert-manager/stores/service-detail-page-store';
import type { SettingModeType } from '@/services/alert-manager/types/alert-manager-type';

const serviceDetailPageStore = useServiceDetailPageStore();
const serviceDetailPageState = serviceDetailPageStore.state;

const storeState = reactive({
    settingMode: computed<SettingModeType>(() => serviceDetailPageState.settingMode),
});
</script>

<template>
    <div class="service-detail-tabs-settings-container">
        <service-detail-tabs-settings v-if="storeState.settingMode === 'settings'" />
    </div>
</template>
