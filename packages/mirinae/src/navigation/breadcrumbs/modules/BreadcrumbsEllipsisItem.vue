<script setup lang="ts">
import { reactive, ref } from 'vue';

import { onClickOutside } from '@vueuse/core';
import { useRouter } from 'vue-router/composables';

import PI from '@/foundation/icons/PI.vue';
import { useContextMenuController } from '@/hooks';
import PContextMenu from '@/inputs/context-menu/PContextMenu.vue';
import type { MenuItem } from '@/inputs/context-menu/type';


interface Props {
    menu?: MenuItem[];
}

const props = withDefaults(defineProps<Props>(), {
    menu: undefined,
});

const router = useRouter();

const emit = defineEmits<{(e: 'click'): void}>();

const containerRef = ref<HTMLElement | null>(null);
const contextMenuRef = ref<HTMLElement | null>(null);
const targetRef = ref<HTMLElement | null>(null);

const state = reactive({
    isVisibleMenu: false,
    selectedMenu: [],
});

const {
    visibleMenu: visibleContextMenu,
    contextMenuStyle,
    showContextMenu,
    hideContextMenu,
} = useContextMenuController({
    useFixedStyle: false,
    targetRef,
    contextMenuRef,
    menu: props.menu,
});

const handleClickItem = () => {
    emit('click');
    if (props.menu) {
        if (visibleContextMenu.value) hideContextMenu();
        else showContextMenu();
    }
};
const handleSelectMenu = (value) => {
    if (value[0]?.to) {
        router.push(value[0]?.to);
    }
};

onClickOutside(containerRef, hideContextMenu);
</script>

<template>
    <span ref="containerRef"
          class="breadcrumb-ellipsis-wrapper"
    >
        <span class="breadcrumb-ellipsis">
            <span ref="targetRef"
                  class="ellipsis"
                  @click="handleClickItem"
            >...</span>
            <p-i name="ic_chevron-right-thin"
                 width="1rem"
                 height="1rem"
                 class="arrow-icon"
                 color="inherit white"
            />
        </span>
        <p-context-menu v-if="visibleContextMenu"
                        ref="contextMenuRef"
                        class="dropdown-context-menu"
                        :menu="props.menu"
                        :style="contextMenuStyle"
                        :selected="state.selectedMenu"
                        @update:selected="handleSelectMenu"
        />
    </span>
</template>

<style scoped lang="postcss">
.breadcrumb-ellipsis-wrapper {
    @apply relative flex flex-col items-center;
    .breadcrumb-ellipsis {
        @apply flex items-center;
        gap: 0.375rem;
        margin-right: 0.375rem;
        word-break: break-all;
        .ellipsis {
            @apply text-label-md text-gray-700 cursor-pointer;

            &:hover {
                @apply text-gray-900 underline;
            }
        }
        .arrow-icon {
            @apply text-gray-500;
        }
    }
    .dropdown-context-menu {
        left: -0.625rem;
        width: 12rem;
        margin-top: 0.25rem;
        z-index: 100;
    }
}
</style>
