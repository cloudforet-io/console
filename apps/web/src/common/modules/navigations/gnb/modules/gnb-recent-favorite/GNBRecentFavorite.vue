<script lang="ts" setup>

import {
    PI, PTab,
} from '@spaceone/design-system';
import type { TabItem } from '@spaceone/design-system/types/navigation/tabs/tab/type';
import { onClickOutside } from '@vueuse/core';
import type { MaybeRef } from 'vue';
import {
    computed, reactive, ref,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

import GNBFavorite from '@/common/modules/navigations/gnb/modules/gnb-recent-favorite/modules/GNBFavorite.vue';
import GNBRecent from '@/common/modules/navigations/gnb/modules/gnb-recent-favorite/modules/GNBRecent.vue';


interface Props {
    visible: boolean
}
const props = defineProps<Props>();
const emit = defineEmits<{(e: 'update:visible', value: boolean): void}>();
const store = useStore();
const { t } = useI18n();

const containerRef = ref<HTMLElement|null>(null);
const state = reactive({
    tabs: computed(() => ([
        { label: t('COMMON.GNB.RECENT.RECENT'), name: 'recent', keepAlive: true },
        { label: t('COMMON.GNB.FAVORITES.FAVORITES'), name: 'favorite', keepAlive: true },
    ] as TabItem[])),
    activeTab: 'recent',
});

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
        store.dispatch('reference/project/load'),
        store.dispatch('reference/projectGroup/load'),
        store.dispatch('reference/cloudServiceType/load'),
    ]);
})();

onClickOutside(containerRef as MaybeRef, hideRecentFavoriteMenu);

</script>

<template>
    <div ref="containerRef"
         class="gnb-recent-favorite"
         @click.stop
         @keydown.esc="hideRecentFavoriteMenu"
    >
        <span class="menu-button"
              tabindex="0"
              role="button"
              @keydown.enter="showRecentFavoriteMenu"
              @click.stop="handleRecentFavoriteButtonClick"
        >
            <p-i class="menu-icon"
                 name="ic_gnb_recent-favorite"
                 height="1.5rem"
                 width="1.5rem"
                 color="inherit"
            />
        </span>
        <p-tab v-show="visible"
               v-model:active-tab="state.activeTab"
               :tabs="state.tabs"
        >
            <template #recent>
                <g-n-b-recent :visible="visible && state.activeTab === 'recent'"
                              @close="hideRecentFavoriteMenu"
                />
            </template>
            <template #favorite>
                <g-n-b-favorite @close="hideRecentFavoriteMenu" />
            </template>
        </p-tab>
    </div>
</template>

<style lang="postcss" scoped>
.gnb-recent-favorite {
    @apply relative;

    .menu-button {
        @apply text-gray-500;
        line-height: $gnb-height;
        cursor: pointer;
        margin-left: 1.25rem;

        &.opened {
            @apply text-violet-400;
        }

        @media (hover: hover) {
            &:hover {
                @apply text-violet-400;
            }
        }
    }

    /* custom design-system component - p-tab */
    :deep(.p-tab) {
        @apply absolute bg-white rounded-xs border border-gray-200;
        display: flex;
        flex-direction: column;
        width: 27.5rem;
        min-height: auto;
        top: 100%;
        right: 0;
        box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.08);
        margin-top: -0.5rem;
        margin-right: -0.5rem;
        .tab-pane {
            padding-bottom: 0;
        }
    }
}
</style>
