<script setup lang="ts">
import {
    computed, onMounted, onUnmounted, reactive,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import { PHeading, PDivider, PEmpty } from '@spaceone/design-system';

import { useGrantScopeGuard } from '@/common/composables/grant-scope-guard';

import CloudServiceDetailPage
    from '@/services/asset-inventory/pages/CloudServiceDetailPage.vue';
import { useSecurityPageStore } from '@/services/asset-inventory/stores/security-page-store';
import type { CloudServiceDetailPageParams } from '@/services/asset-inventory/types/cloud-service-detail-page-type';

const securityPageStore = useSecurityPageStore();
const securityPageGetters = securityPageStore.getters;

const route = useRoute();

const storeState = reactive({
    loading: computed(() => securityPageGetters.loading),
    cloudServiceTypeList: computed(() => securityPageGetters.cloudServiceTypeList),
    selectedCloudServiceType: computed(() => securityPageGetters.selectedCloudServiceType),
});
const state = reactive({
    pageParams: computed<CloudServiceDetailPageParams|undefined>(() => route.params as unknown as CloudServiceDetailPageParams),
});

const initData = async () => {
    await securityPageStore.fetchCloudServiceAnalyze();
    if (state.pageParams?.name) {
        await securityPageStore.setSelectedCloudServiceType(state.pageParams.group, state.pageParams.name);
    } else {
        await securityPageStore.setSelectedCloudServiceType();
    }
};

const { callApiWithGrantGuard } = useGrantScopeGuard(['DOMAIN', 'WORKSPACE'], initData);

onMounted(async () => {
    await callApiWithGrantGuard();
});

onUnmounted(() => {
    securityPageStore.initState();
});
</script>

<template>
    <cloud-service-detail-page v-if="storeState.loading || storeState.cloudServiceTypeList.length > 0"
                               :is-security-page="true"
                               :provider="storeState.selectedCloudServiceType?.data.provider"
                               :group="storeState.selectedCloudServiceType?.data.group"
                               :name="storeState.selectedCloudServiceType?.name"
    />
    <div v-else>
        <p-heading :title="$t('INVENTORY.SECURITY.MAIN.TITLE')"
                   use-total-count
                   :total-count="0"
        />
        <p-divider />
        <p-empty show-image
                 image-size="md"
                 class="no-data"
        >
            <template #image>
                <img src="@/assets/images/illust_microscope.svg"
                     alt="empty-image"
                >
            </template>
            {{ $t('COMMON.ERROR.NO_RESOURCE_TITLE') }}
        </p-empty>
    </div>
</template>

<style lang="postcss" scoped>
.no-data {
    margin-top: 4.25rem;
}
</style>
