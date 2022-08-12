<template>
    <div class="gnb">
        <div class="left-part">
            <div class="site-map-wrapper">
                <site-map :menu-list="menuList" :visible.sync="showSiteMap" :disabled="!hasPermission" />
            </div>

            <g-n-b-logo :to="dashboardLink" />

            <g-n-b-menu v-for="(menu, idx) in menuList"
                        :key="idx"
                        :show="menu.show"
                        :name="menu.id"
                        :label="menu.label"
                        :to="menu.to"
                        :sub-menu-list="menu.subMenuList"
                        :has-permission="hasPermission"
                        :is-opened="openedMenu === menu.id"
                        :is-selected="selectedMenu === menu.id"
                        @open-menu="handleOpenMenu"
                        @hide-menu="hideMenu"
            />
        </div>
        <g-n-b-toolset class="right-part"
                       :opened-menu="openedMenu"
                       @open-menu="handleOpenMenu"
                       @hide-menu="hideMenu"
        />
    </div>
</template>

<script lang="ts">
import type { ComponentRenderProxy } from '@vue/composition-api';
import {
    reactive, toRefs, computed, getCurrentInstance,
} from '@vue/composition-api';

import { includes } from 'lodash';
import vClickOutside from 'v-click-outside';


import { store } from '@/store';

import type { DisplayMenu as GNBMenuType } from '@/store/modules/display/type';

import GNBMenu from '@/common/modules/navigations/gnb/modules/gnb-menu/GNBMenu.vue';
import GNBLogo from '@/common/modules/navigations/gnb/modules/GNBLogo.vue';
import GNBToolset from '@/common/modules/navigations/gnb/modules/GNBToolset.vue';
import SiteMap from '@/common/modules/navigations/gnb/modules/SiteMap.vue';

import { DASHBOARD_ROUTE } from '@/services/dashboard/route-config';


const ALLOWED_MENUS_FOR_ALL_USERS = ['notifications', 'support', 'profile'];

export default {
    name: 'GNB',
    components: {
        GNBLogo,
        GNBMenu,
        SiteMap,
        GNBToolset,
    },
    directives: {
        clickOutside: vClickOutside.directive,
    },
    setup() {
        const vm = getCurrentInstance()?.proxy as ComponentRenderProxy;

        const state = reactive({
            openedMenu: '',
            showSiteMap: false,
            hasPermission: computed((() => store.getters['user/hasPermission'])),
            dashboardLink: computed(() => (state.hasPermission ? { name: DASHBOARD_ROUTE._NAME } : undefined)),
            menuList: computed<GNBMenuType[]>(() => store.getters['display/GNBMenuList']),
            selectedMenu: computed(() => {
                const pathRegex = vm.$route.path.match(/\/(\w+)/);
                return pathRegex ? pathRegex[1] : null;
            }),
        });

        /* event */
        const hideMenu = () => {
            state.openedMenu = '';
        };
        const handleOpenMenu = (menuName: string) => {
            if (state.openedMenu === menuName) {
                hideMenu();
            } else if (state.hasPermission || includes(ALLOWED_MENUS_FOR_ALL_USERS, menuName)) {
                state.openedMenu = menuName;
                state.showSiteMap = false;
            }
        };

        return {
            ...toRefs(state),
            hideMenu,
            handleOpenMenu,
        };
    },
};
</script>

<style lang="postcss" scoped>
.gnb {
    @apply bg-white items-center;
    display: flex !important;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);
    .left-part {
        padding-left: 1.5rem;

        @screen tablet {
            padding-left: 0;
        }

        @screen mobile {
            padding-left: 0;
        }
        .site-map-wrapper {
            display: none;
            margin: 0 0.75rem;

            @screen tablet {
                display: inline-block;
            }

            @screen mobile {
                display: inline-block;
            }
        }
    }
    .right-part {
        @apply absolute inline-flex items-center;
        right: 0;
        padding-right: 1.5rem;
    }
}
</style>
