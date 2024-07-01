<script setup lang="ts">
import { PLazyImg } from '@spaceone/design-system';

import { assetUrlConverter } from '@/lib/helper/asset-helper';

import type { LSBItem } from '@/common/modules/navigations/lsb/type';

interface Props {
    item: LSBItem;
}

const props = withDefaults(defineProps<Props>(), {
    item: () => ({}) as LSBItem,
});
</script>

<template>
    <p class="l-s-b-top-title-menu-item">
        <p-lazy-img
            v-if="props.item.titleIcon"
            :src="assetUrlConverter(props.item.titleIcon)"
            width="1.5rem"
            height="1.5rem"
        />
        <span class="top-title">
            {{ props.item.label }}
        </span>
    </p>
</template>

<style scoped lang="postcss">
.l-s-b-top-title-menu-item {
    @apply flex items-center text-label-md font-bold;
    height: 2rem;
    margin-top: 0.25rem;
    padding-right: 0.5rem;
    padding-bottom: 0.5rem;
    padding-left: 0.5rem;
    gap: 0.25rem;
}
</style>
