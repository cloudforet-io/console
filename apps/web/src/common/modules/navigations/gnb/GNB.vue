<template>
    <div class="gnb">
        <div class="left-part">
            <div class="site-map-wrapper">
                <site-map :menu-list="siteMapMenuList"
                          :visible.sync="showSiteMap"
                          :disabled="!hasPermission"
                />
            </div>

            <g-n-b-logo :to="logoLink" />

            <g-n-b-menu v-for="(menu, idx) in gnbMenuList"
                        :key="`gnb-menu-${idx}`"
                        :show="menu.show"
                        :menu-id="menu.id"
                        :label="menu.label"
                        :to="menu.to"
                        :sub-menu-list="menu.subMenuList"
                        :has-permission="hasPermission"
                        :is-opened="openedMenu === menu.id"
                        :is-selected="selectedMenu === menu.id"
                        :highlight-tag="menu.highlightTag"
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
import {
    reactive, toRefs, computed, getCurrentInstance, defineComponent, onMounted,
} from 'vue';
import type { Vue } from 'vue/types/vue';

import { includes } from 'lodash';

import { store } from '@/store';

import type { DisplayMenu as GNBMenuType } from '@/store/modules/display/type';
import { DOMAIN_CONFIG_TYPE } from '@/store/modules/domain/type';

import { isUserAccessibleToMenu } from '@/lib/access-control';
import type { MenuId } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';

import GNBMenu from '@/common/modules/navigations/gnb/modules/gnb-menu/GNBMenu.vue';
import GNBLogo from '@/common/modules/navigations/gnb/modules/GNBLogo.vue';
import GNBToolset from '@/common/modules/navigations/gnb/modules/GNBToolset.vue';
import SiteMap from '@/common/modules/navigations/gnb/modules/SiteMap.vue';

import { HOME_DASHBOARD_ROUTE } from '@/services/home-dashboard/route-config';

const ALLOWED_MENUS_FOR_ALL_USERS = ['notifications', 'support', 'profile'];

export default defineComponent({
    name: 'GNB',
    components: {
        GNBLogo,
        GNBMenu,
        SiteMap,
        GNBToolset,
    },
    setup() {
        const vm = getCurrentInstance()?.proxy as Vue;

        const state = reactive({
            openedMenu: '',
            showSiteMap: false,
            hasPermission: computed((() => store.getters['user/hasPermission'])),
            logoLink: computed(() => (isUserAccessibleToMenu(MENU_ID.HOME_DASHBOARD, store.getters['user/pagePermissionList']) ? { name: HOME_DASHBOARD_ROUTE._NAME } : null)),
            gnbMenuList: computed<GNBMenuType[]>(() => {
                let result = [...store.getters['display/GNBMenuList']];
                if (state.integrationMenu) result = [...result, state.integrationMenu];
                return result;
            }),
            siteMapMenuList: computed<GNBMenuType[]>(() => store.getters['display/siteMapMenuList']),
            selectedMenu: computed(() => {
                const pathRegex = vm.$route.path.match(/\/(\w+)/);
                return pathRegex ? pathRegex[1] : null;
            }),
            integrationMenu: computed<GNBMenuType | undefined>(() => {
                const extraMenu = store.getters['domain/domainExtraMenu'];
                if (extraMenu?.title) {
                    return {
                        show: true,
                        id: DOMAIN_CONFIG_TYPE.EXTRA_MENU as MenuId,
                        label: extraMenu.title,
                        to: {},
                    };
                }
                return undefined;
            }),
        });

        /* event */
        const hideMenu = () => {
            state.openedMenu = '';
        };
        const handleOpenMenu = (menuName: MenuId) => {
            if (state.openedMenu === menuName) {
                hideMenu();
            } else if (state.hasPermission || includes(ALLOWED_MENUS_FOR_ALL_USERS, menuName)) {
                state.openedMenu = menuName;
                state.showSiteMap = false;
            }
        };

        onMounted(() => {
            store.dispatch('domain/loadExtraMenu');
        });

        return {
            ...toRefs(state),
            hideMenu,
            handleOpenMenu,
        };
    },
});
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
