<template>
    <section class="user-page">
        <p-page-title title="User"
                      use-selected-count
                      :selected-count="selectedIndex.length"
        />
        <p-horizontal-layout class="user-toolbox-layout">
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
    PHorizontalLayout, PPageTitle,
} from '@spaceone/design-system';

import { userStateFormatter } from '@/services/administration/iam/user/lib/helper';
import { User } from '@/services/administration/iam/user/type';
import UserManagementTab from '@/services/administration/iam/user/modules/user-management-tab/UserManagementTab.vue';
import UserManagementTable from '@/services/administration/iam/user/modules/UserManagementTable.vue';

export default {
    name: 'UserPage',
    components: {
        UserManagementTable,
        UserManagementTab,
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

        return {
            ...toRefs(state),
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
.user-toolbox-layout::v-deep {
    .horizontal-contents {
        overflow: unset;
    }
}
</style>
