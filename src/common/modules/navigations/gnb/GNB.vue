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

import { ASSET_MANAGEMENT_ROUTE } from '@/services/asset-management/route-config';
import { DASHBOARD_ROUTE } from '@/services/dashboard/route-config';
import { ADMINISTRATION_ROUTE } from '@/services/administration/route-config';
import { PROJECT_ROUTE } from '@/services/project/route-config';
import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/route-config';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';

import { store } from '@/store';
import { i18n } from '@/translations';
import config from '@/lib/config';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';


const PARENT_MENU = Object.freeze({
    project: 'project',
    inventory: 'inventory',
    identity: 'identity',
    monitoring: 'monitoring',
    billing: 'billing',
    plugin: 'plugin',
    management: 'management',
} as const);

const SUB_MENU = Object.freeze({
    'inventory.cloudService': 'inventory.cloudService',
    'inventory.server': 'inventory.server',
    'identity.serviceAccount': 'identity.serviceAccount',
    'identity.user': 'identity.user',
    'monitoring.alertManager': 'monitoring.alertManager',
    'billing.costManagement': 'billing.costManagement',
    'plugin.collector': 'plugin.collector',
    'management.collectorHistory': 'management.collectorHistory',
} as const);

const MENU = Object.freeze({
    ...PARENT_MENU,
    ...SUB_MENU,
});
type MENU = typeof MENU[keyof typeof MENU]

interface Menu {
    name: MENU;
    label: TranslateResult;
    to: Location;
    show?: boolean;
    isNew?: boolean;
    isBeta?: boolean;
    subMenuList?: Menu[];
}

const ALLOWED_MENUS_FOR_ALL_USERS = ['support', 'account', 'notifications'];

const filterMenuByRoute = (menuList: Menu[], disabledMenu: string[], isAdmin: boolean, router: VueRouter): Menu[] => menuList.reduce((results, _menu) => {
    if (disabledMenu.includes(_menu.name) && !isAdmin) return results;

    const menu = { ..._menu };
    if (menu.subMenuList) {
        menu.subMenuList = filterMenuByRoute(menu.subMenuList, disabledMenu, isAdmin, router);
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
            showBilling: computed(() => config.get('BILLING_ENABLED')),
            disabledMenu: computed(() => config.get('DISABLED_MENU')),
            isAdmin: computed((() => store.getters['user/isAdmin'])),
            hasPermission: computed((() => store.getters['user/hasPermission'])),
            dashboardLink: computed(() => (state.hasPermission ? { name: DASHBOARD_ROUTE._NAME } : undefined)),
            allMenuList: computed<Menu[]>(() => [
                {
                    name: PARENT_MENU.project,
                    label: i18n.t('MENU.PROJECT.PROJECT'),
                    to: state.hasPermission ? { name: PROJECT_ROUTE._NAME } : {},
                },
                {
                    name: PARENT_MENU.inventory,
                    label: i18n.t('MENU.INVENTORY.INVENTORY'),
                    to: { name: ASSET_MANAGEMENT_ROUTE._NAME },
                    subMenuList: [
                        {
                            name: SUB_MENU['inventory.cloudService'],
                            label: i18n.t('MENU.INVENTORY.CLOUD_SERVICE'),
                            to: { name: ASSET_MANAGEMENT_ROUTE.CLOUD_SERVICE._NAME },
                        },
                        {
                            name: SUB_MENU['inventory.server'],
                            label: i18n.t('MENU.INVENTORY.SERVER'),
                            to: { name: ASSET_MANAGEMENT_ROUTE.SERVER._NAME },
                        },
                    ],
                },
                {
                    name: PARENT_MENU.identity,
                    label: i18n.t('MENU.IDENTITY.IDENTITY'),
                    to: { name: ADMINISTRATION_ROUTE._NAME },
                    subMenuList: [
                        {
                            name: SUB_MENU['identity.serviceAccount'],
                            label: i18n.t('MENU.IDENTITY.SERVICE_ACCOUNT'),
                            to: { name: ASSET_MANAGEMENT_ROUTE.SERVICE_ACCOUNT._NAME },
                        },
                        {
                            name: SUB_MENU['identity.user'],
                            label: i18n.t('MENU.IDENTITY.USER'),
                            to: { name: ADMINISTRATION_ROUTE.IAM.USER._NAME },
                            show: state.isAdmin,
                        },
                    ],
                },
                {
                    name: PARENT_MENU.monitoring,
                    label: i18n.t('MENU.MONITORING.MONITORING'),
                    to: { name: ALERT_MANAGER_ROUTE._NAME },
                    subMenuList: [
                        {
                            name: SUB_MENU['monitoring.alertManager'],
                            label: i18n.t('MENU.MONITORING.ALERT_MANAGER'),
                            to: { name: ALERT_MANAGER_ROUTE._NAME },
                            isBeta: true,
                        },
                    ],
                },
                {
                    name: PARENT_MENU.billing,
                    label: i18n.t('MENU.BILLING.BILLING'),
                    to: { name: COST_EXPLORER_ROUTE._NAME },
                    show: state.showBilling,
                    subMenuList: [
                        {
                            name: SUB_MENU['billing.costManagement'],
                            label: i18n.t('MENU.BILLING.COST_MANAGEMENT'),
                            to: { name: COST_EXPLORER_ROUTE.DASHBOARD._NAME },
                        },
                    ],
                },
                {
                    name: PARENT_MENU.plugin,
                    label: i18n.t('MENU.PLUGIN.PLUGIN'),
                    to: { name: ASSET_MANAGEMENT_ROUTE._NAME },
                    subMenuList: [
                        {
                            name: SUB_MENU['plugin.collector'],
                            label: i18n.t('MENU.PLUGIN.COLLECTOR'),
                            to: { name: ASSET_MANAGEMENT_ROUTE.COLLECTOR._NAME },
                        },
                    ],
                },
                {
                    name: PARENT_MENU.management,
                    label: i18n.t('MENU.MANAGEMENT.MANAGEMENT'),
                    to: { name: ASSET_MANAGEMENT_ROUTE.COLLECTOR_HISTORY._NAME },
                    subMenuList: [
                        {
                            name: SUB_MENU['management.collectorHistory'],
                            label: i18n.t('MENU.MANAGEMENT.COLLECTOR_HISTORY'),
                            to: { name: ASSET_MANAGEMENT_ROUTE.COLLECTOR_HISTORY._NAME },
                        },
                    ],
                },
            ]),
            menuList: computed<Menu[]>(() => filterMenuByRoute(state.allMenuList, state.disabledMenu, state.isAdmin, vm.$router)),
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

        const init = async () => {
            const { menu } = await SpaceConnector.client.addOns.menu.list();
            const menuList = menu.map(d => ({
                label: d.label,
                name: d.name,
                to: { name: d.name },
                subMenuList: d.sub_menu ? d.sub_menu.map(item => ({
                    ...item,
                    to: { name: item.name },
                })) : [],
            }));
            console.log(menuList);
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
