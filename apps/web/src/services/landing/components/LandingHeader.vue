<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PTooltip } from '@spaceone/design-system';

import { store } from '@/store';

import TopBarAdminToggleButton
    from '@/common/modules/navigations/top-bar/modules/top-bar-toolset/modules/top-bar-admin-toggle-button/TopBarAdminToggleButton.vue';
import TopBarProfile
    from '@/common/modules/navigations/top-bar/modules/top-bar-toolset/modules/top-bar-profile/TopBarProfile.vue';

const storeState = reactive({
    isDomainAdmin: computed<boolean>(() => store.getters['user/isDomainAdmin']),
});
const state = reactive({
    openedProfileMenu: false,
});
const handleOpenedMenu = (visible: boolean) => {
    state.openedProfileMenu = visible;
};
</script>

<template>
    <div class="landing-header">
        <p-tooltip v-if="storeState.isDomainAdmin"
                   :contents="$t('COMMON.GNB.TOOLTIP.ENABLE_ADMIN_MODE')"
                   position="bottom"
        >
            <top-bar-admin-toggle-button class="toggle-button" />
        </p-tooltip>
        <top-bar-profile :visible="state.openedProfileMenu"
                         @update:visible="handleOpenedMenu"
        />
    </div>
</template>

<style scoped lang="postcss">
.landing-header {
    @apply absolute flex;
    top: 0.652rem;
    right: 1.5rem;
    .toggle-button {
        margin-right: -0.5rem;
    }
}
</style>
