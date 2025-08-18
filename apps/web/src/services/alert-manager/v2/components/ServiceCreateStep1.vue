<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';

import { useMutation, useQueryClient } from '@tanstack/vue-query';

import {
    PFieldGroup, PTextInput, PTooltip, PI,
} from '@cloudforet/mirinae';

import { useServiceApi } from '@/api-clients/alert-manager/service/composables/use-service-api';
import type { ServiceCreateParameters } from '@/api-clients/alert-manager/service/schema/api-verbs/create';
import type { MembersType } from '@/api-clients/alert-manager/service/schema/type';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ServiceReferenceMap } from '@/store/reference/service-reference-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';
import UserSelectDropdown from '@/common/modules/user/UserSelectDropdown.vue';

import ServiceCreateStepContainer from '@/services/alert-manager/v2/components/ServiceCreateStepContainer.vue';
import { useServiceCreateFormStore } from '@/services/alert-manager/v2/stores/service-create-form-store';

const serviceCreateFormStore = useServiceCreateFormStore();
const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;

const dropdownState = reactive({
    selectedMemberItems: {} as Record<MembersType, string[]>,
});
const storeState = reactive({
    serviceListMap: computed<ServiceReferenceMap>(() => allReferenceGetters.service),
});
const state = reactive({
    isFocusedKey: false,
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
        if (!value) return ' ';
        const duplicatedName = Object.values(storeState.serviceListMap)?.find((item) => item.label === value);
        if (duplicatedName) {
            return i18n.t('ALERT_MANAGER.SERVICE.VALIDATION_NAME_UNIQUE');
        }
        return '';
    },
    key(value: string) {
        if (!value) return ' ';
        const duplicatedName = Object.values(storeState.serviceListMap)?.find((item) => item.key === value);
        if (duplicatedName) {
            return i18n.t('ALERT_MANAGER.SERVICE.VALIDATION_KEY_UNIQUE');
        }
        const regex = /^[A-Z0-9-]+$/;
        if (!regex.test(value)) {
            return i18n.t('ALERT_MANAGER.SERVICE.VALIDATION_KEY');
        }
        const invalidHyphenRegex = /^-|-$|--/;
        if (invalidHyphenRegex.test(value)) {
            return i18n.t('ALERT_MANAGER.SERVICE.VALIDATION_KEY_HYPHEN');
        }
        return '';
    },
});

const queryClient = useQueryClient();
const { serviceAPI } = useServiceApi();
const { key: serviceListBaseQueryKey } = useServiceQueryKey('alert-manager', 'service', 'list');
const { mutate: createService, isPending: createServiceLoading } = useMutation({
    mutationFn: (params: ServiceCreateParameters) => serviceAPI.create(params),
    onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: serviceListBaseQueryKey.value });
        showSuccessMessage(i18n.t('ALERT_MANAGER.SERVICE.ALT_S_CREATE_SERVICE'), '');
        serviceCreateFormStore.setCreatedService(data);
        serviceCreateFormStore.setCurrentStep(2);
    },
    onError: (error) => {
        ErrorHandler.handleError(error, true);
    },
});

const handleFormattedSelectedIds = (value: Record<MembersType, string[]>) => {
    dropdownState.selectedMemberItems = value;
};
const convertToSnakeCase = (str): string => {
    const cleanedInput = str.replace(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g, '');
    return cleanedInput
        .toUpperCase()
        .split(' ')
        .filter((word) => word.trim() !== '')
        .join('-');
};

const handleChangeInput = (label: 'name'|'key'|'description', value?: string) => {
    setForm(label, value);
};

const handleCreateService = async () => {
    createService({
        name: name.value,
        service_key: key.value,
        members: {
            USER: dropdownState.selectedMemberItems.USER,
            USER_GROUP: dropdownState.selectedMemberItems.USER_GROUP,
        },
        description: description.value,
    });
};

watch(() => state.isFocusedKey, (isFocusedKey) => {
    if (isFocusedKey && !key.value) {
        handleChangeInput('key', convertToSnakeCase(name.value));
    }
});
</script>

<template>
    <service-create-step-container class="service-create-step1"
                                   :is-all-form-valid="isAllValid"
                                   :loading="createServiceLoading"
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
                                      @formatted-selected-ids="handleFormattedSelectedIds"
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
