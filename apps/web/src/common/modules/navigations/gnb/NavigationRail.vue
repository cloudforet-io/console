<script setup lang="ts">
import { reactive } from 'vue';

import { PI } from '@spaceone/design-system';

interface Props {
    isMinimizeGnb?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    isMinimizeGnb: false,
});

const state = reactive({
    isHovered: false,
});

const handleMouseEvent = (value: boolean) => {
    state.isHovered = value;
};
</script>

<template>
    <div class="navigation-rail"
         :class="{'is-minimize': props.isMinimizeGnb}"
         @mouseover="handleMouseEvent(true)"
         @mouseleave="handleMouseEvent(false)"
    >
        <!--  TODO: will be updated -->
        <div class="icon-wrapper">
            <p-i name="ic_service_home"
                 class="menu-button"
                 height="1.25rem"
                 width="1.25rem"
                 color="inherit"
            />
            <span v-if="!props.isMinimizeGnb || state.isHovered"
                  class="menu-title"
            >
                menu title
            </span>
        </div>
    </div>
</template>

<style scoped lang="postcss">
.navigation-rail {
    @apply flex-col border-r;
    top: $gnb-toolbox-height;
    width: $gnb-navigation-rail-max-width;
    height: 100%;
    padding-top: 1rem;
    padding-bottom: 1rem;
    transition: width 0.3s ease;
    .icon-wrapper {
        @apply flex items-center;
        gap: 0.75rem;
        .menu-title {
            @apply text-label-md;
        }
        &:not(.is-minimize) {
            @apply cursor-pointer;
        }
    }
    &.is-minimize {
        @apply cursor-pointer;
        width: $gnb-navigation-rail-min-width;
        &:hover {
            width: $gnb-navigation-rail-max-width;
        }
    }
}
</style>
