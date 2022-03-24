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
                        @toggle="toggleMenu"
                        @hide="hideMenu"
            />

            <right-side-menu class="right-part"
                             :opened-menu="openedMenu"
                             @toggle-menu="toggleMenu"
                             @hide-menu="hideMenu"
            />
        </div>
    </div>
</template>

<script lang="ts">
import vClickOutside from 'v-click-outside';
import { includes } from 'lodash';

import {
    reactive, toRefs, computed, getCurrentInstance, ComponentRenderProxy,
} from '@vue/composition-api';

import SiteMap from '@/common/modules/navigations/gnb/modules/SiteMap.vue';
import RightSideMenu from '@/common/modules/navigations/gnb/modules/RightSideMenu.vue';
import GNBMenu from '@/common/modules/navigations/gnb/modules/gnb-menu/GNBMenu.vue';
import GNBLogo from '@/common/modules/navigations/gnb/modules/GNBLogo.vue';

import { DASHBOARD_ROUTE } from '@/services/dashboard/route-config';

import { GNBMenu as GNBMenuType } from '@/store/modules/display/type';
import { store } from '@/store';
import config from '@/lib/config';
import ErrorHandler from '@/common/composables/error/errorHandler';

const ALLOWED_MENUS_FOR_ALL_USERS = ['support', 'account', 'notifications'];

export default {
    name: 'GNB',
    components: {
        GNBLogo,
        GNBMenu,
        SiteMap,
        RightSideMenu,
    },
    directives: {
        clickOutside: vClickOutside.directive,
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const state = reactive({
            openedMenu: '',
            showSiteMap: false,
            showPowerScheduler: computed(() => store.state.user.powerSchedulerState),
            showBilling: computed(() => config.get('BILLING_ENABLED')),
            disabledMenu: computed(() => config.get('DISABLED_MENU')),
            isAdmin: computed((() => store.getters['user/isAdmin'])),
            hasPermission: computed((() => store.getters['user/hasPermission'])),
            dashboardLink: computed(() => (state.hasPermission ? { name: DASHBOARD_ROUTE._NAME } : undefined)),
            menuList: computed<GNBMenuType[]>(() => store.getters['display/GNBMenuList']),
            selectedMenu: computed(() => {
                const pathRegex = vm.$route.path.match(/\/(\w+)/);
                return pathRegex ? pathRegex[1] : null;
            }),
            loading: true,
        });

        /* event */
        const hideMenu = () => {
            state.openedMenu = '';
        };
        const toggleMenu = (menuName: string) => {
            if (state.openedMenu === menuName) {
                hideMenu();
            } else if (state.hasPermission || includes(ALLOWED_MENUS_FOR_ALL_USERS, menuName)) {
                state.openedMenu = menuName;
                state.showSiteMap = false;
            }
        };

        const init = async () => {
            try {
                state.loading = true;
                await store.dispatch('display/setMenuList');
            } catch (e) {
                ErrorHandler.handleError(e);
            } finally {
                state.loading = false;
            }
        };

        (() => init())();

        return {
            ...toRefs(state),
            hideMenu,
            toggleMenu,
        };
    },
};
</script>

<style lang="postcss" scoped>
.gnb {
    @apply bg-white;
    display: flex !important;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);

    .left-part, .right-part {
        line-height: $gnb-height;
    }
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
        position: absolute;
        display: inline-flex;
        right: 0;
        padding-right: 1.5rem;
    }
}
</style>
