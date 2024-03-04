<script lang="ts" setup>
import { vOnClickOutside } from '@vueuse/components';
import {
    defineEmits,
} from 'vue';

import {
    PI,
} from '@spaceone/design-system';

import { store } from '@/store';

import TopBarFavorite
    from '@/common/modules/navigations/top-bar/modules/top-bar-toolset/modules/top-bar-favorite/modules/TopBarFavorite.vue';

interface Props {
    visible: boolean
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
});

const emit = defineEmits<{(e: 'update:visible', visible: boolean): void}>();

const setVisible = (visible: boolean) => {
    emit('update:visible', visible);
};
const hideRecentFavoriteMenu = () => {
    setVisible(false);
};
const showRecentFavoriteMenu = () => {
    setVisible(true);
};

/* Event */
const handleRecentFavoriteButtonClick = () => {
    setVisible(!props.visible);
};

/* Init */
(async () => {
    await Promise.allSettled([
        store.dispatch('reference/cloudServiceType/load'),
    ]);
})();
</script>

<template>
    <div v-on-click-outside="hideRecentFavoriteMenu"
         class="top-bar-recent-favorite"
         @click.stop
         @keydown.esc="hideRecentFavoriteMenu"
    >
        <span :class="{'menu-button': true, 'opened': props.visible}"
              tabindex="0"
              role="button"
              @keydown.enter="showRecentFavoriteMenu"
              @click.stop="handleRecentFavoriteButtonClick"
        >
            <p-i class="menu-icon"
                 name="ic_star"
                 height="1.375rem"
                 width="1.375rem"
                 color="inherit"
            />
        </span>
        <div v-show="visible"
             class="favorite-content"
        >
            <top-bar-favorite @close="hideRecentFavoriteMenu" />
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.top-bar-recent-favorite {
    @apply relative;

    .menu-button {
        @apply inline-flex items-center justify-center text-gray-500 rounded-full;
        width: 2rem;
        height: 2rem;
        line-height: $top-bar-height;
        cursor: pointer;

        &:hover {
            @apply text-blue-600 bg-blue-100;
        }

        &.opened {
            @apply text-blue-600 bg-blue-200;
        }
    }

    .favorite-content {
        @apply absolute bg-white rounded-xs border border-gray-200;
        display: flex;
        flex-direction: column;
        width: 27.5rem;
        min-height: auto;
        top: 100%;
        right: 0;
        box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.08);
        margin-right: -0.5rem;
        z-index: 1000;
    }
}
</style>
