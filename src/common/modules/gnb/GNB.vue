<template>
    <div class="gnb" :class="{'disabled': !hasPermission}">
        <div class="left-part">
            <div class="site-map-wrapper">
                <site-map :menu-list="menuList" :visible.sync="showSiteMap" :disabled="!hasPermission" />
            </div>
            <component :is="hasPermission ? 'router-link' : 'div'"
                       class="inline-block" :to="dashboardLink"
            >
                <div class="logo-wrapper mr-4 lg:mr-10">
                    <template v-if="images">
                        <img class="logo-character" :src="images.ciLogo">
                        <img class="logo-text" :src="images.ciText">
                    </template>
                    <template v-else>
                        <img class="logo-character" src="@/assets/images/brand/brand_logo.png">
                        <img class="logo-text" src="@/assets/images/brand/SpaceONE_logoTypeA.svg">
                    </template>
                </div>
            </component>
            <div v-for="(menu, idx) in menuList"
                 :key="idx"
                 class="menu-wrapper hidden md:inline-block"
            >
                <div v-if="menu.show !== false"
                     class="menu-button mr-4 lg:mr-8"
                     :class="[{
                         opened: menu.subMenuList.length > 0 && openedMenu === menu.name,
                         selected: menu.name === selectedMenu
                     }]"
                     @click.stop="toggleMenu(menu.name)"
                >
                    <span v-if="menu.subMenuList.length > 0">
                        <span>{{ menu.label }}</span>
                        <p-i class="arrow-button"
                             :name="openedMenu === menu.name ? 'ic_arrow_top_sm' : 'ic_arrow_bottom_sm'"
                             width="0.5rem" height="0.5rem"
                             color="inherit transparent"
                        />
                    </span>
                    <component :is="hasPermission ? 'router-link' : 'span'"
                               v-else
                               :to="menu.to" class="block"
                    >
                        <span>{{ menu.label }}</span>
                    </component>
                    <div v-if="openedMenu === menu.name && menu.subMenuList.length > 0"
                         v-click-outside="hideMenu"
                         class="sub-menu-wrapper"
                    >
                        <template v-for="(subMenu, index) in menu.subMenuList" @click.native="hideMenu">
                            <router-link v-if="subMenu.show" :key="index" :to="subMenu.to">
                                <div class="sub-menu">
                                    <span>{{ subMenu.label }}</span>
                                    <span v-if="subMenu.isBeta" class="beta-text">beta</span>
                                    <span v-if="subMenu.isNew" class="new-text">new</span>
                                </div>
                            </router-link>
                        </template>
                    </div>
                </div>
            </div>
        </div>

        <right-side-menu class="right-part"
                         :opened-menu="openedMenu"
                         @toggle-menu="toggleMenu"
                         @hide-menu="hideMenu"
        />
    </div>
</template>

<script lang="ts">
import vClickOutside from 'v-click-outside';
import { TranslateResult } from 'vue-i18n';
import { includes, isEmpty } from 'lodash';
import { Location } from 'vue-router';

import {
    reactive, toRefs, computed, getCurrentInstance, ComponentRenderProxy,
} from '@vue/composition-api';

import { PI } from '@spaceone/design-system';

import SiteMap from '@/common/modules/gnb/SiteMap.vue';
import RightSideMenu from '@/common/modules/gnb/RightSideMenu.vue';

import { INVENTORY_ROUTE } from '@/routes/inventory/inventory-route';
import { PLUGIN_ROUTE } from '@/routes/plugin/plugin-route';
import { MANAGEMENT_ROUTE } from '@/routes/management/management-route';
import { DASHBOARD_ROUTE } from '@/routes/dashboard/dashboard-route';
import { AUTOMATION_ROUTE } from '@/routes/automation/automation-route';
import { IDENTITY_ROUTE } from '@/routes/identity/identity-route';
import { PROJECT_ROUTE } from '@/routes/project/project-route';
import { MONITORING_ROUTE } from '@/routes/monitoring/monitoring-route';
import { store } from '@/store';
import { i18n } from '@/translations';
import config from '@/lib/config';


enum PARENT_CATEGORY {
    project = 'project',
    inventory = 'inventory',
    identity = 'identity',
    monitoring = 'monitoring',
    automation = 'automation',
    plugin = 'plugin',
    management = 'management',
}

