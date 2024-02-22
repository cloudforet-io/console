<script setup lang="ts">
import { reactive } from 'vue';

import { PI } from '@spaceone/design-system';

import type { LSBItem } from '@/common/modules/navigations/lsb/type';

interface Props {
    item: LSBItem;
}

const props = withDefaults(defineProps<Props>(), {
    item: () => ({}) as LSBItem,
});

const state = reactive({
    isCollapsed: false,
});

const handleClickCollapsibleTitle = () => {
    state.isCollapsed = !state.isCollapsed;
};
</script>

<template>
    <div class="l-s-b-collapsible-menu-itm"
         :class="{ 'is-collapsed': state.isCollapsed }"
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
            <span>{{ props.item.label }}</span>
        </div>
        <div class="collapsible-contents">
            <slot name="collapsible-contents" />
        </div>
    </div>
</template>

<style scoped lang="postcss">
.l-s-b-collapsible-menu-itm {
    @apply flex flex-col text-label-md;
    .collapsible-title {
        @apply flex items-center font-bold;
        .arrow-button {
            transition: transform 0.3s ease-in-out;
        }
    }
    .collapsible-contents {
        margin-top: 0.5rem;
        padding-bottom: 0.25rem;
        opacity: 1;
        transition: opacity 0.3s ease, visibility 0.3s ease;
    }
    &.is-collapsed {
        .collapsible-title {
            .arrow-button {
                transform: rotate(-90deg);
            }
        }
        .collapsible-contents {
            height: 0;
            margin: 0;
            padding: 0;
            opacity: 0;
            transition: opacity 0s ease;
        }
    }
}
</style>
