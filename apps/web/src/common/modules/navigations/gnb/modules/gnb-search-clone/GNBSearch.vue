<script setup lang="ts">
import {
    computed, onMounted, onUnmounted, reactive,
} from 'vue';

import { PI, screens, PTooltip } from '@spaceone/design-system';
import { throttle } from 'lodash';

import { store } from '@/store';
import { i18n } from '@/translations';

import GNBSearchDropdown from '@/common/modules/navigations/gnb/modules/gnb-search-clone/modules/gnb-search-dropdown/GNBSearchDropdown.vue';
import GNBSearchInput from '@/common/modules/navigations/gnb/modules/gnb-search-clone/modules/GNBSearchInput.vue';
import { useGnbSearchStore } from '@/common/modules/navigations/gnb/modules/gnb-search-clone/store';
import type { FocusingDirection } from '@/common/modules/navigations/gnb/modules/gnb-search-clone/type';


const MOBILE_WINDOW_SIZE = screens.mobile.max;

const gnbSearchStore = useGnbSearchStore();

const state = reactive({
    isFocusOnInput: false,
    isFocusOnSuggestion: false,
    focusingDirection: 'DOWNWARD' as FocusingDirection|undefined,
    isOverMobileSize: window.innerWidth > MOBILE_WINDOW_SIZE,
    tooltipTexts: computed<Record<string, string>>(() => ({
        search: i18n.t('COMMON.GNB.TOOLTIP.SEARCH') as string,
    })),
    visible: computed(() => gnbSearchStore.getters.isActivated),
});

/* Event */
const showSearchMenu = async () => {
    state.isFocusOnSuggestion = false;
    if (!state.isFocusOnInput) state.isFocusOnInput = true;
    if (!state.visible) {
        gnbSearchStore.setIsActivated(true);
    }
};

const hideSearchMenu = () => {
    if (state.visible) {
        gnbSearchStore.setIsActivated(false);
        gnbSearchStore.$patch((_state) => {
            _state.state.inputText = '';
        });
        state.isFocusOnInput = false;
        state.isFocusOnSuggestion = false;
        // dataState.filteredCloudServices = [];
        // dataState.filteredMenuList = [];
    }
};

const moveFocusToSuggestion = (focusingDirection: FocusingDirection) => {
    if (!state.visible) {
        gnbSearchStore.setIsActivated(true);
    }
    state.focusingDirection = focusingDirection;
    state.isFocusOnInput = false;
    state.isFocusOnSuggestion = true;
};

const handleSearchButtonClick = () => {
    if (!state.visible) showSearchMenu();
    else hideSearchMenu();
};

const handleMoveFocusEnd = () => {
    state.focusingDirection = undefined;
    state.isFocusOnSuggestion = false;
    state.isFocusOnInput = true;
};

const onWindowResize = throttle(() => {
    state.isOverMobileSize = window.innerWidth > MOBILE_WINDOW_SIZE;
}, 500);

// Keyboard Event: Meta([ctrl or cmd] + K
const handleKeyDown = (e: KeyboardEvent) => {
    if (e.metaKey && e.code === 'KeyK') {
        gnbSearchStore.setIsActivated(!state.visible);
        state.isFocusOnInput = state.visible;
    } else if (e.code === 'Escape') {
        gnbSearchStore.setIsActivated(false);
    }
};

const handleHideSearchMenu = () => { hideSearchMenu(); };

onMounted(() => {
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('keydown', handleKeyDown);
});
onUnmounted(() => {
    window.removeEventListener('resize', onWindowResize);
    window.removeEventListener('keydown', handleKeyDown);
});

/* Init */
(async () => {
    await Promise.allSettled([
        store.dispatch('reference/cloudServiceType/load'),
    ]);
})();

</script>

<template>
    <div class="gnb-search"
         @click.stop
    >
        <g-n-b-search-input v-if="state.isOverMobileSize"
                            :is-focused.sync="state.isFocusOnInput"
                            @click="showSearchMenu"
                            @esc="handleHideSearchMenu"
                            @arrow-up="moveFocusToSuggestion('UPWARD')"
                            @arrow-down="moveFocusToSuggestion('DOWNWARD')"
        />

        <p-tooltip v-else
                   :contents="state.tooltipTexts.search"
                   position="bottom"
        >
            <span :class="{'menu-button': true, 'opened': state.visible}"
                  tabindex="0"
                  role="button"
                  @click.stop="handleSearchButtonClick"
                  @keydown.esc="handleHideSearchMenu"
                  @keydown.enter="showSearchMenu"
            >
                <p-i name="ic_gnb_search"
                     height="1.375rem"
                     width="1.375rem"
                     color="inherit"
                />
            </span>
        </p-tooltip>

        <g-n-b-search-dropdown v-show="state.visible"
                               :focusing-direction.sync="state.focusingDirection"
                               :is-focused.sync="state.isFocusOnSuggestion"
                               @move-focus-end="handleMoveFocusEnd"
                               @close="handleHideSearchMenu"
        >
            <template #search-input>
                <g-n-b-search-input v-if="!state.isOverMobileSize"
                                    :is-focused.sync="state.isFocusOnInput"
                                    @click="showSearchMenu"
                                    @esc="hideSearchMenu"
                                    @arrow-up="moveFocusToSuggestion('UPWARD')"
                                    @arrow-down="moveFocusToSuggestion('DOWNWARD')"
                />
            </template>
        </g-n-b-search-dropdown>
        <div v-if="state.visible"
             class="background-block"
             @click="handleHideSearchMenu"
        />
    </div>
</template>

<style lang="postcss" scoped>
.gnb-search {
    @apply relative;
    box-shadow: 0 0 8px 0 #00000014;
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
    .background-block {
        @apply fixed inset-0 bg-black;
        opacity: 30%;
        z-index: 999;
    }
}
</style>
