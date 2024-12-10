<script setup lang="ts">
import {
    computed, onMounted, reactive, watch,
} from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PFieldGroup, PTextInput, PTooltip, PI, PSelectDropdown, PAvatar,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { ServiceCreateParameters } from '@/schema/alert-manager/service/api-verbs/create';
import type { ServiceListParameters } from '@/schema/alert-manager/service/api-verbs/list';
import type { ServiceModel } from '@/schema/alert-manager/service/model';
import type { WorkspaceUserListParameters } from '@/schema/identity/workspace-user/api-verbs/list';
import type { WorkspaceUserModel } from '@/schema/identity/workspace-user/model';
import { i18n } from '@/translations';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import { indigo } from '@/styles/colors';

import ServiceCreateStepContainer from '@/services/alert-manager-v2/components/ServiceCreateStepContainer.vue';
import { useServiceCreateFormStore } from '@/services/alert-manager-v2/stores/service-create-form-store';

const serviceFormStore = useServiceCreateFormStore();

const dropdownState = reactive({
    loading: false,
    workspaceUsersData: [] as WorkspaceUserModel[],
    // TODO: Add user group model type
    userGroupData: [] as any[],
    userDropdownData: computed<SelectDropdownMenuItem[]>(() => [
        { type: 'header', label: i18n.t('ALERT_MANAGER.SERVICE.USER') },
        ...dropdownState.workspaceUsersData.map((i) => ({
            label: i.user_id,
            name: i.user_id,
        })),
        { type: 'header', label: i18n.t('ALERT_MANAGER.SERVICE.USER_GROUP') },
        ...dropdownState.userGroupData.map((i) => ({
            label: i.name,
            name: i.user_group_id,
        })),
    ]),
    selectedMemberItems: [] as SelectDropdownMenuItem[],
});
const state = reactive({
    isFocusedKey: false,
    isAllFormValid: computed<boolean>(() => (isAllValid && (name && name.value !== '') && (key && key.value !== ''))),
    selectedWorkspaceMemberList: computed<string[]>(() => dropdownState.selectedMemberItems.filter((i) => !checkUserGroup(i.name)).map((i) => i.name)),
    selectedUserGroupList: computed<string[]>(() => dropdownState.selectedMemberItems.filter((i) => checkUserGroup(i.name)).map((i) => i.name)),
    serviceList: [] as ServiceModel[],
});

const {
    forms: {
        name,
        key,
        description,
    },
    setForm,
    invalidState,
    invalidTexts,
    isAllValid,
} = useFormValidator({
    name: '',
    key: '',
    description: '',
}, {
    name(value: string) {
        const duplicatedName = state.serviceList?.find((item) => item.name === value);
        if (duplicatedName) {
            return i18n.t('ALERT_MANAGER.SERVICE.VALIDATION_NAME_UNIQUE');
        }
        return '';
    },
    key(value: string) {
        const duplicatedName = state.serviceList?.find((item) => item.service_key === value);
        if (duplicatedName) {
            return i18n.t('ALERT_MANAGER.SERVICE.VALIDATION_KEY_UNIQUE');
        }
        return '';
    },
});

const convertToSnakeCase = (str) => {
    const cleanedInput = str.replace(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g, '');
    return cleanedInput
        .toLowerCase()
        .split(' ')
        .filter((word) => word.trim() !== '')
        .join('_');
};
const getUserName = (id: string): string => dropdownState.workspaceUsersData.find((i) => i.user_id === id)?.name;
const checkUserGroup = (id: string): boolean => dropdownState.userGroupData.some((i) => i.user_group_id === id);

const handleChangeInput = (label: 'name'|'key'|'description', value?: string) => {
    setForm(label, value);
};
const getUserDropdownData = async () => {
    dropdownState.loading = true;
    try {
        await fetchWorkspaceUsersList();
        await fetchUserGroupList();
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        dropdownState.loading = false;
    }
};

