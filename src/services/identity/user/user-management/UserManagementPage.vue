<template>
    <section class="management-wrapper">
        <p-breadcrumbs :routes="routes" />
        <p-page-title :title="$t('IDENTITY.USER.MAIN.USER_MANAGEMENT')"
                      use-selected-count
                      :selected-count="selectedIndex.length"
        />
        <p-horizontal-layout>
            <template #container="{ height }">
                <user-management-table />
            </template>
        </p-horizontal-layout>
        <user-management-tab :selected-index="selectedIndex" :selected-users="selectedUsers" />
    </section>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs,
} from '@vue/composition-api';

import {
    PBreadcrumbs, PHorizontalLayout, PPageTitle,
} from '@spaceone/design-system';

import { store } from '@/store';
import { userStateFormatter } from '@/services/identity/user/lib/helper';
import { i18n } from '@/translations';
import { User } from '@/services/identity/user/type';
import UserManagementTab from '@/services/identity/user/user-management/modules/user-management-tab/UserManagementTab.vue';
import UserManagementTable from '@/services/identity/user/user-management/modules/UserManagementTable.vue';
import { UserStoreState } from '@/services/identity/user/store/type';
import UserStoreModule from '@/services/identity/user/store';
import { registerServiceStore } from '@/common/composables/register-service-store';

export default {
    name: 'UserManagement',
    components: {
        UserManagementTable,
        UserManagementTab,
        PBreadcrumbs,
        PHorizontalLayout,
        PPageTitle,
    },
    setup() {
        registerServiceStore<UserStoreState>('user', UserStoreModule);

        const state = reactive({
            // selected
            selectedIndex: [],
            selectedUsers: computed(() => {
                const users = [] as User[];
                state.selectedIndex.map(d => users.push(state.users[d]));
                return users;
            }),
            isSelected: computed(() => state.selectedIndex.length > 0),
        });

        const routeState = reactive({
            routes: computed(() => ([
                { name: i18n.t('MENU.IDENTITY.IDENTITY'), path: '/identity' },
                { name: i18n.t('MENU.IDENTITY.USER'), path: '/identity/user/user-management' },
                { name: i18n.t('IDENTITY.USER.MAIN.ROOT_ACCOUNT'), path: '/identity/user/user-management' },
                { name: i18n.t('IDENTITY.USER.MAIN.USER_MANAGEMENT') },
            ])),
        });

        const init = async () => {
            await Promise.all([
                store.dispatch('resource/project/load'),
                store.dispatch('resource/projectGroup/load'),
                store.dispatch('resource/user/load'),
            ]);
        };
        init();

        return {
            ...toRefs(state),
            ...toRefs(routeState),
            userStateFormatter,
        };
    },

};
</script>

<style lang="postcss" scoped>
.management-wrapper {
    @apply mx-0;
    max-width: 100%;
}
</style>
