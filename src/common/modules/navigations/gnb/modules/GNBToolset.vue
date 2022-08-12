<template>
    <div class="gnb-toolset" @click.stop>
        <g-n-b-search v-if="!isDomainOwner"
                      @open-menu="openMenu('search')"
                      @hide-menu="hideMenu"
        />
        <g-n-b-recent-favorite v-if="!isDomainOwner"
                               @open-menu="openMenu('recentFavorite')"
                               @hide-menu="hideMenu"
        />
        <g-n-b-noti v-if="!isDomainOwner"
                    @open-menu="openMenu('notifications')"
                    @hide-menu="hideMenu"
        />
        <g-n-b-profile @open-menu="openMenu('profile')"
                       @hide-menu="hideMenu"
        />
    </div>
</template>

<script lang="ts">
import {
    computed, defineComponent, reactive, toRefs,
} from '@vue/composition-api';

import { store } from '@/store';

import GNBNoti from '@/common/modules/navigations/gnb/modules/gnb-noti/GNBNoti.vue';
import GNBProfile from '@/common/modules/navigations/gnb/modules/gnb-profile/GNBProfile.vue';
import GNBRecentFavorite from '@/common/modules/navigations/gnb/modules/gnb-recent-favorite/GNBRecentFavorite.vue';
import GNBSearch from '@/common/modules/navigations/gnb/modules/gnb-search/GNBSearch.vue';

import { MY_PAGE_ROUTE } from '@/services/my-page/route-config';


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
    setup(props, { emit }) {
        const state = reactive({
            isDomainOwner: computed(() => store.getters['user/isDomainOwner']),
            timezone: computed(() => store.state.user.timezone),
        });

        /* event */
        const hideMenu = () => {
            emit('hide-menu');
        };
        const openMenu = (menu) => {
            emit('open-menu', menu);
        };

        return {
            ...toRefs(state),
            MY_PAGE_ROUTE,
            hideMenu,
            openMenu,
        };
    },
});
</script>
