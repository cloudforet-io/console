<script setup lang="ts">

import { computed, reactive } from 'vue';

import { PHeading, PButton } from '@spaceone/design-system';

import { ROLE_TYPE } from '@/schema/identity/role/constant';
import { store } from '@/store';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import { useUserPageStore } from '@/services/administration/store/user-page-store';

const appContextStore = useAppContextStore();
const userPageStore = useUserPageStore();
const userPageState = userPageStore.$state;

const state = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    isWorkspaceOwner: computed(() => store.state.user.roleType === ROLE_TYPE.WORKSPACE_OWNER),
});
</script>

<template>
    <p-heading :title="$t('IDENTITY.USER.MAIN.TITLE')"
               use-selected-count
               use-total-count
               :total-count="userPageState.totalCount"
               :selected-count="userPageState.selectedIndices.length"
               class="user-management-header"
    >
        <template #extra>
            <div class="toolbox-wrapper">
                <p-button v-if="state.isAdminMode"
                          style-type="primary"
                          icon-left="ic_plus_bold"
                >
                    {{ $t('IDENTITY.USER.MAIN.ADD') }}
                </p-button>
                <div v-if="state.isWorkspaceOwner"
                     class="toolbox"
                >
                    <p-button style-type="tertiary">
                        {{ $t('IDENTITY.USER.MAIN.REMOVE') }}
                    </p-button>
                    <p-button style-type="primary">
                        {{ $t('IDENTITY.USER.MAIN.INVITE') }}
                    </p-button>
                </div>
            </div>
        </template>
    </p-heading>
</template>

<style scoped lang="postcss">
.user-management-header {
    .toolbox-wrapper {
        .toolbox {
            @apply flex;
            gap: 1rem;
        }
    }
}
</style>
