<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PTooltip } from '@spaceone/design-system';

import { store } from '@/store';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import GNBNoti from '@/common/modules/navigations/gnb/modules/gnb-noti/GNBNoti.vue';
import GNBProfile from '@/common/modules/navigations/gnb/modules/gnb-profile/GNBProfile.vue';
import GNBRecentFavorite from '@/common/modules/navigations/gnb/modules/gnb-recent-favorite/GNBRecentFavorite.vue';
import GNBSearchClone from '@/common/modules/navigations/gnb/modules/gnb-search-clone/GNBSearch.vue';
import GNBSearch from '@/common/modules/navigations/gnb/modules/gnb-search/GNBSearch.vue';
import GNBAdminToggleButton from '@/common/modules/navigations/gnb/modules/GNBAdminToggleButton.vue';

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
    <div class="gnb-toolset">
        <g-n-b-search-clone v-if="!state.isAdminMode && !state.isGrantLoading"
                            :visible="props.openedMenu === 'search'"
                            @update:visible="updateOpenedMenu('search', $event)"
        />

        <!--        <g-n-b-search v-if="!state.isAdminMode && !state.isGrantLoading"-->
        <!--                      :visible="props.openedMenu === 'search'"-->
        <!--                      @update:visible="updateOpenedMenu('search', $event)"-->
        <!--        />-->
        <p-tooltip :contents="state.tooltipTexts.recentFavorite"
                   position="bottom"
        >
            <g-n-b-recent-favorite v-if="!state.isAdminMode && !state.isGrantLoading"
                                   :visible="props.openedMenu === 'recentFavorite'"
                                   @update:visible="updateOpenedMenu('recentFavorite', $event)"
            />
        </p-tooltip>
        <p-tooltip :contents="state.tooltipTexts.notifications"
                   position="bottom"
        >
            <g-n-b-noti v-if="!state.isAdminMode && !state.isGrantLoading"
                        :visible="props.openedMenu === 'notifications'"
                        @update:visible="updateOpenedMenu('notifications', $event)"
            />
        </p-tooltip>
        <p-tooltip :contents="state.tooltipTexts.adminToggle"
                   position="bottom"
        >
            <g-n-b-admin-toggle-button v-if="state.isDomainAdmin" />
        </p-tooltip>
        <p-tooltip :contents="state.tooltipTexts.profile"
                   position="bottom"
        >
            <g-n-b-profile :visible="props.openedMenu === 'profile'"
                           @update:visible="updateOpenedMenu('profile', $event)"
            />
        </p-tooltip>
    </div>
</template>

<style lang="postcss" scoped>
.gnb-toolset {
    @apply flex items-center;
}
</style>
