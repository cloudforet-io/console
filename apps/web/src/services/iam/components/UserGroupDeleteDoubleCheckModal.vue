<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PDataTable, PButtonModal, PBadge } from '@cloudforet/mirinae';

import type { UserGroupDeleteUserGroupParameters } from '@/schema/identity/user-group/api-verbs/delete';
import type { UserGroupModel } from '@/schema/identity/user-group/model';
import type { UserGroupListItemType } from '@/schema/identity/user-group/type';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ServiceReferenceMap } from '@/store/reference/service-reference-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { USER_GROUP_MODAL_TYPE } from '@/services/iam/constants/user-group-constant';
import { useUserGroupPageStore } from '@/services/iam/store/user-group-page-store';

const emit = defineEmits<{(e: 'confirm'): void; }>();

const userGroupPageStore = useUserGroupPageStore();
const userGroupPageState = userGroupPageStore.state;
const userGroupPageGetters = userGroupPageStore.getters;

const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;

const storeState = reactive({
    selectedUserGroupList: computed<UserGroupListItemType[]>(() => userGroupPageGetters.selectedUserGroups),
    selectedUserGroupIds: computed(() => userGroupPageGetters.selectedUserGroups.map((userGroup) => userGroup.user_group_id)),
    selectedUserGroupNames: computed(() => userGroupPageGetters.selectedUserGroups.map((userGroup) => userGroup.name)),
    serviceList: computed<ServiceReferenceMap>(() => allReferenceGetters.service),
});

const state = reactive({
    loading: false,
});

const tableState = reactive({
    fields: [
        { name: 'user_group', label: 'User Group' },
        { name: 'service', label: 'Service' },
        { name: 'description', label: 'Description' },
    ],
    filteredItems: [],
});

/* Component */
const handleConfirm = async () => {
    const deletePromises = storeState.selectedUserGroupIds.map((userGroupId) => fetchDeleteUserGroup({
        user_group_id: userGroupId,
    }));
    try {
        state.loading = true;
        await Promise.all(deletePromises);
        emit('confirm');
        showSuccessMessage('', i18n.t('IAM.USER_GROUP.MODAL.DELETE.SHOW_SUCCESS_MESSAGE'));
    } finally {
        state.loading = false;
        handleCancel();
    }
};

const handleCancel = () => {
    state.loading = false;
    userGroupPageState.modal = {
        type: '',
        title: '',
        themeColor: 'primary',
    };
};

/* API */
const fetchDeleteUserGroup = async (params: UserGroupDeleteUserGroupParameters) => {
    try {
        await SpaceConnector.clientV2.identity.userGroup.delete<UserGroupDeleteUserGroupParameters, UserGroupModel>(params);
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

/* Watcher */
watch([() => storeState.serviceList, () => storeState.selectedUserGroupList], ([nv_service_list, nv_user_group_list]) => {
    if (nv_service_list) {
        const list: any = [];
        nv_user_group_list.forEach((userGroup) => {
            Object.values(nv_service_list).forEach((service) => {
                if (service && service.data && service.data.members) {
                    if (Object.keys(service.data.members).includes('USER_GROUP')) {
                        if (service.data.members.USER_GROUP.includes(userGroup.user_group_id)) {
                            list.push({
                                user_group: userGroup.name,
                                service: service.label,
                                description: userGroup.description,
                            });
                        }
                    } else {
                        list.push({
                            user_group: userGroup.name,
                            description: userGroup.description,
                        });
                    }
                }
            });
            list.push({
                user_group: userGroup.name,
                description: userGroup.description,
            });
        });
        if (list.length > 0) {
            tableState.filteredItems = Object.values(
                list.reduce((acc, cur) => {
                    if (!acc[cur.user_group]) {
                        acc[cur.user_group] = {
                            user_group: cur.user_group,
                            service: [],
                            description: cur.description,
                        };
                    }
                    if (cur.service !== undefined) {
                        if (!Array.isArray(acc[cur.user_group].service)) {
                            acc[cur.user_group].service = [];
                        }
                        acc[cur.user_group].service.push(cur.service);
                    }
                    return acc;
                }, {}),
            );
        }
    }
}, { deep: true, immediate: true });
</script>

<template>
    <p-button-modal size="md"
                    :header-title="userGroupPageState.modal.title"
                    :loading="state.loading"
                    :visible="userGroupPageState.modal.type === USER_GROUP_MODAL_TYPE.DELETE"
                    :theme-color="userGroupPageState.modal.themeColor"
                    @confirm="handleConfirm"
                    @cancel="handleCancel"
    >
        <template #body>
            <p-data-table :fields="tableState.fields"
                          :items="tableState.filteredItems"
            >
                <template #col-service-format="{value}">
                    <div v-if="value.length > 0">
                        <span v-for="(service, i) in value"
                              :key="i"
                              class="mr-2"
                        >
                            <p-badge v-if="i < 3"
                                     badge-type="gray200"
                                     shape="square"
                            >
                                {{ service }}
                            </p-badge>
                            <p-badge v-else-if="i === 3"
                                     badge-type="blue700"
                                     shape="round"
                            >
                                {{ service.length - i }}
                            </p-badge>
                        </span>
                    </div>
                    <div v-else />
                </template>
            </p-data-table>
        </template>
    </p-button-modal>
</template>
