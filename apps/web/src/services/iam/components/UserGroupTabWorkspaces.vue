<script setup lang="ts">
import { PHeading, PDataTable } from '@cloudforet/mirinae';
import { i18n } from '@/translations';
import { useUserGroupPageStore } from '@/services/iam/store/user-group-page-store';
import { USER_GROUP_MODAL_TYPE } from '@/services/iam/constants/user-group-constant';
import { reactive, computed } from 'vue';

const userGroupPageStore = useUserGroupPageStore();

const state = reactive({
    loading: false,
    fields: computed(() => ([
        { name: 'user_id', label: 'User ID', sortable: false },
        { name: 'name', label: 'Name', sortable: false },
        { name: 'state', label: 'State', sortable: false },
    ])),
    data: computed(() => ([{
        user_id: "user01@spaceone.org",
        name: "User01",
        state: "Enabled",
    }]))
});
</script>

<template>
    <div class="user-group-tab-workspaces">
        <p-heading heading-type="sub"
                   :title="i18n.t('IAM.USERGROUP.MAIN.WORKSPACE')"
        />
        <p-data-table :fields="state.fields"
            :items="state.data"
        >
            <template #col-user_id-format="{value, item}">
                <span class="user-id-wrapper">
                    {{ value }}
                </span>
            </template>
            <template #col-name-format="{value, item}">
                {{ value }}
            </template>
            <template #col-state-format="{value, item}">
                {{ value }}
            </template>
        </p-data-table>
    </div>
</template>

<style lang="postcss" scoped>
.user-group-tab-workspaces {
    .toolbox-wrapper {
        .toolbox {
            @apply flex;
            gap: 0.5rem;
            .button-label {
                line-height: 1rem;
            }
        }
    }
}
</style>