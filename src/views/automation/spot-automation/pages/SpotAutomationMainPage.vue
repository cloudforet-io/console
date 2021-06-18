<template>
    <vertical-page-layout>
        <template #sidebar>
            <aside class="sidebar-menu">
                <sidebar-title :title="$t('AUTOMATION.SPOT_AUTOMATION.MAIN.FAVORITES')">
                    <template #extra>
                        <span class="count">({{ favoriteItems.length }})</span>
                    </template>
                </sidebar-title>
                <favorite-list :items="favoriteItems" class="favorite-list" @delete="onFavoriteDelete">
                    <template #icon="{item}">
                        <p-i name="ic_tree_project-group" class="project-group-icon"
                             width="1rem" height="1rem" color="inherit transparent"
                        />
                    </template>
                </favorite-list>
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
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';
import VerticalPageLayout from '@/common/components/layouts/VerticalPageLayout.vue';
import VueI18n from 'vue-i18n';
import { FavoriteItem } from '@/store/modules/favorite/type';
import FavoriteList from '@/common/modules/favorite-list/FavoriteList.vue';
import SidebarTitle from '@/common/components/sidebar-title/SidebarTitle.vue';
import { PI } from '@spaceone/design-system';
import { AUTOMATION_ROUTE } from '@/routes/automation/automation-route';
import router from '@/routes';

import TranslateResult = VueI18n.TranslateResult;

interface MenuItem {
    routeName: string;
    label: TranslateResult;
}

export default {
    name: 'SpotAutomationMainPage',
    components: {
        SidebarTitle,
        VerticalPageLayout,
        FavoriteList,
        PI,
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            menuList: computed(() => [
                {
                    routeName: AUTOMATION_ROUTE.SPOT_AUTOMATION.DASHBOARD._NAME,
                    label: vm.$t('AUTOMATION.SPOT_AUTOMATION.MAIN.DASHBOARD'),
                },
                {
                    routeName: AUTOMATION_ROUTE.SPOT_AUTOMATION.SPOT_GROUP._NAME,
                    label: vm.$t('AUTOMATION.SPOT_AUTOMATION.MAIN.SPOT_GROUP'),
                },
            ]) as unknown as MenuItem[],
            selectedItem: {} as MenuItem,
            favoriteItems: computed(() => vm.$store.getters['favorite/spotGroup/sortedItems']),
        });

        const onFavoriteDelete = (item: FavoriteItem) => {
            vm.$store.dispatch('favorite/spotGroup/removeItem', item);
        };

        const showPage = (routeName) => {
            router.replace({ name: routeName }).catch(() => {});
        };
        const selectSidebarItem = (route) => {
            if (route) state.selectedItem = state.menuList.find(d => d.routeName === route) as MenuItem;
        };

        watch(() => vm.$route.name, (after) => {
            selectSidebarItem(after);
        });

        (async () => {
            selectSidebarItem(vm.$route.name);
            await Promise.all([vm.$store.dispatch('favorite/spotGroup/load'), vm.$store.dispatch('resource/spotGroup/load')]);
        })();

        return {
            ...toRefs(state),
            showPage,
            onFavoriteDelete,
        };
    },
};
</script>

<style lang="postcss" scoped>
.vertical-page-layout::v-deep {
    .right-container {
        .page-contents {
            padding: 0;
        }
    }
}
.count {
    margin-left: 0.25rem;
    font-size: 0.875rem;
    line-height: 170%;
}
.favorite-list {
    margin-bottom: 2.125rem;
}
</style>
