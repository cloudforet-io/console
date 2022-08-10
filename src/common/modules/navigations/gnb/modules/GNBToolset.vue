<template>
    <div class="gnb-toolset" @click.stop>
        <g-n-b-search v-if="!isDomainOwner"
                      v-click-outside="hideMenu"
                      :visible-suggestion="openedMenu === 'search'"
                      @update:visibleSuggestion="openMenu('search')"
        />
        <g-n-b-recent-favorite v-if="!isDomainOwner"
                               v-click-outside="hideMenu"
                               :visible-dropdown="openedMenu === 'recentFavorite'"
                               @update:visibleDropdown="openMenu('recentFavorite')"
        />
        <g-n-b-noti v-if="!isDomainOwner"
                    v-click-outside="hideMenu"
                    :visible-dropdown="openedMenu === 'notifications'"
                    @update:visibleDropdown="openMenu('notifications')"
        />
        <g-n-b-profile @open-menu="openMenu('profile')"
                       @hide-menu="hideMenu"
        />
    </div>
</template>

<script lang="ts">
import type { ComponentRenderProxy } from '@vue/composition-api';
import {
    computed, getCurrentInstance, onMounted, onUnmounted, reactive, toRefs, watch,
} from '@vue/composition-api';


import { vOnClickOutside } from '@vueuse/components';
import type { DirectiveFunction } from 'vue';

import { store } from '@/store';

import GNBNoti from '@/common/modules/navigations/gnb/modules/gnb-noti/GNBNoti.vue';
import GNBProfile from '@/common/modules/navigations/gnb/modules/gnb-profile/GNBProfile.vue';
import GNBRecentFavorite from '@/common/modules/navigations/gnb/modules/gnb-recent-favorite/GNBRecentFavorite.vue';
import GNBSearch from '@/common/modules/navigations/gnb/modules/gnb-search/GNBSearch.vue';

import { MY_PAGE_ROUTE } from '@/services/my-page/route-config';


export default {
    name: 'GNBToolset',
    components: {
        GNBProfile,
        GNBRecentFavorite,
        GNBSearch,
        GNBNoti,
    },
    directives: {
        clickOutside: vOnClickOutside as DirectiveFunction,
    },
    props: {
        openedMenu: {
            type: String,
            default: null,
        },
    },
    setup(props, { emit }) {
        const vm = getCurrentInstance()?.proxy as ComponentRenderProxy;
        const state = reactive({
            isDomainOwner: computed(() => store.getters['user/isDomainOwner']),
            timezone: computed(() => store.state.user.timezone),
        });

        /* event */
        const hideMenu = () => {
            if (props.openedMenu === 'notifications') {
                store.dispatch('display/startCheckNotification');
            }

            emit('hide-menu');
        };
        const openMenu = (menu) => {
            if (menu === 'notifications') {
                store.dispatch('display/stopCheckNotification');
            }
            emit('open-menu', menu);
        };


        onMounted(() => {
            store.dispatch('display/startCheckNotification');
        });

        onUnmounted(() => {
            store.dispatch('display/stopCheckNotification');
        });

        watch(() => vm.$store.state.user.isSessionExpired, (isSessionExpired) => {
            if (isSessionExpired) store.dispatch('display/stopCheckNotification');
        });

        return {
            ...toRefs(state),
            MY_PAGE_ROUTE,
            hideMenu,
            openMenu,
        };
    },
};
</script>
