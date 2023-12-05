<template>
    <div class="gnb-toolset">
        <g-n-b-search v-if="!isAdminMode"
                      :visible="openedMenu === 'search'"
                      @update:visible="updateOpenedMenu('search', $event)"
        />
        <g-n-b-recent-favorite v-if="!isAdminMode"
                               :visible="openedMenu === 'recentFavorite'"
                               @update:visible="updateOpenedMenu('recentFavorite', $event)"
        />
        <g-n-b-noti v-if="!isAdminMode"
                    :visible="openedMenu === 'notifications'"
                    @update:visible="updateOpenedMenu('notifications', $event)"
        />
        <g-n-b-profile :visible="openedMenu === 'profile'"
                       @update:visible="updateOpenedMenu('profile', $event)"
        />
    </div>
</template>

<script lang="ts">
import type { SetupContext } from 'vue';
import {
    computed, defineComponent, reactive, toRefs,
} from 'vue';

import { store } from '@/store';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import GNBNoti from '@/common/modules/navigations/gnb/modules/gnb-noti/GNBNoti.vue';
import GNBProfile from '@/common/modules/navigations/gnb/modules/gnb-profile/GNBProfile.vue';
import GNBRecentFavorite from '@/common/modules/navigations/gnb/modules/gnb-recent-favorite/GNBRecentFavorite.vue';
import GNBSearch from '@/common/modules/navigations/gnb/modules/gnb-search/GNBSearch.vue';

export default defineComponent({
    name: 'GNBToolset',
    components: {
        GNBProfile,
        GNBRecentFavorite,
        GNBSearch,
        GNBNoti,
    },
    props: {
        openedMenu: {
            type: String,
            default: null,
        },
    },
    setup(props, { emit }: SetupContext) {
        const appContextStore = useAppContextStore();
        const state = reactive({
            isAdminMode: computed(() => appContextStore.getters.isAdminMode),
            timezone: computed(() => store.state.user.timezone),
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

        return {
            ...toRefs(state),
            hideMenu,
            openMenu,
            updateOpenedMenu,
        };
    },
});
</script>
