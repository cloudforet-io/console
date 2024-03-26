<script setup lang="ts">
import {
    computed, onMounted, onUnmounted, reactive,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import {
    PHeading, PDivider, PEmpty, PButton,
} from '@spaceone/design-system';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ServiceAccountReferenceMap } from '@/store/reference/service-account-reference-store';

import { useGrantScopeGuard } from '@/common/composables/grant-scope-guard';

import CloudServiceDetailPage
    from '@/services/asset-inventory/pages/CloudServiceDetailPage.vue';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { useSecurityPageStore } from '@/services/asset-inventory/stores/security-page-store';
import type { CloudServiceDetailPageParams } from '@/services/asset-inventory/types/cloud-service-detail-page-type';

const allReferenceStore = useAllReferenceStore();
const securityPageStore = useSecurityPageStore();
const securityPageGetters = securityPageStore.getters;

const route = useRoute();

const storeState = reactive({
    loading: computed(() => securityPageGetters.loading),
    cloudServiceTypeList: computed(() => securityPageGetters.cloudServiceTypeList),
    selectedCloudServiceType: computed(() => securityPageGetters.selectedCloudServiceType),
    serviceAccounts: computed<ServiceAccountReferenceMap>(() => allReferenceStore.getters.serviceAccount),
});
const state = reactive({
    pageParams: computed<CloudServiceDetailPageParams|undefined>(() => route.params as unknown as CloudServiceDetailPageParams),
    isNoServiceAccounts: computed(() => !Object.keys(storeState.serviceAccounts).length),
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
        <p-empty
            show-image
            image-size="md"
            show-button
            class="no-data"
        >
            <template #image>
                <img v-if="state.isNoServiceAccounts"
                     alt="empty-cloud-service-img"
                     src="@/assets/images/illust_satellite.svg"
                >
                <img v-else
                     alt="empty-cloud-service-img"
                     src="@/assets/images/illust_microscope.svg"
                >
            </template>
            <template #button>
                <router-link
                    :to="state.isNoServiceAccounts ? { name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT._NAME } : { name: ASSET_INVENTORY_ROUTE.COLLECTOR.CREATE._NAME }"
                >
                    <p-button style-type="substitutive"
                              icon-left="ic_plus_bold"
                              class="mx-auto text-center"
                    >
                        {{ state.isNoServiceAccounts ? $t('INVENTORY.ADD_SERVICE_ACCOUNT') : $t('INVENTORY.CREATE_COLLECTOR') }}
                    </p-button>
                </router-link>
            </template>
            {{ state.isNoServiceAccounts ? $t('INVENTORY.EMPTY_CLOUD_SERVICE') : $t('INVENTORY.EMPTY_CLOUD_SERVICE_RESOURCE') }}
        </p-empty>
    </div>
</template>

<style lang="postcss" scoped>
.no-data {
    margin-top: 4.25rem;
}
</style>
