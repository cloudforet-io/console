<template>
    <div class="g-n-b-dashboard-menu">
        <p-tab :tabs="tabs"
               :active-tab.sync="activeTab"
        >
            <template #favorite>
                <g-n-b-dashboard-favorite @close="hideMenu" />
            </template>
            <template #recent>
                <g-n-b-dashboard-recent :visible="activeTab === 'recent'" />
            </template>
            <template #footer>
                <div class="footer-wrapper">
                    <div v-for="(subMenu, index) in subMenuList"
                         :key="`footer-${subMenu.label}-${index}`"
                         class="sub-menu"
                         @click="hideMenu"
                    >
                        <g-n-b-sub-menu :label="subMenu.label"
                                        :to="subMenu.to"
                                        :is-beta="subMenu.isBeta"
                                        :is-new="subMenu.isNew"
                        />
                    </div>
                    <div class="gradient-box" />
                </div>
            </template>
        </p-tab>
    </div>
</template>

<script lang="ts">
import type { SetupContext } from 'vue';
import {
    computed, defineComponent, reactive, toRefs,
} from 'vue';

import { PTab } from '@spaceone/design-system';
import type { TabItem } from '@spaceone/design-system/dist/src/navigation/tabs/tab/type';

import { i18n } from '@/translations';

import type { DisplayMenu } from '@/store/modules/display/type';

import GNBSubMenu from '@/common/modules/navigations/gnb/modules/gnb-menu/GNBSubMenu.vue';
import GNBDashboardFavorite
    from '@/common/modules/navigations/gnb/modules/gnb-menu/modules/dashboard-recent-favorite/modules/GNBDashboardFavorite.vue';
import GNBDashboardRecent
    from '@/common/modules/navigations/gnb/modules/gnb-menu/modules/dashboard-recent-favorite/modules/GNBDashboardRecent.vue';

import { DASHBOARDS_ROUTE } from '@/services/dashboards/route-config';

export default defineComponent({
    name: 'GNBDashboardMenu',
    components: {
        PTab,
        GNBDashboardRecent,
        GNBDashboardFavorite,
        GNBSubMenu,
    },
    setup(props, { emit }: SetupContext) {
        const state = reactive({
            tabs: computed(() => ([
                { label: i18n.t('COMMON.GNB.FAVORITES.FAVORITES'), name: 'favorite', keepAlive: true },
                { label: i18n.t('COMMON.GNB.RECENT.RECENT'), name: 'recent', keepAlive: true },
            ] as TabItem[])),
            activeTab: 'favorite',
            subMenuList: [
                {
                    label: 'View All Dashboards', // song-lang
                    to: { name: DASHBOARDS_ROUTE.ALL._NAME },
                },
                {
                    label: 'Create New Dashboard', // song-lang
                    to: { name: DASHBOARDS_ROUTE.CREATE._NAME },
                },
            ] as DisplayMenu[],
        });
        const hideMenu = () => { emit('close'); };
        return {
            ...toRefs(state),
            hideMenu,
        };
    },
});
</script>

<style lang="postcss" scoped>
.g-n-b-dashboard-menu {
    /* custom design-system component - p-tab */
    :deep(.p-tab) {
        @apply absolute bg-white rounded-xs border border-gray-200;
        display: flex;
        flex-direction: column;
        width: 22.5rem;
        min-height: auto;
        right: 0;
        box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.08);
        .tab-pane {
            padding-bottom: 0;
        }
    }
    .footer-wrapper {
        position: relative;
        .sub-menu {
            @apply border-t border-gray-200;
            padding: 0.5rem;
        }
        .gradient-box {
            position: absolute;
            top: -3rem;
            width: 100%;
            height: 3rem;
            background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, #fff 100%);
        }
    }

    &:hover {
        .gradient-box {
            display: none;
        }
    }
}

</style>
