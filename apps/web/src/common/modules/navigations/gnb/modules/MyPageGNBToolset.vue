<template>
    <div class="my-page-gnb-toolset">
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

import GNBProfile from '@/common/modules/navigations/gnb/modules/gnb-profile/GNBProfile.vue';

const state = reactive({
    timezone: computed(() => store.state.user.timezone),
    profileMenuVisible: false,
});

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
