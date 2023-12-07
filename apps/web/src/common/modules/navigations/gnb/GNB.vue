<template>
    <div :class="{'gnb': true, 'admin-gnb': isAdminMode}">
        <div class="left-part">
            <div class="site-map-wrapper">
                <site-map :menu-list="siteMapMenuList"
                          :visible.sync="showSiteMap"
                          :disabled="!hasPermission"
                />
            </div>

            <g-n-b-admin-logo v-if="isAdminMode"
                              :to="adminModeLogoLink"
            />
            <g-n-b-workspace-navigation v-else
                                        :to="userModeLogoLink"
            />

            <div class="gnb-menu-warpper">
                <g-n-b-menu v-for="(menu, idx) in gnbMenuList"
                            :key="`gnb-menu-${idx}`"
                            :is-admin-mode="isAdminMode"
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

import { ROOT_ROUTE } from '@/router/constant';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import type { DisplayMenu as GNBMenuType } from '@/store/modules/display/type';
import { DOMAIN_CONFIG_TYPE } from '@/store/modules/domain/type';

import { isUserAccessibleToMenu } from '@/lib/access-control';
import type { MenuId } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';

import GNBAdminLogo from '@/common/modules/navigations/gnb/modules/gnb-left-part/GNBAdminLogo.vue';
import GNBWorkspaceNavigation from '@/common/modules/navigations/gnb/modules/gnb-left-part/GNBWorkspaceNavigation.vue';
import GNBMenu from '@/common/modules/navigations/gnb/modules/gnb-menu/GNBMenu.vue';
import GNBToolset from '@/common/modules/navigations/gnb/modules/GNBToolset.vue';
import SiteMap from '@/common/modules/navigations/gnb/modules/SiteMap.vue';

const ALLOWED_MENUS_FOR_ALL_USERS = ['notifications', 'support', 'profile'];

export default defineComponent({
    name: 'GNB',
    components: {
        GNBWorkspaceNavigation,
        GNBAdminLogo,
        GNBMenu,
        SiteMap,
        GNBToolset,
    },
    setup() {
        const vm = getCurrentInstance()?.proxy as Vue;
        const appContextStore = useAppContextStore();

        const state = reactive({
            isAdminMode: computed(() => appContextStore.getters.isAdminMode),
            openedMenu: '',
            showSiteMap: false,
            hasPermission: computed((() => store.getters['user/hasPermission'])),
            userModeLogoLink: computed(() => (isUserAccessibleToMenu(MENU_ID.HOME_DASHBOARD, store.getters['user/pagePermissionList']) ? { name: ROOT_ROUTE.WORKSPACE._NAME } : null)),
            adminModeLogoLink: computed(() => (isUserAccessibleToMenu(MENU_ID.HOME_DASHBOARD, store.getters['user/pagePermissionList']) ? { name: ROOT_ROUTE.ADMIN._NAME } : null)),
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

    &.admin-gnb {
        @apply bg-violet-900;
        background: linear-gradient(90deg, #2c0f66 14.69%, #7d5dd2 100%);
        box-shadow: 0 0.125rem 0.25rem 0 rgba(0, 0, 0, 0.12);
    }

    .left-part {
        @apply h-full w-full flex;

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

        .gnb-menu-warpper {
            @apply inline-flex;
        }
    }
    .right-part {
        @apply absolute inline-flex items-center;
        right: 0;
        padding-right: 1.5rem;
    }
}
</style>
