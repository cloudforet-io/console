<script setup lang="ts">
import { useRouter } from 'vue-router/composables';

import { PEmpty, PButton } from '@cloudforet/mirinae';

import { useAppContextStore } from '@/store/app-context/app-context-store';


import { ADMIN_ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/admin/route-constant';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';

const router = useRouter();
const appContextStore = useAppContextStore();

const handleCreate = () => {
    router.push({
        name: appContextStore.getters.isAdminMode ? ADMIN_ASSET_INVENTORY_ROUTE.COLLECTOR.CREATE._NAME : ASSET_INVENTORY_ROUTE.COLLECTOR.CREATE._NAME,
    }).catch(() => {});
};
</script>

<template>
    <p-empty
        show-image
        show-button
        image-size="md"
    >
        <template #image>
            <img alt="empty-image"
                 src="../../../assets/images/illust_microscope.svg"
            >
        </template>
        <template #button>
            <p-button
                icon-left="ic_plus_bold"
                @click="handleCreate"
            >
                <span>{{ $t('INVENTORY.COLLECTOR.MAIN.CREATE_COLLECTOR') }}</span>
            </p-button>
        </template>
        {{ $t('INVENTORY.COLLECTOR.MAIN.NO_DATA') }}
    </p-empty>
</template>

<style scoped lang="postcss">
.p-empty {
    @apply w-full bg-white rounded-md border border-gray-200;
    padding: 1.563rem 1.25rem 1.375rem;
}
</style>