interface SubMenu {
    label: TranslateResult;
    to: Location['query'];
    show: boolean;
    isNew?: boolean;
    isBeta?: boolean;
}
interface Menu {
    name: keyof typeof PARENT_CATEGORY;
    label: TranslateResult;
    to: Location['query'];
    show?: boolean;
    subMenuList: SubMenu[];
}

const ALLOWED_MENUS_FOR_ALL_USERS = ['support', 'account'];

export default {
    name: 'GNB',
    components: {
        SiteMap,
        RightSideMenu,
        PI,
    },
    directives: {
        clickOutside: vClickOutside.directive,
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            images: computed(() => {
                const domainImage = config.get('DOMAIN_IMAGE');
                if (!isEmpty(domainImage)) {
                    return {
                        ciLogo: config.get('DOMAIN_IMAGE.CI_LOGO'),
                        ciText: config.get('DOMAIN_IMAGE.CI_TEXT'),
                        signIn: config.get('DOMAIN_IMAGE.SIGN_IN'),
                    };
                }
                return undefined;
            }),
            openedMenu: null,
            showSiteMap: false,
            showPowerScheduler: computed(() => store.state.user.powerSchedulerState),
            showSpotAutomation: computed(() => store.state.user.spotAutomationState),
            showAutomation: computed(() => state.showPowerScheduler || state.showSpotAutomation),
            isAdmin: computed((() => store.getters['user/isAdmin'])),
            hasPermission: computed((() => store.getters['user/hasPermission'])),
            dashboardLink: computed(() => (state.hasPermission ? { name: DASHBOARD_ROUTE._NAME } : {})),
            menuList: computed<Menu[]>(() => [
                {
                    name: PARENT_CATEGORY.project,
                    label: i18n.t('MENU.PROJECT.PROJECT'),
                    to: state.hasPermission ? { name: PROJECT_ROUTE._NAME } : {},
                    subMenuList: [],
                },
                {
                    name: PARENT_CATEGORY.inventory,
                    label: i18n.t('MENU.INVENTORY.INVENTORY'),
                    to: { name: INVENTORY_ROUTE._NAME },
                    subMenuList: [
                        { label: i18n.t('MENU.INVENTORY.CLOUD_SERVICE'), to: { name: INVENTORY_ROUTE.CLOUD_SERVICE._NAME }, show: true },
                        { label: i18n.t('MENU.INVENTORY.SERVER'), to: { name: INVENTORY_ROUTE.SERVER._NAME }, show: true },
                    ],
                },
                {
                    name: PARENT_CATEGORY.identity,
                    label: i18n.t('MENU.IDENTITY.IDENTITY'),
                    to: { name: IDENTITY_ROUTE._NAME },
                    subMenuList: [
                        {
                            label: i18n.t('MENU.IDENTITY.SERVICE_ACCOUNT'),
                            to: { name: IDENTITY_ROUTE.SERVICE_ACCOUNT._NAME },
                            show: true,
                        },
                        { label: i18n.t('MENU.IDENTITY.USER'), to: { name: IDENTITY_ROUTE.USER.MANAGEMENT._NAME }, show: state.isAdmin },
                    ],
                },
                {
                    name: PARENT_CATEGORY.monitoring,
                    label: i18n.t('MENU.MONITORING.MONITORING'),
                    to: { name: MONITORING_ROUTE._NAME },
                    subMenuList: [
                        {
                            label: i18n.t('MENU.MONITORING.ALERT_MANAGER'),
                            to: { name: MONITORING_ROUTE.ALERT_MANAGER._NAME },
                            isBeta: true,
                            show: true,
                        },
                    ],
                },
                {
                    name: PARENT_CATEGORY.automation,
                    label: i18n.t('MENU.AUTOMATION.AUTOMATION'),
                    show: state.showAutomation,
                    to: { name: AUTOMATION_ROUTE._NAME },
                    subMenuList: [
                        {
                            label: i18n.t('MENU.AUTOMATION.POWER_SCHEDULER'),
                            to: { name: AUTOMATION_ROUTE.POWER_SCHEDULER._NAME },
                            isNew: true,
                            show: state.showPowerScheduler,
                        },
                        {
                            label: i18n.t('MENU.AUTOMATION.SPOT_AUTOMATION'),
                            to: { name: AUTOMATION_ROUTE.SPOT_AUTOMATION.SPOT_GROUP._NAME },
                            isNew: true,
                            show: state.showSpotAutomation,
                        },
                    ],
                },
                {
                    name: PARENT_CATEGORY.plugin,
                    label: i18n.t('MENU.PLUGIN.PLUGIN'),
                    to: { name: PLUGIN_ROUTE._NAME },
                    subMenuList: [
                        { label: i18n.t('MENU.PLUGIN.COLLECTOR'), to: { name: PLUGIN_ROUTE.COLLECTOR._NAME }, show: true },
                    ],
                },
                {
                    name: PARENT_CATEGORY.management,
                    label: i18n.t('MENU.MANAGEMENT.MANAGEMENT'),
                    to: { name: MANAGEMENT_ROUTE.HISTORY.COLLECTOR._NAME },
                    subMenuList: [
                        {
                            label: i18n.t('MENU.MANAGEMENT.COLLECTOR_HISTORY'), to: { name: MANAGEMENT_ROUTE.HISTORY.COLLECTOR._NAME }, show: true,
                        },
                    ],
                },
            ]),
            selectedMenu: computed(() => {
                const pathRegex = vm.$route.path.match(/\/(\w+)/);
                return pathRegex ? pathRegex[1] : null;
            }),
        });

        /* event */
        const hideMenu = () => {
            state.openedMenu = null;
        };
        const toggleMenu = (menu) => {
            if (state.openedMenu === menu) {
                hideMenu();
            } else if (state.hasPermission || includes(ALLOWED_MENUS_FOR_ALL_USERS, menu)) {
                state.openedMenu = menu;
                state.showSiteMap = false;
            }
        };

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
        line-height: 3rem;
    }
    .left-part {
        .site-map-wrapper {
            display: inline-block;
            margin: 0 1rem;
        }
        .logo-wrapper {
            display: inline-block;
            .logo-character {
                display: inline-block;
                width: 1.875rem;
                height: 1.875rem;
            }
            .logo-text {
                display: none;
                height: 0.875rem;
                margin-left: 0.5rem;

                @screen lg {
                    display: inline-block;
                }
            }
        }
    }
    .right-part {
        position: absolute;
        display: inline-flex;
        right: 0;
        padding-right: 1.5rem;
    }
    .menu-wrapper {
        position: relative;

        .menu-button {
            @apply text-gray-900;
            font-size: 0.875rem;
            cursor: pointer;
            text-decoration: none;
            text-transform: capitalize;
            opacity: 0.5;

            &.opened {
                @apply text-primary;
                opacity: 1;
            }
            &.selected {
                opacity: 1;
            }
            &:hover {
                @apply text-primary;
                opacity: 1;
            }

            .arrow-button {
                margin-left: 0.25rem;
            }
        }
        .sub-menu-wrapper {
            @apply bg-white border border-gray-200;
            position: absolute;
            top: 2.5rem;
            left: -1.125rem;
            min-width: 10rem;
            box-shadow: 0 0 0.875rem rgba(0, 0, 0, 0.1);
            border-radius: 0.125rem;
            padding: 0.5rem;
            margin: 3px 0;

            .sub-menu {
                @apply text-gray-900;
                position: relative;
                width: 100%;
                height: 2rem;
                font-size: 0.875rem;
                line-height: 1rem;
                text-decoration: none;
                white-space: nowrap;
                cursor: pointer;
                border-radius: 0.25rem;
                padding: 0.5rem;
                &:hover, &:focus {
                    @apply bg-primary4 text-primary;
                }
                &:active {
                    @apply bg-white;
                }
            }
            .beta-text {
                @apply text-coral;
                font-size: 0.75rem;
                vertical-align: text-top;
                cursor: default;
                margin-left: 0.25rem;
            }
            .new-text {
                font-size: 0.75rem;
                background: linear-gradient(to right, theme('colors.primary'), theme('colors.secondary'));
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                vertical-align: text-top;
                cursor: default;
                margin-left: 0.25rem;
            }
        }
    }

    &.disabled {
        .menu-button {
            @apply text-gray-900;
            cursor: not-allowed;
            opacity: 0.2;

            &.selected {
                opacity: 0.2;
            }
            &:hover {
                @apply text-gray-900;
                opacity: 0.2;
            }
        }
    }
}
</style>
