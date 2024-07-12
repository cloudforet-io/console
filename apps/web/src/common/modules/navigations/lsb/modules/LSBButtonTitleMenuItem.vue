<script setup lang="ts">
import { PLazyImg, PI } from '@cloudforet/mirinae';

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
    <router-link class="l-s-b-button-title-menu-item"
                 :class="{'is-sub': props.item.isSub}"
                 :to="props.item.to"
    >
        <p-i v-if="props.item.isBackLink"
             name="ic_arrow-left"
             :width="props.item.isSub ? '0.75rem' : '1rem'"
             :height="props.item.isSub ? '0.75rem' : '1rem'"
             color="inherit transparent"
        />
        <p-lazy-img
            v-if="props.item.titleIcon"
            :src="assetUrlConverter(props.item.titleIcon)"
            width="1.5rem"
            height="1.5rem"
        />
        <span class="top-title">
            {{ props.item.label }}
        </span>
        <slot name="extra" />
    </router-link>
</template>

<style scoped lang="postcss">
.l-s-b-button-title-menu-item {
    @apply flex items-center text-label-md font-bold;
    height: 2rem;
    margin-top: 0.25rem;
    padding-bottom: 0.5rem;
    padding-left: 0.125rem;
    gap: 0.25rem;
    &.is-sub {
        @apply text-label-sm font-normal;
    }
}
</style>
