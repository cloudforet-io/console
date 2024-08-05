<script setup lang="ts">
import { PHeading, PButton, PDataTable } from '@cloudforet/mirinae';
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

const handleClickButton = (type: string) => {
    switch(type) {
        case USER_GROUP_MODAL_TYPE.ADD_USERS: userGroupPageStore.updateModalSettings({
            type,
            title: i18n.t('IAM.USERGROUP.MODAL.ADD_USERS.TITLE'),
            visible: USER_GROUP_MODAL_TYPE.ADD_USERS,
            themeColor: 'primary'
        }); break;
        default:
            break;
    }
};
</script>

<template>
    <div class="user-group-tab-users">
        <p-heading heading-type="sub"
                   :title="i18n.t('IAM.USERGROUP.MAIN.USER')"
        >
            <template #extra>
                <div class="toolbox-wrapper">
                    <div class="toolbox">
                        <p-button style-type="tertiary" iconLeft="ic_plus_bold" @click="handleClickButton(USER_GROUP_MODAL_TYPE.ADD_USERS)">
                            {{ i18n.t('IAM.USERGROUP.MAIN.ADD_USERS') }}
                        </p-button>
                    </div>
                </div>
            </template>
        </p-heading>
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
.user-group-tab-users {
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
