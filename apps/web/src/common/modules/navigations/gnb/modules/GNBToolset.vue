<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';
import { useStore } from 'vuex';

import GNBNoti from '@/common/modules/navigations/gnb/modules/gnb-noti/GNBNoti.vue';
import GNBProfile from '@/common/modules/navigations/gnb/modules/gnb-profile/GNBProfile.vue';
import GNBRecentFavorite from '@/common/modules/navigations/gnb/modules/gnb-recent-favorite/GNBRecentFavorite.vue';
import GNBSearch from '@/common/modules/navigations/gnb/modules/gnb-search/GNBSearch.vue';

interface Props {
    openedMenu: string;
}

defineProps<Props>();
const emit = defineEmits<{(e: 'hide-menu'): void, (e: 'open-menu', menu: string): void}>();
const store = useStore();

const state = reactive({
    isDomainOwner: computed(() => store.getters['user/isDomainOwner']),
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

</script>

<template>
    <div class="gnb-toolset">
        <g-n-b-search v-if="!state.isDomainOwner"
                      :visible="openedMenu === 'search'"
                      @update:visible="updateOpenedMenu('search', $event)"
        />
        <g-n-b-recent-favorite v-if="!state.isDomainOwner"
                               :visible="openedMenu === 'recentFavorite'"
                               @update:visible="updateOpenedMenu('recentFavorite', $event)"
        />
        <g-n-b-noti v-if="!state.isDomainOwner"
                    :visible="openedMenu === 'notifications'"
                    @update:visible="updateOpenedMenu('notifications', $event)"
        />
        <g-n-b-profile :visible="openedMenu === 'profile'"
                       @update:visible="updateOpenedMenu('profile', $event)"
        />
    </div>
</template>
