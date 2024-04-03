<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import { PSearch } from '@spaceone/design-system';
import { CONTEXT_MENU_TYPE } from '@spaceone/design-system/src/inputs/context-menu/type';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import type { WorkspaceModel } from '@/schema/identity/workspace/model';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import { HOME_DASHBOARD_ROUTE } from '@/services/home-dashboard/routes/route-constant';
import { useLandingPageStore } from '@/services/landing/store/landing-page-store';

const FOCUS_DIRECTION = {
    UPWARD: 'UPWARD',
    DOWNWARD: 'DOWNWARD',
} as const;
type FocusDirectionType = keyof typeof FOCUS_DIRECTION;

interface Props {
    workspaceList?: WorkspaceModel[];
}

const props = withDefaults(defineProps<Props>(), {
    workspaceList: () => ([]),
});

const landingPageStore = useLandingPageStore();
const userWorkspaceStore = useUserWorkspaceStore();

const router = useRouter();

const state = reactive({
    searchText: '',
    visibleMenu: false,
    isFocusOnMenu: false,
    focusingDirection: FOCUS_DIRECTION.DOWNWARD as FocusDirectionType|undefined,
    menuList: computed<MenuItem[]>(() => {
        const searchedList = state.searchText !== ''
            ? props.workspaceList.filter((item) => item.name.toLowerCase()?.includes(state.searchText))
            : props.workspaceList;
        return searchedList.map((item) => ({
            name: item.workspace_id,
            label: item.name,
            type: CONTEXT_MENU_TYPE.item,
        }));
    }),
});

const handleSearch = (val) => {
    const searchedItem = props.workspaceList.find((item) => item.name === val);
    if (!searchedItem) return;
    landingPageStore.setLoading(true);
    userWorkspaceStore.setCurrentWorkspace(searchedItem.workspace_id);
    router.replace({ name: HOME_DASHBOARD_ROUTE._NAME, params: { workspaceId: searchedItem.workspace_id } });
};
</script>

<template>
    <div class="landing-search">
        <p-search v-model="state.searchText"
                  use-fixed-menu-style
                  disable-handler
                  use-auto-complete
                  :placeholder="$t('LADING.SEARCH_WORKSPACE')"
                  :menu="state.menuList"
                  class="workspace-search-bar"
                  @search="handleSearch"
        />
    </div>
</template>
