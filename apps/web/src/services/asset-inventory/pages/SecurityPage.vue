<script setup lang="ts">
import {
    computed, onMounted, onUnmounted, reactive, watch,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import {
    PHeading, PDivider, PEmpty, PButton,
} from '@spaceone/design-system';

import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CollectorReferenceMap } from '@/store/reference/collector-reference-store';
import type { ServiceAccountReferenceMap } from '@/store/reference/service-account-reference-store';

import { useGrantScopeGuard } from '@/common/composables/grant-scope-guard';

import CloudServiceDetailPage
    from '@/services/asset-inventory/pages/CloudServiceDetailPage.vue';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { useSecurityPageStore } from '@/services/asset-inventory/stores/security-page-store';
import type { CloudServiceDetailPageParams } from '@/services/asset-inventory/types/cloud-service-detail-page-type';
import type { EmptyData } from '@/services/asset-inventory/types/type';

const allReferenceStore = useAllReferenceStore();
const securityPageStore = useSecurityPageStore();
const securityPageGetters = securityPageStore.getters;

const route = useRoute();

const storeState = reactive({
    loading: computed(() => securityPageGetters.loading),
    cloudServiceTypeList: computed(() => securityPageGetters.cloudServiceTypeList),
    selectedCloudServiceType: computed(() => securityPageGetters.selectedCloudServiceType),
    serviceAccounts: computed<ServiceAccountReferenceMap>(() => allReferenceStore.getters.serviceAccount),
    collectors: computed<CollectorReferenceMap>(() => allReferenceStore.getters.collector),
});
const state = reactive({
    pageParams: computed<CloudServiceDetailPageParams|undefined>(() => route.params as unknown as CloudServiceDetailPageParams),
    isNoServiceAccounts: computed(() => !Object.keys(storeState.serviceAccounts).length),
    emptyData: computed<EmptyData>(() => {
        let result = {} as EmptyData;
        if (!Object.keys(storeState.serviceAccounts).length) {
            result = {
                to: { name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT._NAME },
                buttonText: i18n.t('INVENTORY.ADD_SERVICE_ACCOUNT'),
                desc: i18n.t('INVENTORY.EMPTY_CLOUD_SERVICE'),
            };
        } else {
            if (!Object.keys(storeState.collectors).length) {
                result = {
                    to: { name: ASSET_INVENTORY_ROUTE.COLLECTOR.CREATE._NAME },
                    buttonText: i18n.t('INVENTORY.CREATE_COLLECTOR'),
                    desc: i18n.t('INVENTORY.EMPTY_CLOUD_SERVICE_RESOURCE'),
                };
            }
            result = {
                to: {},
                buttonText: undefined,
                desc: i18n.t('COMMON.ERROR.NO_RESOURCE_TITLE'),
            };
        }
        return result;
    }),
});

const initData = async () => {
    await securityPageStore.fetchCloudServiceAnalyze();
};

const { callApiWithGrantGuard } = useGrantScopeGuard(['DOMAIN', 'WORKSPACE'], initData);

watch(() => storeState.cloudServiceTypeList, () => {
    if (state.pageParams?.name) {
        securityPageStore.setSelectedCloudServiceType(state.pageParams.group, state.pageParams.name, state.pageParams.provider);
    } else {
        securityPageStore.setSelectedCloudServiceType();
    }
});

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
                               :provider="state.pageParams?.provider"
                               :group="state.pageParams?.group"
                               :name="state.pageParams?.name"
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
            :show-button="!!state.emptyData.to?.name"
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
                    :to="state.emptyData.to"
                >
                    <p-button style-type="substitutive"
                              icon-left="ic_plus_bold"
                              class="mx-auto text-center"
                    >
                        {{ state.emptyData?.buttonText }}
                    </p-button>
                </router-link>
            </template>
            {{ state.emptyData.desc }}
        </p-empty>
    </div>
</template>

<style lang="postcss" scoped>
.no-data {
    margin-top: 4.25rem;
}
</style>
