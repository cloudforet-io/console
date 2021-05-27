<template>
    <vertical-page-layout class="monitoring-main-page">
        <template #sidebar>
            <aside class="sidebar-menu">
                <div v-for="(item) in menuList" :key="item.label"
                     @click="showPage(item.routeName)"
                >
                    <sidebar-title :title="item.label"
                                   :selected="item.label === selectedItem.label"
                                   style-type="link"
                    />
                </div>
            </aside>
        </template>
        <template #default>
            <router-view />
        </template>
    </vertical-page-layout>
</template>

<script lang="ts">
import { TranslateResult } from 'vue-i18n';

import {
    computed, reactive, toRefs, ComponentRenderProxy, getCurrentInstance, watch,
} from '@vue/composition-api';

import VerticalPageLayout from '@/common/components/layouts/VerticalPageLayout.vue';
import SidebarTitle from '@/common/components/sidebar-title/SidebarTitle.vue';

import { MONITORING_ROUTE } from '@/routes/monitoring/monitoring-route';


interface MenuItem {
    routeName: string;
    label: TranslateResult;
}

export default {
    name: 'MonitoringMainPage',
    components: {
        SidebarTitle,
        VerticalPageLayout,
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            menuList: computed(() => [
                {
                    routeName: MONITORING_ROUTE.ALERT_SYSTEM.DASHBOARD,
                    label: vm.$t('MONITORING.ALERT.MAIN.DASHBOARD'),
                },
                {
                    routeName: MONITORING_ROUTE.ALERT_SYSTEM.ALERT.LIST,
                    label: vm.$t('MONITORING.ALERT.MAIN.ALERT'),
                },
                {
                    routeName: MONITORING_ROUTE.ALERT_SYSTEM.ESCALATION_POLICY,
                    label: vm.$t('MONITORING.ALERT.MAIN.ESCALATION_POLICY'),
                },
            ]) as unknown as MenuItem[],
            selectedItem: {} as MenuItem,
        });

        const showPage = (routeName) => {
            vm.$router.replace({ name: routeName }).catch(() => {});
        };
        const selectSidebarItem = (route) => {
            if (route) state.selectedItem = state.menuList.find(d => d.routeName === route) as MenuItem;
        };

        watch(() => vm.$route.name, (after) => {
            selectSidebarItem(after);
        });

        (async () => {
            selectSidebarItem(vm.$route.name);
        })();

        return {
            ...toRefs(state),
            showPage,
        };
    },
};
</script>

<style lang="postcss" scoped>
.monitoring-main-page {
    .sidebar-menu {
        padding-top: 2rem;
    }
}
</style>
