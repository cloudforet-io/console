<script setup lang="ts">
import { useRouter } from 'vue-router/composables';

import {
    PButton, PHeading, PHeadingLayout,
} from '@cloudforet/mirinae';

import ServiceList from '@/services/alert-manager-v2/components/ServiceList.vue';
import { ALERT_MANAGER_V2_ROUTE } from '@/services/alert-manager-v2/routes/route-constant';

const router = useRouter();

const handleClickCreateButton = () => {
    router.push({ name: ALERT_MANAGER_V2_ROUTE.SERVICE.CREATE._NAME });
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
        <div class="mt-6">
            <service-list />
        </div>
    </div>
</template>
