<template>
    <aside class="sidebar-menu">
        <div v-for="(item) in menuList" :key="item.label"
             @click="showPage(item.routeName)"
        >
            <sidebar-title :title="item.label"
                           :selected="selectedItem ? item.label === selectedItem.label : ''"
                           style-type="link"
            />
        </div>
    </aside>
</template>

<script lang="ts">
import { TranslateResult } from 'vue-i18n';

import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import SidebarTitle from '@/common/components/titles/sidebar-title/SidebarTitle.vue';

import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/route-config';
import { i18n } from '@/translations';
import { SpaceRouter } from '@/router';


interface MenuItem {
    routeName: string;
    label: TranslateResult;
}

export default {
    name: 'AlertManagerLNB',
    components: {
        SidebarTitle,
    },
    setup() {
        const state = reactive({
            menuList: computed(() => [
                {
                    routeName: ALERT_MANAGER_ROUTE.DASHBOARD._NAME,
                    label: i18n.t('MONITORING.ALERT.MAIN.DASHBOARD'),
                },
                {
                    routeName: ALERT_MANAGER_ROUTE.ALERT._NAME,
                    label: i18n.t('MONITORING.ALERT.MAIN.ALERT'),
                },
                {
                    routeName: ALERT_MANAGER_ROUTE.ESCALATION_POLICY._NAME,
                    label: i18n.t('MONITORING.ALERT.MAIN.ESCALATION_POLICY'),
                },
            ]) as unknown as MenuItem[],
            selectedItem: {} as MenuItem,
        });

        const showPage = (routeName) => {
            SpaceRouter.router.replace({ name: routeName }).catch(() => {});
        };
        const selectSidebarItem = (route) => {
            if (route) state.selectedItem = state.menuList.find(d => d.routeName === route) as MenuItem;
            else state.selectedItem = {} as MenuItem;
        };

        watch(() => SpaceRouter.router.currentRoute.name, (after) => {
            selectSidebarItem(after);
        });

        (async () => {
            selectSidebarItem(SpaceRouter.router.currentRoute.name);
        })();

        return {
            ...toRefs(state),
            showPage,
        };
    },
};
</script>
