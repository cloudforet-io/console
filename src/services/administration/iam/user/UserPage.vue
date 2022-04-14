<template>
    <section class="user-page">
        <p-breadcrumbs :routes="routes" />
        <p-page-title title="User"
                      use-selected-count
                      :selected-count="selectedIndex.length"
        />
        <p-horizontal-layout>
            <template #container="{ height }">
                <user-management-table :table-height="height" />
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

import { userStateFormatter } from '@/services/administration/iam/user/lib/helper';
import { User } from '@/services/administration/iam/user/type';
import UserManagementTab from '@/services/administration/iam/user/modules/user-management-tab/UserManagementTab.vue';
import UserManagementTable from '@/services/administration/iam/user/modules/UserManagementTable.vue';
import { ADMINISTRATION_ROUTE } from '@/services/administration/route-config';

export default {
    name: 'UserPage',
    components: {
        UserManagementTable,
        UserManagementTab,
        PBreadcrumbs,
        PHorizontalLayout,
        PPageTitle,
    },
    setup() {
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
                { name: 'Administration', to: { name: ADMINISTRATION_ROUTE._NAME } },
                { name: 'IAM', to: { name: ADMINISTRATION_ROUTE.IAM._NAME } },
                { name: 'User', to: { name: ADMINISTRATION_ROUTE.IAM.USER._NAME } },
            ])),
        });

        return {
            ...toRefs(state),
            ...toRefs(routeState),
            userStateFormatter,
        };
    },

};
</script>

<style lang="postcss" scoped>
.user-page {
    @apply mx-0;
    max-width: 100%;
}
</style>
