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
        <g-n-b-recent-favorite-dropdown v-show="proxyVisibleDropdown" />
    </div>
</template>

<script lang="ts">
import { reactive, toRefs } from '@vue/composition-api';
import vClickOutside from 'v-click-outside';

import GNBRecentFavoriteDropdown from '@/common/modules/navigations/gnb/modules/gnb-recent-favorite/modules/GNBRecentFavoriteDropdown.vue';

import {
    PI,
} from '@spaceone/design-system';
import { useProxyValue } from '@/common/composables/proxy-state';


export default {
    name: 'GNBRecentFavorite',
    components: {
        GNBRecentFavoriteDropdown,
        PI,
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
}
</style>
