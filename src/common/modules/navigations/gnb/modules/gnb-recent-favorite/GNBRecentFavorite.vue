<template>
    <div class="gnb-recent-favorite" @click.stop="$emit('click')">
        <span class="menu-button">
            <p-i class="menu-icon"
                 name="ic_recent_and_favorite"
                 height="1.5rem" width="1.5rem"
                 color="inherit"
                 @click.stop="handleClickButton"
            />
        </span>
        <p-tab v-show="proxyVisibleDropdown"
               :tabs="tabs"
               :active-tab.sync="activeTab"
        >
            <template #recent>
                <g-n-b-recent />
            </template>
            <template #favorite>
                <g-n-b-favorite />
            </template>
        </p-tab>
    </div>
</template>

<script lang="ts">
import { computed, reactive, toRefs } from '@vue/composition-api';
import vClickOutside from 'v-click-outside';

import {
    PI, PTab,
} from '@spaceone/design-system';

import GNBRecent from '@/common/modules/navigations/gnb/modules/gnb-recent-favorite/modules/GNBRecent.vue';
import GNBFavorite from '@/common/modules/navigations/gnb/modules/gnb-recent-favorite/modules/GNBFavorite.vue';

import { useProxyValue } from '@/common/composables/proxy-state';
import { TabItem } from '@spaceone/design-system/dist/src/navigation/tabs/tab/type';


export default {
    name: 'GNBRecentFavorite',
    components: {
        GNBRecent,
        GNBFavorite,
        PI,
        PTab,
    },
    directives: {
        clickOutside: vClickOutside.directive,
    },
    props: {
        visibleDropdown: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            proxyVisibleDropdown: useProxyValue('visibleDropdown', props, emit),
            tabs: computed(() => ([
                { label: 'Recent Visits', name: 'recent', keepAlive: true },
                { label: 'Favorites', name: 'favorite', keepAlive: true },
            ] as TabItem[])),
            activeTab: 'recent',
        });

        /* Event */
        const handleClickOutside = () => {
            state.proxyVisibleDropdown = false;
        };
        const handleClickButton = () => {
            state.proxyVisibleDropdown = !state.proxyVisibleDropdown;
        };

        return {
            ...toRefs(state),
            handleClickOutside,
            handleClickButton,
        };
    },
};
</script>
<style lang="postcss" scoped>
.gnb-recent-favorite {
    @apply relative;

    .menu-button {
        @apply text-gray-500;
        line-height: $gnb-height;
        cursor: pointer;
        margin-left: 1.5rem;

        &.opened {
            @apply text-violet-400;
        }

        @media (hover: hover) {
            &:hover {
                @apply text-violet-400;
            }
        }
    }
    .p-tab::v-deep {
        @apply absolute bg-white rounded-xs border border-gray-200;
        display: flex;
        flex-direction: column;
        width: 27.5rem;
        top: 100%;
        right: 0;
        box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.08);
        .tab-pane {
            padding-bottom: 0;
        }
    }
}
</style>
