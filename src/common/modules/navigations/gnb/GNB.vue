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
                        :name="menu.name"
                        :label="menu.label"
                        :to="menu.to"
                        :sub-menu-list="menu.subMenuList"
                        :has-permission="hasPermission"
                        :is-opened="openedMenu === menu.name"
                        :is-selected="selectedMenu === menu.name"
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
import { TranslateResult } from 'vue-i18n';
import { includes } from 'lodash';
import VueRouter, { Location } from 'vue-router';

import {
    reactive, toRefs, computed, getCurrentInstance, ComponentRenderProxy,
} from '@vue/composition-api';

import SiteMap from '@/common/modules/navigations/gnb/modules/SiteMap.vue';
import RightSideMenu from '@/common/modules/navigations/gnb/modules/RightSideMenu.vue';
import GNBMenu from '@/common/modules/navigations/gnb/modules/gnb-menu/GNBMenu.vue';
import GNBLogo from '@/common/modules/navigations/gnb/modules/GNBLogo.vue';

import { INVENTORY_ROUTE } from '@/services/inventory/routes';
import { PLUGIN_ROUTE } from '@/services/plugin/routes';
import { MANAGEMENT_ROUTE } from '@/services/management/routes';
import { DASHBOARD_ROUTE } from '@/services/dashboard/routes';
import { AUTOMATION_ROUTE } from '@/services/automation/routes';
import { IDENTITY_ROUTE } from '@/services/identity/routes';
import { PROJECT_ROUTE } from '@/services/project/routes';
import { MONITORING_ROUTE } from '@/services/monitoring/routes';
import { BILLING_ROUTE } from '@/services/billing/routes';

import { store } from '@/store';
import { i18n } from '@/translations';


const PARENT_CATEGORY = {
    project: 'project',
    inventory: 'inventory',
    identity: 'identity',
    monitoring: 'monitoring',
    billing: 'billing',
    automation: 'automation',
    plugin: 'plugin',
    management: 'management',
};
type PARENT_CATEGORY = typeof PARENT_CATEGORY[keyof typeof PARENT_CATEGORY]

interface Menu {
    name?: PARENT_CATEGORY;
    label: TranslateResult;
    to: Location;
    show?: boolean;
    isNew?: boolean;
    isBeta?: boolean;
    subMenuList?: Menu[];
}

const ALLOWED_MENUS_FOR_ALL_USERS = ['support', 'account', 'notifications'];

const filterMenuByRoute = (menuList: Menu[], router: VueRouter): Menu[] => menuList.reduce((results, _menu) => {
    const menu = { ..._menu };
    if (menu.subMenuList) {
        menu.subMenuList = filterMenuByRoute(menu.subMenuList, router);
        if (menu.subMenuList.length) {
            results.push(menu);
            return results;
        }
    }

    const link = router.resolve(menu.to);
    if (link?.href !== '/') results.push(menu);

    return results;
}, [] as Menu[]);

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
            showSpotAutomation: computed(() => store.state.user.spotAutomationState),
            showAutomation: computed(() => state.showPowerScheduler || state.showSpotAutomation),
            isAdmin: computed((() => store.getters['user/isAdmin'])),
            hasPermission: computed((() => store.getters['user/hasPermission'])),
            dashboardLink: computed(() => (state.hasPermission ? { name: DASHBOARD_ROUTE._NAME } : undefined)),
            allMenuList: computed<Menu[]>(() => [
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
                    name: PARENT_CATEGORY.billing,
                    label: i18n.t('MENU.BILLING.BILLING'),
                    to: { name: BILLING_ROUTE._NAME },
                    subMenuList: [
                        {
                            label: i18n.t('MENU.BILLING.COST_MANAGEMENT'),
                            to: { name: BILLING_ROUTE.COST_MANAGEMENT.DASHBOARD._NAME },
                            show: true,
                            // isNew: true,
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
            menuList: computed<Menu[]>(() => filterMenuByRoute(state.allMenuList, vm.$router)),
            selectedMenu: computed(() => {
                const pathRegex = vm.$route.path.match(/\/(\w+)/);
                return pathRegex ? pathRegex[1] : null;
            }),
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
