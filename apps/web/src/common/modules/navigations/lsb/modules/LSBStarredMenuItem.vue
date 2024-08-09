<script setup lang="ts">
import { PI } from '@cloudforet/mirinae';

import LSBRouterMenuItem from '@/common/modules/navigations/lsb/modules/LSBRouterMenuItem.vue';
import type { LSBItem } from '@/common/modules/navigations/lsb/type';

interface Props {
    item: LSBItem;
}

const props = withDefaults(defineProps<Props>(), {
    item: () => ({}) as LSBItem,
});
</script>

<template>
    <div class="l-s-b-starred-menu-item">
        <div class="title-wrapper">
            <p-i name="ic_multi-favorite"
                 width="1.5rem"
                 height="1.5rem"
                 class="start-title-button"
            />
            <span>{{ $t('COMMON.STARRED') }}</span>
        </div>
        <div class="contents-wrapper">
            <div v-if="props.item.childItems?.length > 0">
                <l-s-b-router-menu-item v-for="(_item, idx) of props.item.childItems"
                                        :key="idx"
                                        :item="_item"
                                        :idx="idx"
                                        :current-path="props.item.currentPath"
                                        is-hide-favorite
                />
            </div>
            <span v-else
                  class="no-data"
            >
                {{ $t('COMMON.STARRED_NO_DATA') }}
            </span>
        </div>
    </div>
</template>

<style scoped lang="postcss">
.l-s-b-starred-menu-item {
    @apply flex flex-col text-label-md;
    gap: 0.5rem;
    .title-wrapper {
        @apply flex items-center;
        padding-right: 0.875rem;
        padding-left: 0.375rem;
        gap: 0.25rem;
    }
    .contents-wrapper {
        max-height: 21rem;
        overflow-y: auto;
        .no-data {
            @apply flex items-start text-gray-500;
            padding-right: 0.5rem;
            padding-left: 0.5rem;
            gap: 0.125rem;
        }
    }
}
</style>
