<script setup lang="ts">
import {
    computed, onMounted, onUnmounted, reactive, watch,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import {
    PHeading, PDivider, PEmpty, PButton,
} from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { useAuthorizationStore } from '@/store/authorization/authorization-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CollectorReferenceMap } from '@/store/reference/collector-reference-store';
import type { ServiceAccountReferenceMap } from '@/store/reference/service-account-reference-store';

import { MENU_ID } from '@/lib/menu/config';

import { useGrantScopeGuard } from '@/common/composables/grant-scope-guard';

import CloudServiceDetailPage
    from '@/services/asset-inventory/pages/CloudServiceDetailPage.vue';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { useSecurityPageStore } from '@/services/asset-inventory/stores/security-page-store';
import type { CloudServiceDetailPageParams } from '@/services/asset-inventory/types/cloud-service-detail-page-type';
import type { EmptyData } from '@/services/asset-inventory/types/type';
import { SERVICE_ACCOUNT_ROUTE } from '@/services/service-account/routes/route-constant';

const allReferenceStore = useAllReferenceStore();
const securityPageStore = useSecurityPageStore();
const securityPageGetters = securityPageStore.getters;
const authorizationStore = useAuthorizationStore();

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
                to: state.writableServiceAccount ? { name: SERVICE_ACCOUNT_ROUTE._NAME } : {},
                buttonText: state.writableServiceAccount ? i18n.t('INVENTORY.ADD_SERVICE_ACCOUNT') : undefined,
                desc: i18n.t('INVENTORY.EMPTY_CLOUD_SERVICE'),
            };
        } else {
            if (!Object.keys(storeState.collectors).length) {
                result = {
                    to: state.writableCollector ? { name: ASSET_INVENTORY_ROUTE.COLLECTOR.CREATE._NAME } : {},
                    buttonText: state.writableCollector ? i18n.t('INVENTORY.CREATE_COLLECTOR') : undefined,
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
    writableServiceAccount: computed<boolean|undefined>(() => authorizationStore.getters.pageAccessPermissionMap[MENU_ID.SERVICE_ACCOUNT]?.write),
    writableCollector: computed<boolean|undefined>(() => authorizationStore.getters.pageAccessPermissionMap[MENU_ID.COLLECTOR]?.write),
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
        <p-heading class="mb-6"
                   :title="$t('INVENTORY.SECURITY.MAIN.TITLE')"
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
