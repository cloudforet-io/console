<script setup lang="ts">
import { useRouter } from 'vue-router/composables';

import {
    PButton, PHeading, PHeadingLayout,
} from '@cloudforet/mirinae';

import { useProperRouteLocation } from '@/common/composables/proper-route-location';

import ServiceList from '@/services/alert-manager/components/ServiceList.vue';
import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/routes/route-constant';

const router = useRouter();

const { getProperRouteLocation } = useProperRouteLocation();

const handleClickCreateButton = () => {
    router.push(getProperRouteLocation({
        name: ALERT_MANAGER_ROUTE.SERVICE.CREATE._NAME,
    }));
};
</script>

<template>
    <div class="service-main-page">
        <p-heading-layout>
            <template #heading>
                <p-heading :title="$t('MENU.ALERT_MANAGER_SERVICE')" />
            </template>
            <template #extra>
                <p-button style-type="primary"
                          icon-left="ic_plus_bold"
                          @click="handleClickCreateButton"
                >
                    {{ $t('ALERT_MANAGER.CREATE') }}
                </p-button>
            </template>
        </p-heading-layout>
        <service-list class="mt-6" />
    </div>
</template>
