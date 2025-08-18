<script setup lang="ts">
import {
    computed,
    defineProps, onMounted, onUnmounted, reactive, watch,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import type { Route } from '@cloudforet/mirinae/types/navigation/breadcrumbs/type';

import { useAllReferenceDataModel } from '@/query/resource-query/reference-data-model';
import { i18n } from '@/translations';

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

const router = useRouter();

const referenceMap = useAllReferenceDataModel();

const state = reactive({
    favoriteOptions: computed<FavoriteOptions>(() => ({
        type: FAVORITE_TYPE.SERVICE,
        id: props.serviceId,
    })),
    pageNavigation: computed<Route[]>(() => [
        { name: i18n.t('MENU.ALERT_MANAGER') as string, to: { name: ALERT_MANAGER_ROUTE._NAME } },
        { name: i18n.t('MENU.ALERT_MANAGER_SERVICE') as string, to: { name: ALERT_MANAGER_ROUTE.SERVICE._NAME } },
        { name: referenceMap.service[props.serviceId]?.label || props.serviceId },
    ]),
});

watch(() => props.serviceId, async (serviceId) => {
    if (!serviceId) return;
    await gnbStore.setFavoriteItemId(state.favoriteOptions);
}, { immediate: true });
watch(() => state.pageNavigation, async (changed) => {
    gnbStore.setBreadcrumbs(changed);
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
