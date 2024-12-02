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
import type { WorkspaceUserListParameters } from '@/schema/identity/workspace-user/api-verbs/list';
import type { WorkspaceUserModel } from '@/schema/identity/workspace-user/model';
import { i18n } from '@/translations';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import ServiceCreateStepContainer from '@/services/alert-manager-v2/components/ServiceCreateStepContainer.vue';
import { useServiceFormStore } from '@/services/alert-manager-v2/store/service-form-store';

const serviceFormStore = useServiceFormStore();
const serviceFormState = serviceFormStore.state;

const formDataState = reactive({
    workspaceUserLoading: false,
    workspaceUsersData: [] as WorkspaceUserModel[],
    workspaceUsers: computed<SelectDropdownMenuItem[]>(() => [
        { type: 'header', label: i18n.t('ALERT_MANAGER.SERVICE.USER') },
        ...formDataState.workspaceUsersData.map((i) => ({
            label: i.user_id,
            name: i.user_id,
        })),
    ]),
    // TODO: Add user group data
    selectedMemberItems: [] as SelectDropdownMenuItem[],
});
const state = reactive({
    isFocusedKey: false,
    isAllFormValid: computed<boolean>(() => (isAllValid && (name && name.value !== '') && (key && key.value !== ''))),
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
    name: serviceFormState.name,
    key: serviceFormState.key,
    description: serviceFormState.description,
}, {
    name() {
        // TODO: Implement validation logic
        return '';
    },
    key() {
        // TODO: Implement validation logic
        return '';
    },
});

const convertToSnakeCase = (str) => str
    .replace(/([a-zA-Z0-9가-힣]+)(?=[^a-zA-Z0-9가-힣]|$)/g, '$1_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/_$/g, '')
    .toLowerCase();
const getUserName = (id: string) => formDataState.workspaceUsersData.find((i) => i.user_id === id)?.name;
const handleChangeInput = (label: 'name'|'key'|'member'|'description', value?: string) => {
    if (label !== 'member') setForm(label, value);
    // TODO: Add logic to separate user group data
    serviceFormStore.setFormStep1({
        name: name.value,
        key: key.value,
        member: {
            USER: formDataState.selectedMemberItems.map((i) => i.name),
        },
        description: description.value,
    });
};

const listWorkspaceUsers = async () => {
    formDataState.workspaceUserLoading = true;
    try {
        const { results } = await SpaceConnector.clientV2.identity.workspaceUser.list<WorkspaceUserListParameters, ListResponse<WorkspaceUserModel>>();
        formDataState.workspaceUsersData = results || [];
    } catch (e) {
        ErrorHandler.handleError(e);
        formDataState.workspaceUsersData = [];
    } finally {
        formDataState.workspaceUserLoading = false;
    }
};

watch(() => state.isFocusedKey, (isFocusedKey) => {
    if (isFocusedKey && !serviceFormState.key) {
        handleChangeInput('key', convertToSnakeCase(serviceFormState.name));
    }
});

onMounted(async () => {
    await listWorkspaceUsers();
});
</script>

<template>
    <service-create-step-container class="service-create-step1"
                                   :is-all-form-valid="state.isAllFormValid"
    >
        <form>
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
                <!-- TODO: Add user group data-->
                <p-select-dropdown :loading="formDataState.workspaceUserLoading"
                                   :menu="formDataState.workspaceUsers"
                                   :selected.sync="formDataState.selectedMemberItems"
                                   multi-selectable
                                   appearance-type="stack"
                                   use-fixed-menu-style
                                   is-filterable
                                   show-delete-all-button
                                   show-select-marker
                                   @update:selected="handleChangeInput('member', $event)"
                >
                    <template #menu-item--format="{ item }">
                        <div class="member-menu-item">
                            <p-avatar class="menu-icon"
                                      size="sm"
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
        </form>
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
