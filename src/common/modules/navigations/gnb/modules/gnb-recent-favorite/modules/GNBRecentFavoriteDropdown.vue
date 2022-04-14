<template>
    <p-tab class="gnb-recent-favorite-dropdown"
           :tabs="tabs"
           :active-tab.sync="activeTab"
    >
        <template #recent>
            <g-n-b-recent />
        </template>
        <template #favorite>
            <g-n-b-favorite />
        </template>
    </p-tab>
</template>

<script lang="ts">
import { computed, reactive, toRefs } from '@vue/composition-api';

import {
    PTab,
} from '@spaceone/design-system';
import { TabItem } from '@spaceone/design-system/dist/src/navigation/tabs/tab/type';

import GNBRecent from '@/common/modules/navigations/gnb/modules/gnb-recent-favorite/modules/GNBRecent.vue';
import GNBFavorite from '@/common/modules/navigations/gnb/modules/gnb-recent-favorite/modules/GNBFavorite.vue';


export default {
    name: 'GNBRecentFavoriteDropdown',
    components: {
        GNBFavorite,
        GNBRecent,
        PTab,
    },
    props: {},
    setup() {
        const state = reactive({
            tabs: computed(() => ([
                { label: 'Recent Visits', name: 'recent', keepAlive: true },
                { label: 'Favorites', name: 'favorite', keepAlive: true },
            ] as TabItem[])),
            activeTab: 'recent',
        });

        return {
            ...toRefs(state),
        };
    },
};
</script>
<style lang="postcss" scoped>
.gnb-recent-favorite-dropdown {
    @apply absolute bg-white rounded-xs border border-gray-200;
    display: flex;
    flex-direction: column;
    width: 27.5rem;
    top: 100%;
    right: 0;
    box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.08);
}
</style>
