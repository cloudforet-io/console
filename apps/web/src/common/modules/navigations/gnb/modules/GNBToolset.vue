<template>
    <div class="gnb-toolset">
        <p-tooltip :contents="tooltipTexts.search"
                   position="bottom"
        >
            <g-n-b-search v-if="!isAdminMode"
                          :visible="openedMenu === 'search'"
                          @update:visible="updateOpenedMenu('search', $event)"
            />
        </p-tooltip>
        <p-tooltip :contents="tooltipTexts.recentFavorite"
                   position="bottom"
        >
            <g-n-b-recent-favorite v-if="!isAdminMode"
                                   :visible="openedMenu === 'recentFavorite'"
                                   @update:visible="updateOpenedMenu('recentFavorite', $event)"
            />
        </p-tooltip>
        <p-tooltip :contents="tooltipTexts.notifications"
                   position="bottom"
        >
            <g-n-b-noti v-if="!isAdminMode"
                        :visible="openedMenu === 'notifications'"
                        @update:visible="updateOpenedMenu('notifications', $event)"
            />
        </p-tooltip>
        <p-tooltip :contents="tooltipTexts.adminToggle"
                   position="bottom"
        >
            <g-n-b-admin-toggle-button v-if="isDomainAdmin" />
        </p-tooltip>
        <p-tooltip :contents="tooltipTexts.profile"
                   position="bottom"
        >
            <g-n-b-profile :visible="openedMenu === 'profile'"
                           @update:visible="updateOpenedMenu('profile', $event)"
            />
        </p-tooltip>
    </div>
</template>

<script lang="ts">
import type { SetupContext } from 'vue';
import {
    computed, defineComponent, reactive, toRefs,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import { PTooltip } from '@spaceone/design-system';

import { store } from '@/store';
import { i18n } from '@/translations';

import { ROOT_ROUTE } from '@/router/constant';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import GNBNoti from '@/common/modules/navigations/gnb/modules/gnb-noti/GNBNoti.vue';
import GNBProfile from '@/common/modules/navigations/gnb/modules/gnb-profile/GNBProfile.vue';
import GNBRecentFavorite from '@/common/modules/navigations/gnb/modules/gnb-recent-favorite/GNBRecentFavorite.vue';
import GNBSearch from '@/common/modules/navigations/gnb/modules/gnb-search/GNBSearch.vue';
import GNBAdminToggleButton from '@/common/modules/navigations/gnb/modules/GNBAdminToggleButton.vue';

export default defineComponent({
    name: 'GNBToolset',
    components: {
        PTooltip,
        GNBProfile,
        GNBRecentFavorite,
        GNBSearch,
        GNBNoti,
        GNBAdminToggleButton,
    },
    props: {
        openedMenu: {
            type: String,
            default: null,
        },
    },
    setup(props, { emit }: SetupContext) {
        const router = useRouter();
        const appContextStore = useAppContextStore();
        const state = reactive({
            isDomainAdmin: computed(() => store.getters['user/isDomainAdmin']),
            isAdminMode: computed(() => appContextStore.getters.isAdminMode),
            timezone: computed(() => store.state.user.timezone),
            tooltipTexts: computed<Record<string, string>>(() => ({
                search: i18n.t('COMMON.GNB.TOOLTIP.SEARCH') as string,
                recentFavorite: i18n.t('COMMON.GNB.TOOLTIP.RECENT_FAVORITE') as string,
                notifications: i18n.t('COMMON.GNB.TOOLTIP.NOTIFICATIONS') as string,
                profile: i18n.t('COMMON.GNB.TOOLTIP.PROFILE') as string,
                adminToggle: (state.isAdminMode ? i18n.t('COMMON.GNB.TOOLTIP.EXIT_ADMIN_MODE') : i18n.t('COMMON.GNB.TOOLTIP.ENABLE_ADMIN_MODE')) as string,
            })),
        });

        const adminToggleState = reactive({
            checked: computed(() => state.isAdminMode),
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

        const toggleAdminMode = () => {
            if (state.isAdminMode) {
                appContextStore.switchToWorkspaceMode();
                router.push({ name: ROOT_ROUTE.WORKSPACE._NAME });
                return;
            }
            appContextStore.switchToAdminMode();
            router.push({ name: ROOT_ROUTE.ADMIN._NAME });
        };

        return {
            ...toRefs(state),
            ...toRefs(adminToggleState),
            hideMenu,
            openMenu,
            updateOpenedMenu,
            toggleAdminMode,
        };
    },
});
</script>

<style lang="postcss" scoped>
.gnb-toolset {
    @apply flex items-center;
}
</style>
