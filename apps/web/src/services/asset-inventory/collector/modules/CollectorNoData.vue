<template>
    <p-empty
        show-image
        show-button
        image-size="md"
    >
        <template #image>
            <img alt="empty-image"
                 src="@/assets/images/illust_microscope.svg"
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

<script setup lang="ts">
import { PEmpty, PButton } from '@spaceone/design-system';

import { SpaceRouter } from '@/router';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';

const handleCreate = () => {
    SpaceRouter.router.push({ name: ASSET_INVENTORY_ROUTE.COLLECTOR.CREATE._NAME });
};
</script>

<style scoped lang="postcss">
.p-empty {
    padding-top: 3rem;
    padding-bottom: 2.5rem;
}
</style>
