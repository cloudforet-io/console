<script setup lang="ts">
import {
    computed, onMounted, reactive, watch,
} from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PFieldGroup, PTextInput, PTooltip, PI,
} from '@cloudforet/mirinae';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { ServiceCreateParameters } from '@/schema/alert-manager/service/api-verbs/create';
import type { ServiceListParameters } from '@/schema/alert-manager/service/api-verbs/list';
import type { ServiceModel } from '@/schema/alert-manager/service/model';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';
import type { SelectedUserDropdownIdsType } from '@/common/modules/user/typte';
import UserSelectDropdown from '@/common/modules/user/UserSelectDropdown.vue';

import ServiceCreateStepContainer from '@/services/alert-manager-v2/components/ServiceCreateStepContainer.vue';
import { useServiceCreateFormStore } from '@/services/alert-manager-v2/stores/service-create-form-store';

const serviceCreateFormStore = useServiceCreateFormStore();

const dropdownState = reactive({
    selectedMemberItems: [] as SelectedUserDropdownIdsType[],
});
const state = reactive({
    isFocusedKey: false,
    isAllFormValid: computed<boolean>(() => (isAllValid && (name && name.value !== '') && (key && key.value !== ''))),
    selectedWorkspaceMemberList: computed<string[]>(() => dropdownState.selectedMemberItems.filter((i) => i.type === 'USER').map((i) => i.value)),
    selectedUserGroupList: computed<string[]>(() => dropdownState.selectedMemberItems.filter((i) => i.type === 'USER_GROUP').map((i) => i.value)),
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

const convertToSnakeCase = (str): string => {
    const cleanedInput = str.replace(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g, '');
    return cleanedInput
        .toLowerCase()
        .split(' ')
        .filter((word) => word.trim() !== '')
        .join('_');
};

const handleChangeInput = (label: 'name'|'key'|'description', value?: string) => {
    setForm(label, value);
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
        showSuccessMessage(i18n.t('ALERT_MANAGER.SERVICE.ALT_S_CREATE_SERVICE'), '');
        serviceCreateFormStore.setCreatedServiceId(createdServiceInfo.service_id);
        serviceCreateFormStore.setCurrentStep(2);
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
                <user-select-dropdown selection-type="multiple"
                                      appearance-type="stack"
                                      use-fixed-menu-style
                                      :selected-ids.sync="dropdownState.selectedMemberItems"
                />
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
