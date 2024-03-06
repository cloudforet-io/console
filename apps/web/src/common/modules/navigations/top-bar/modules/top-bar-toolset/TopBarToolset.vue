<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PTooltip } from '@spaceone/design-system';

import { store } from '@/store';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import TopBarAdminToggleButton from '@/common/modules/navigations/top-bar/modules/top-bar-toolset/modules/top-bar-admin-toggle-button/TopBarAdminToggleButton.vue';
import TopBarFavorite
    from '@/common/modules/navigations/top-bar/modules/top-bar-toolset/modules/top-bar-favorite/TopBarFavorite.vue';
import TopBarNotice
    from '@/common/modules/navigations/top-bar/modules/top-bar-toolset/modules/top-bar-notice/TopBarNotice.vue';
import TopBarNotifications from '@/common/modules/navigations/top-bar/modules/top-bar-toolset/modules/top-bar-notifications/TopBarNotifications.vue';
import TopBarProfile from '@/common/modules/navigations/top-bar/modules/top-bar-toolset/modules/top-bar-profile/TopBarProfile.vue';

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
        <top-bar-favorite v-if="!state.isAdminMode && !state.isGrantLoading"
                          :visible="props.openedMenu === 'favorite'"
                          @update:visible="updateOpenedMenu('favorite', $event)"
        />
        <top-bar-notifications v-if="!state.isAdminMode && !state.isGrantLoading"
                               :visible="props.openedMenu === 'notifications'"
                               @update:visible="updateOpenedMenu('notifications', $event)"
        />
        <top-bar-notice v-if="!state.isAdminMode && !state.isGrantLoading"
                        :visible="props.openedMenu === 'notice'"
                        @update:visible="updateOpenedMenu('notice', $event)"
        />
        <p-tooltip :contents="state.tooltipTexts.adminToggle"
                   position="bottom"
        >
            <top-bar-admin-toggle-button v-if="state.isDomainAdmin" />
        </p-tooltip>
        <top-bar-profile :visible="props.openedMenu === 'profile'"
                         @update:visible="updateOpenedMenu('profile', $event)"
        />
    </div>
</template>

<style lang="postcss" scoped>
.top-bar-toolset {
    @apply flex items-center;
}
</style>