const fetchWorkspaceUsersList = async () => {
    try {
        const { results } = await SpaceConnector.clientV2.identity.workspaceUser.list<WorkspaceUserListParameters, ListResponse<WorkspaceUserModel>>();
        dropdownState.workspaceUsersData = results || [];
    } catch (e) {
        ErrorHandler.handleError(e);
        dropdownState.workspaceUsersData = [];
    }
};
const fetchUserGroupList = async () => {
    try {
        // TODO: Add user group params type
        const { results } = await SpaceConnector.clientV2.identity.userGroup.list();
        dropdownState.userGroupData = results || [];
    } catch (e) {
        ErrorHandler.handleError(e);
        dropdownState.userGroupData = [];
    }
};
const fetchServiceList = async () => {
    try {
        const { results } = await SpaceConnector.clientV2.alertManager.service.list<ServiceListParameters, ListResponse<ServiceModel>>();
        state.serviceList = results || [];
    } catch (e) {
        ErrorHandler.handleError(e);
        state.serviceList = [];
    }
};
const handleCreateService = async () => {
    try {
        const createdServiceInfo = await SpaceConnector.clientV2.alertManager.service.create<ServiceCreateParameters, ServiceModel>({
            name: name.value,
            service_key: key.value,
            members: {
                USER: state.selectedWorkspaceMemberList,
                USER_GROUP: state.selectedUserGroupList,
            },
            description: description.value,
        });
        serviceFormStore.setCreatedServiceId(createdServiceInfo.service_id);
        serviceFormStore.setCurrentStep(2);
    } catch (e) {
        ErrorHandler.handleError(e, true);
    }
};

watch(() => state.isFocusedKey, (isFocusedKey) => {
    if (isFocusedKey && !key.value) {
        handleChangeInput('key', convertToSnakeCase(name.value));
    }
});

onMounted(async () => {
    await getUserDropdownData();
    await fetchServiceList();
});
</script>

<template>
    <service-create-step-container class="service-create-step1"
                                   :is-all-form-valid="state.isAllFormValid"
                                   @create="handleCreateService"
    >
        <div>
            <p-field-group :label="$t('ALERT_MANAGER.SERVICE.LABEL_NAME')"
                           :invalid-text="invalidTexts.name"
                           :invalid="invalidState.name"
                           required
            >
                <template #default="{invalid}">
                    <p-text-input :value="name"
                                  block
                                  :invalid="invalid"
                                  @update:value="handleChangeInput('name', $event)"
                    />
                </template>
            </p-field-group>
            <p-field-group :label="$t('ALERT_MANAGER.SERVICE.LABEL_KEY')"
                           :invalid-text="invalidTexts.key"
                           :invalid="invalidState.key"
                           required
            >
                <template #label-extra>
                    <p-tooltip :contents="$t('ALERT_MANAGER.SERVICE.LABEL_KEY_DESC')"
                               position="bottom"
                    >
                        <p-i width="1rem"
                             height="1rem"
                             name="ic_info-circle"
                        />
                    </p-tooltip>
                </template>
                <template #default="{invalid}">
                    <p-text-input :value="key"
                                  block
                                  :is-focused.sync="state.isFocusedKey"
                                  :invalid="invalid"
                                  @update:value="handleChangeInput('key', $event)"
                    />
                </template>
            </p-field-group>
            <p-field-group :label="$t('ALERT_MANAGER.SERVICE.MEMBER')">
                <p-select-dropdown :loading="dropdownState.loading"
                                   :menu="dropdownState.userDropdownData"
                                   :selected.sync="dropdownState.selectedMemberItems"
                                   multi-selectable
                                   appearance-type="stack"
                                   use-fixed-menu-style
                                   is-filterable
                                   show-delete-all-button
                                   show-select-marker
                >
                    <template #menu-item--format="{ item }">
                        <div class="member-menu-item">
                            <p-avatar v-if="checkUserGroup(item.name)"
                                      class="menu-icon"
                                      icon="ic_member"
                                      :color="indigo[300]"
                                      size="xs"
                            />
                            <p-avatar v-else
                                      class="menu-icon"
                                      size="xs"
                            />
                            <span>{{ item.label }}</span>
                            <span v-if="getUserName(item.name)">({{ getUserName(item.name) }})</span>
                        </div>
                    </template>
                </p-select-dropdown>
            </p-field-group>
            <p-field-group :label="$t('ALERT_MANAGER.DESCRIPTION')">
                <p-text-input :value="description"
                              block
                              @update:value="handleChangeInput('description', $event)"
                />
            </p-field-group>
        </div>
    </service-create-step-container>
</template>

<style scoped lang="postcss">
.service-create-step1 {
    .member-menu-item {
        @apply flex items-center;
        gap: 0.25rem;
    }
}
</style>
