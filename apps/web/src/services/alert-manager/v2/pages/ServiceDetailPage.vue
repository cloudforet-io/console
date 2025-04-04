<script setup lang="ts">
import {
    computed,
    defineProps, onMounted, onUnmounted, reactive, watch,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import { isEmpty } from 'lodash';

import type { Route } from '@cloudforet/mirinae/types/navigation/breadcrumbs/type';

import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ServiceReferenceMap } from '@/store/reference/service-reference-store';

import type { FavoriteOptions } from '@/common/modules/favorites/favorite-button/type';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';
import { useGnbStore } from '@/common/modules/navigations/stores/gnb-store';

import ServiceDetailHeader from '@/services/alert-manager/v2/components/ServiceDetailHeader.vue';
import ServiceDetailTabs from '@/services/alert-manager/v2/components/ServiceDetailTabs.vue';
import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/v2/routes/route-constant';
import { useServiceDetailPageStore } from '@/services/alert-manager/v2/stores/service-detail-page-store';

interface Props {
    serviceId: string;
}
const props = withDefaults(defineProps<Props>(), {
    serviceId: '',
});

const gnbStore = useGnbStore();
const serviceDetailPageStore = useServiceDetailPageStore();
const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;

const router = useRouter();

const storeState = reactive({
    serviceList: computed<ServiceReferenceMap>(() => allReferenceGetters.service),
});
const state = reactive({
    favoriteOptions: computed<FavoriteOptions>(() => ({
        type: FAVORITE_TYPE.SERVICE,
        id: props.serviceId,
    })),
    pageNavigation: computed<Route[]>(() => [
        { name: i18n.t('MENU.ALERT_MANAGER') as string, to: { name: ALERT_MANAGER_ROUTE._NAME } },
        { name: i18n.t('MENU.ALERT_MANAGER_SERVICE') as string, to: { name: ALERT_MANAGER_ROUTE.SERVICE._NAME } },
        { name: storeState.serviceList[props.serviceId].label },
    ]),
});
watch(() => props.serviceId, async (serviceId) => {
    if (!serviceId) return;
    await serviceDetailPageStore.fetchNotificationProtocolList();
    await serviceDetailPageStore.fetchEventRuleList({
        service_id: serviceId,
    });
    await serviceDetailPageStore.fetchServiceDetailData(serviceId);
    await gnbStore.setFavoriteItemId(state.favoriteOptions);
}, { immediate: true });
watch(() => storeState.serviceList, async (serviceList) => {
    if (isEmpty(serviceList)) return;
    gnbStore.setBreadcrumbs(state.pageNavigation);
}, { immediate: true });

onMounted(() => {
    if (!props.serviceId) {
        router.push({ name: ALERT_MANAGER_ROUTE.SERVICE._NAME }).catch(() => {});
    }
});

onUnmounted(() => {
    serviceDetailPageStore.initState();
    gnbStore.setBreadcrumbs([]);
});
</script>

<template>
    <div class="service-detail-page">
        <service-detail-header :service-id="props.serviceId" />
        <service-detail-tabs />
    </div>
</template>
