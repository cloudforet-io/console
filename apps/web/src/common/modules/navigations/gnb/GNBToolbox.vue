<script setup lang="ts">
import { useWindowSize } from '@vueuse/core';
import { computed, reactive } from 'vue';

import {
    PIconButton, PBreadcrumbs, PCopyButton, screens,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import { useProxyValue } from '@/common/composables/proxy-state';
import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';
import { useTopBarHeaderStore } from '@/common/modules/navigations/top-bar/modules/top-bar-header/store';
import type { Breadcrumb } from '@/common/modules/page-layouts/type';

interface Props {
    isMinimizeGnb?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    isMinimizeGnb: false,
});

const topBarHeaderStore = useTopBarHeaderStore();
const topBarHeaderGetters = topBarHeaderStore.getters;

const { width } = useWindowSize();

const emit = defineEmits<{(event: 'update:is-minimize-gnb'): void;
}>();

const state = reactive({
    proxyIsMinimizeGnb: useProxyValue('isMinimizeGnb', props, emit),
    isMobileSize: computed<boolean>(() => width.value < screens.mobile.max),
});

const handleClickMenuButton = () => {
    state.proxyIsMinimizeGnb = !state.proxyIsMinimizeGnb;
};
const handleClickBreadcrumbsItem = (item: Breadcrumb) => {
    if (item) topBarHeaderStore.setSelectedItem(item);
};
const handleClickBreadcrumbsDropdownItem = (item: MenuItem) => {
    if (item) {
        const selectedItem = topBarHeaderGetters.breadcrumbs.find((breadcrumb) => breadcrumb.name === item.name);
        if (selectedItem) topBarHeaderStore.setSelectedItem(selectedItem);
    }
};
</script>

<template>
    <div class="g-n-b-toolbox">
        <div class="navigation-section">
            <p-icon-button name="ic_gnb_menu"
                           style-type="transparent"
                           class="menu-button"
                           shape="square"
                           size="md"
                           @click="handleClickMenuButton"
            />
            <p-breadcrumbs v-if="topBarHeaderGetters.breadcrumbs.length > 0"
                           :routes="topBarHeaderGetters.breadcrumbs"
                           @click="handleClickBreadcrumbsItem"
                           @click-dropdown-menu-item="handleClickBreadcrumbsDropdownItem"
            />
            <favorite-button :item-id="topBarHeaderGetters.favoriteItem?.id"
                             :favorite-type="topBarHeaderGetters.favoriteItem?.type"
                             scale="0.8"
                             class="favorite-button"
            />
        </div>
        <div v-if="topBarHeaderGetters.id"
             class="extra-section"
        >
            <b>{{ $t('COMMON.GNB.TOOLBOX.ID') }}: </b>
            <p-copy-button class="copy-button"
                           size="sm"
                           :value="topBarHeaderGetters.id"
            >
                {{ state.isMobileSize ? '' : topBarHeaderGetters.id }}
            </p-copy-button>
        </div>
    </div>
</template>

<style scoped lang="postcss">
.g-n-b-toolbox {
    @apply justify-between bg-white border-b;
    top: 0;
    width: 100%;
    height: $gnb-toolbox-height;
    padding-right: 1rem;
    padding-left: 0.625rem;
    z-index: 100;
    .navigation-section {
        @apply flex items-center;
        gap: 0.625rem;
        .menu-button {
            @apply border-none text-gray-900;
            margin-bottom: -0.025rem;
            &:hover {
                @apply text-blue-600;
            }
        }
        .favorite-button {
            margin-left: -0.25rem;
        }
    }
    .extra-section {
        @apply flex items-center text-gray-500 text-label-sm;
        gap: 0.25rem;
        .copy-button {
            @apply flex items-center text-gray-500;
        }
    }
}

/* custom design-system component - p-copy-button */
:deep(.p-copy-button) {
    .copy-button-alert {
        top: calc($top-bar-height + $gnb-toolbox-height - 0.5rem) !important;
    }
}
</style>
