<template>
    <div class="top-bar-my-page-toolset">
        <p-tooltip v-if="state.isDomainAdmin"
                   :contents="$t('COMMON.GNB.TOOLTIP.ENABLE_ADMIN_MODE')"
                   position="bottom"
        >
            <top-bar-admin-toggle-button />
        </p-tooltip>
        <top-bar-profile :visible="state.profileMenuVisible"
                         @update:visible="updateOpenedMenu"
        />
    </div>
</template>

<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';

import { PTooltip } from '@cloudforet/mirinae';

import { useUserStore } from '@/store/user/user-store';

import TopBarAdminToggleButton
    from '@/common/modules/navigations/top-bar/modules/top-bar-toolset/modules/top-bar-admin-toggle-button/TopBarAdminToggleButton.vue';
import TopBarProfile from '@/common/modules/navigations/top-bar/modules/top-bar-toolset/modules/top-bar-profile/TopBarProfile.vue';

const userStore = useUserStore();
const state = reactive({
    isDomainAdmin: computed(() => userStore.getters.isDomainAdmin),
    timezone: computed(() => userStore.state.timezone || 'UTC'),
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
.top-bar-my-page-toolset {
    @apply flex items-center;
    gap: 0.5rem;
}
</style>
