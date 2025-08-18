<script setup lang="ts">
import {
    computed, onUnmounted, reactive,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import ServiceDetailTabsSettings from '@/services/alert-manager/v2/components/ServiceDetailTabsSettings.vue';
import ServiceDetailTabsSettingsEventRule
    from '@/services/alert-manager/v2/components/ServiceDetailTabsSettingsEventRule.vue';
import { useServiceDetailPageStore } from '@/services/alert-manager/v2/stores/service-detail-page-store';

const serviceDetailPageStore = useServiceDetailPageStore();

const route = useRoute();

const state = reactive({
    isSettingMode: computed<boolean>(() => route.query?.mode !== 'eventRule'),
});

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
