<script setup lang="ts">
import {
    computed,
    defineProps, onMounted, onUnmounted, reactive, watch,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import type { FavoriteOptions } from '@/common/modules/favorites/favorite-button/type';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';
import { useGnbStore } from '@/common/modules/navigations/stores/gnb-store';

import ServiceDetailHeader from '@/services/alert-manager/components/ServiceDetailHeader.vue';
import ServiceDetailTabs from '@/services/alert-manager/components/ServiceDetailTabs.vue';
import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/routes/route-constant';
import { useServiceDetailPageStore } from '@/services/alert-manager/stores/service-detail-page-store';


interface Props {
    serviceId: string;
}
const props = withDefaults(defineProps<Props>(), {
    serviceId: '',
});

const gnbStore = useGnbStore();
const serviceDetailPageStore = useServiceDetailPageStore();

const router = useRouter();


const state = reactive({
    favoriteOptions: computed<FavoriteOptions>(() => ({
        type: FAVORITE_TYPE.SERVICE,
        id: props.serviceId,
    })),
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

onMounted(() => {
    if (!props.serviceId) {
        router.push({ name: ALERT_MANAGER_ROUTE.SERVICE._NAME }).catch(() => {});
    }
});

onUnmounted(() => {
    serviceDetailPageStore.initState();
});
</script>

<template>
    <div class="service-detail-page">
        <service-detail-header :service-id="props.serviceId" />
        <service-detail-tabs />
    </div>
</template>
