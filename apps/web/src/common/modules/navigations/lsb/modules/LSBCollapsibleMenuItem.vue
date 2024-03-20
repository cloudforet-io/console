<script setup lang="ts">
import { reactive, watch } from 'vue';

import { PI, PLazyImg } from '@spaceone/design-system';

import type { LSBCollapsibleItem } from '@/common/modules/navigations/lsb/type';

interface Props {
    item: LSBCollapsibleItem;
    isSubItem?: boolean;
    isCollapsed?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    item: () => ({}) as LSBCollapsibleItem,
});


const state = reactive({
    isCollapsed: false,
});

const handleClickCollapsibleTitle = () => {
    state.isCollapsed = !state.isCollapsed;
};

watch(() => props.isCollapsed, (changed) => {
    state.isCollapsed = !!changed;
}, { immediate: true });
</script>

<template>
    <div class="l-s-b-collapsible-menu-item"
         :class="{ 'is-collapsed': state.isCollapsed, 'is-sub-item': props.isSubItem }"
    >
        <div class="collapsible-title"
             @click="handleClickCollapsibleTitle"
        >
            <p-i name="ic_chevron-down"
                 width="1.25rem"
                 height="1.25rem"
                 color="inherit transparent"
                 class="arrow-button"
            />
            <p-lazy-img v-if="props.item.icon"
                        class="title-image"
                        :src="props.item.icon"
                        width="1rem"
                        height="1rem"
            />
            <span>{{ props.item.label }}</span>
        </div>
        <div class="collapsible-contents">
            <slot name="collapsible-contents"
                  v-bind="{...$props}"
            />
        </div>
    </div>
</template>

<style scoped lang="postcss">
.l-s-b-collapsible-menu-item {
    @apply flex flex-col text-label-md;
    .collapsible-title {
        @apply flex items-center font-bold;
        .arrow-button {
            transition: transform 0.3s ease-in-out;
        }
        .title-image {
            margin-right: 0.25rem;
        }
    }
    .collapsible-contents {
        margin-top: 0.5rem;
        padding-bottom: 0.5rem;
        opacity: 1;
        transition: opacity 0.3s ease, visibility 0.3s ease;
    }
    &.is-sub-item {
        .collapsible-title {
            @apply text-gray-600;
            height: 1.25rem;
        }
        .collapsible-contents {
            padding-left: 0.75rem;
        }
    }
    &.is-collapsed {
        .collapsible-title {
            .arrow-button {
                transform: rotate(-90deg);
            }
        }
        .collapsible-contents {
            display: none;
            height: 0;
            margin: 0;
            padding: 0;
            opacity: 0;
            transition: opacity 0s ease;
        }
    }
}
</style>
