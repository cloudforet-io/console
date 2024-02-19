<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PTooltip } from '@spaceone/design-system';

import { store } from '@/store';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import TopBarAdminToggleButton from '@/common/modules/navigations/top-bar/modules/top-bar-toolset/modules/top-bar-admin-toggle-button/TopBarAdminToggleButton.vue';
import TopBarNoti from '@/common/modules/navigations/top-bar/modules/top-bar-toolset/modules/top-bar-noti/TopBarNoti.vue';
import TopBarProfile from '@/common/modules/navigations/top-bar/modules/top-bar-toolset/modules/top-bar-profile/TopBarProfile.vue';
import TopBarRecentFavorite
    from '@/common/modules/navigations/top-bar/modules/top-bar-toolset/modules/top-bar-recent-favorite/TopBarRecentFavorite.vue';

const props = withDefaults(defineProps<{
    openedMenu?: string|null;
}>(), {
    openedMenu: null,
});
const emit = defineEmits<{(event: 'hide-menu'): void;
    (event: 'open-menu', menu: string): void;
}>();

const appContextStore = useAppContextStore();
const state = reactive({
    isDomainAdmin: computed(() => store.getters['user/isDomainAdmin']),
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    isGrantLoading: computed(() => appContextStore.getters.globalGrantLoading),
    tooltipTexts: computed<Record<string, string>>(() => ({
        recentFavorite: i18n.t('COMMON.GNB.TOOLTIP.RECENT_FAVORITE') as string,
        notifications: i18n.t('COMMON.GNB.TOOLTIP.NOTIFICATIONS') as string,
        profile: i18n.t('COMMON.GNB.TOOLTIP.PROFILE') as string,
        adminToggle: (state.isAdminMode ? i18n.t('COMMON.GNB.TOOLTIP.EXIT_ADMIN_MODE') : i18n.t('COMMON.GNB.TOOLTIP.ENABLE_ADMIN_MODE')) as string,
    })),
});

const hideMenu = () => {
    emit('hide-menu');
};
const openMenu = (menu: string) => {
    emit('open-menu', menu);
};
const updateOpenedMenu = (menu: string, visible: boolean) => {
    if (visible) openMenu(menu);
    else hideMenu();
};

</script>

<template>
    <div class="top-bar-toolset">
        <!-- TODO: top-bar-search-clone-->
        <p-tooltip :contents="state.tooltipTexts.recentFavorite"
                   position="bottom"
        >
            <top-bar-recent-favorite v-if="!state.isAdminMode && !state.isGrantLoading"
                                     :visible="props.openedMenu === 'recentFavorite'"
                                     @update:visible="updateOpenedMenu('recentFavorite', $event)"
            />
        </p-tooltip>
        <p-tooltip :contents="state.tooltipTexts.notifications"
                   position="bottom"
        >
            <top-bar-noti v-if="!state.isAdminMode && !state.isGrantLoading"
                          :visible="props.openedMenu === 'notifications'"
                          @update:visible="updateOpenedMenu('notifications', $event)"
            />
        </p-tooltip>
        <p-tooltip :contents="state.tooltipTexts.adminToggle"
                   position="bottom"
        >
            <top-bar-admin-toggle-button v-if="state.isDomainAdmin" />
        </p-tooltip>
        <p-tooltip :contents="state.tooltipTexts.profile"
                   position="bottom"
        >
            <top-bar-profile :visible="props.openedMenu === 'profile'"
                             @update:visible="updateOpenedMenu('profile', $event)"
            />
        </p-tooltip>
    </div>
</template>

<style lang="postcss" scoped>
.top-bar-toolset {
    @apply flex items-center;
}
</style>
