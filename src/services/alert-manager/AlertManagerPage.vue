<template>
    <fragment>
        <vertical-page-layout
            v-if="$route.meta.isVerticalLayout"
            class="monitoring-main-page"
        >
            <template #sidebar>
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
            <template #default>
                <router-view />
            </template>
        </vertical-page-layout>
        <general-page-layout v-else>
            <router-view />
        </general-page-layout>
    </fragment>
</template>

<script lang="ts">
import { TranslateResult } from 'vue-i18n';

import {
    computed, reactive, toRefs, ComponentRenderProxy, getCurrentInstance, watch,
} from '@vue/composition-api';

import VerticalPageLayout from '@/common/modules/page-layouts/VerticalPageLayout.vue';
import SidebarTitle from '@/common/components/titles/sidebar-title/SidebarTitle.vue';

import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/route-config';
import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';


interface MenuItem {
    routeName: string;
    label: TranslateResult;
}

export default {
    name: 'AlertManagerPage',
    components: {
        SidebarTitle,
        VerticalPageLayout,
        GeneralPageLayout,
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            menuList: computed(() => [
                {
                    routeName: ALERT_MANAGER_ROUTE.DASHBOARD._NAME,
                    label: vm.$t('MONITORING.ALERT.MAIN.DASHBOARD'),
                },
                {
                    routeName: ALERT_MANAGER_ROUTE.ALERT._NAME,
                    label: vm.$t('MONITORING.ALERT.MAIN.ALERT'),
                },
                {
                    routeName: ALERT_MANAGER_ROUTE.ESCALATION_POLICY._NAME,
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
            else state.selectedItem = {} as MenuItem;
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
