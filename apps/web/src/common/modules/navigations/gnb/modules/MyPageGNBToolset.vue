<template>
    <div class="my-page-gnb-toolset">
        <!--        <g-n-b-menu v-if="state.hasRole"-->
        <!--                    :menu-id="noticeState.noticeMenuItem.id"-->
        <!--                    :label="noticeState.noticeMenuItem.label"-->
        <!--                    :to="noticeState.noticeMenuItem.to"-->
        <!--                    :is-selected="noticeState.isSelected"-->
        <!--        />-->
        <g-n-b-profile :visible="state.profileMenuVisible"
                       @update:visible="updateOpenedMenu"
        />
    </div>
</template>

<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';

import { store } from '@/store';

import { useWorkspaceStore } from '@/store/app-context/workspace/workspace-store';

import GNBProfile from '@/common/modules/navigations/gnb/modules/gnb-profile/GNBProfile.vue';

const workspaceStore = useWorkspaceStore();
const state = reactive({
    hasRole: computed(() => workspaceStore.getters.workspaceList.length > 0),
    timezone: computed(() => store.state.user.timezone),
    profileMenuVisible: false,
});

// const noticeState = reactive({
//     noticeMenuItem: computed<DisplayMenu>(() => {
//         const menuInfo: MenuInfo = MENU_INFO_MAP[MENU_ID.NOTICE];
//
//         return {
//             id: MENU_ID.NOTICE,
//             label: i18n.t(menuInfo.translationId),
//             to: { name: makeAdminRouteName(menuInfo.routeName) },
//         };
//     }),
//     isSelected: computed(() => {
//         const matched = route.matched;
//         return matched.some((item) => item.meta.menuId === MENU_ID.NOTICE);
//     }),
// });
const hideMenu = () => {
    state.profileMenuVisible = false;
};
const openMenu = () => {
    state.profileMenuVisible = true;
};
const updateOpenedMenu = (visible: boolean) => {
    if (visible) openMenu();
    else hideMenu();
};

</script>

<style lang="postcss" scoped>
.my-page-gnb-toolset {
    @apply flex items-center gap-3;
}
</style>
