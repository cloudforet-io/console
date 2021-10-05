<template>
    <vertical-page-layout class="cost-management-page">
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
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';

import VerticalPageLayout from '@/common/modules/page-layouts/VerticalPageLayout.vue';
import SidebarTitle from '@/common/components/titles/sidebar-title/SidebarTitle.vue';

import { i18n } from '@/translations';
import { BILLING_ROUTE } from '@/services/billing/routes';


interface MenuItem {
    routeName?: string;
    label?: TranslateResult;
}

export default {
    name: 'CostManagementPage',
    components: {
        VerticalPageLayout,
        SidebarTitle,
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            menuList: computed<MenuItem[]>(() => [
                {
                    routeName: BILLING_ROUTE.COST_MANAGEMENT.COST_ANALYSIS._NAME,
                    label: i18n.t('BILLING.COST_MANAGEMENT.MAIN.COST_ANALYSIS'),
                },
                {
                    routeName: BILLING_ROUTE.COST_MANAGEMENT.BUDGET._NAME,
                    label: i18n.t('BILLING.COST_MANAGEMENT.MAIN.BUDGET'),
                },
            ]),
            selectedItem: {} as MenuItem,
        });

        /* util */
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
.cost-management-page {
    .sidebar-menu {
        padding-top: 2rem;
    }
}
</style>
