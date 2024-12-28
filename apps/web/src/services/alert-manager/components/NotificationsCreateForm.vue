<script setup lang="ts">
import { useWindowSize } from '@vueuse/core';
import { computed, reactive, watch } from 'vue';

import {
    PFieldGroup, PLazyImg, PTextInput, PRadioGroup, PRadio, PPaneLayout, PJsonSchemaForm, screens,
} from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { useUserStore } from '@/store/user/user-store';

import { assetUrlConverter } from '@/lib/helper/asset-helper';

import type { ScheduleSettingFormType } from '@/common/components/schedule-setting-form/schedule-setting-form';
import ScheduleSettingForm from '@/common/components/schedule-setting-form/ScheduleSettingForm.vue';
import { useFormValidator } from '@/common/composables/form-validator';
import type { SelectedUserDropdownIdsType } from '@/common/modules/user/typte';
import UserSelectDropdown from '@/common/modules/user/UserSelectDropdown.vue';

import { useServiceCreateFormStore } from '@/services/alert-manager/stores/service-create-form-store';
import type { CreatedNotificationInfoType, UserRadioType, ProtocolCardItemType } from '@/services/alert-manager/types/alert-manager-type';

const serviceCreateFormStore = useServiceCreateFormStore();
const serviceCreateFormState = serviceCreateFormStore.state;
const userStore = useUserStore();
const userState = userStore.state;

const { width } = useWindowSize();

const storeState = reactive({
    language: computed<string|undefined>(() => userState.language),
    selectedProtocolType: computed<ProtocolCardItemType>(() => serviceCreateFormState.selectedProtocol),
});
const state = reactive({
    isMobileSize: computed<boolean>(() => width.value < screens.mobile.max),
    isForwardTypeProtocol: computed<boolean>(() => storeState.selectedProtocolType.protocol_id?.toLowerCase().includes('forward') || false),
    scheduleForm: {} as ScheduleSettingFormType,
    schemaForm: {} as Record<string, any>,
    radioMenuList: computed<UserRadioType[]>(() => ([
        {
            label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.MODAL.ALL_MEMBER'),
            name: 'ALL_MEMBER',
        },
        {
            label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.MODAL.USER_GROUP'),
            name: 'USER_GROUP',
        },
        {
            label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.MODAL.SPECIFIC_USER'),
            name: 'USER',
        },
    ])),
    selectedRadioIdx: 0,
    selectedMemberItems: [] as SelectedUserDropdownIdsType[],
    isSchemaDataValid: false,
    isMemberDataValid: computed<boolean>(() => {
        if (state.selectedRadioIdx === 0) {
            return true;
        }
        return state.selectedMemberItems.length > 0;
    }),
});

const emit = defineEmits<{(e: 'change-form', form: CreatedNotificationInfoType, valid: boolean): void}>();

const {
    forms: {
        name,
    },
    setForm,
    invalidState,
    isAllValid,
} = useFormValidator({
    name: '',
}, {
    name(value: string) {
        if (!value) return ' ';
        if (value.length >= 40) {
            return i18n.t('ALERT_MANAGER.NOTIFICATIONS.NAME_INVALID_TEXT');
        }
        return '';
    },
});

const handleSchemaValidate = (isValid: boolean) => {
    state.isSchemaDataValid = isValid;
};
const handleScheduleForm = (form: ScheduleSettingFormType) => {
    state.scheduleForm = form;
};
const handleChangeRadio = () => {
    state.selectedMemberItems = [];
};

watch([() => name.value, () => state.scheduleForm, () => state.selectedRadioIdx, () => state.selectedMemberItems, () => state.schemaForm], (
    [nameVal, scheduleForm, selectedRadioIdx, selectedMemberItems, schemaForm],
) => {
    emit(
        'change-form',
        {
            name: nameVal,
            schedule: scheduleForm,
            data: !state.isForwardTypeProtocol ? schemaForm : {
                FORWARD_TYPE: state.radioMenuList[selectedRadioIdx].name,
                USER_GROUP: selectedRadioIdx === 1 ? selectedMemberItems.map((item) => item.value) : undefined,
                USER: selectedRadioIdx === 2 ? selectedMemberItems.map((item) => item.value) : undefined,
            },
        },
        isAllValid.value && (state.isForwardTypeProtocol ? state.isMemberDataValid : state.isSchemaDataValid),
    );
});
</script>

<template>
    <div class="notification-schedule-form">
        <div v-if="storeState.selectedProtocolType"
             class="protocol-item"
        >
            <p-lazy-img :src="assetUrlConverter(storeState.selectedProtocolType?.icon || '')"
                        width="4rem"
                        height="4rem"
                        error-icon="ic_webhook"
            />
            <div class="info">
                <p class="text-label-xl">
                    {{ storeState.selectedProtocolType?.name }}
                </p>
                <p class="text-label-sm text-gray-600">
                    {{ storeState.selectedProtocolType?.tags?.long_description || storeState.selectedProtocolType?.tags?.description }}
                </p>
            </div>
        </div>
        <p-field-group :label="$t('ALERT_MANAGER.NOTIFICATIONS.CHANNEL_NAME')"
                       class="pt-2"
                       :invalid="invalidState.name"
                       required
        >
            <template #default="{invalid}">
                <p-text-input :value="name"
                              block
                              :invalid="invalid"
                              class="mb-2"
                              @update:value="setForm('name', $event)"
                />
            </template>
        </p-field-group>
        <p-field-group v-if="state.isForwardTypeProtocol"
                       :label="$t('ALERT_MANAGER.NOTIFICATIONS.USER')"
                       required
        >
            <template #default>
                <div class="flex flex-col mt-1 gap-2">
                    <p-radio-group :direction="state.isMobileSize ? 'vertical' : 'horizontal'">
                        <p-radio v-for="(item, idx) in state.radioMenuList"
                                 :key="`notification-scope-${idx}`"
                                 v-model="state.selectedRadioIdx"
                                 :value="idx"
                                 @change="handleChangeRadio"
                        >
                            <span class="radio-item">
                                {{ item.label }}
                            </span>
                        </p-radio>
                    </p-radio-group>
                    <user-select-dropdown v-if="state.selectedRadioIdx !== 0"
                                          selection-type="multiple"
                                          appearance-type="stack"
                                          use-fixed-menu-style
                                          :show-category-title="false"
                                          :show-user-group-list="state.selectedRadioIdx === 1"
                                          :show-user-list="state.selectedRadioIdx === 2"
                                          :selected-ids.sync="state.selectedMemberItems"
                    />
                </div>
            </template>
        </p-field-group>
        <p-json-schema-form v-else
                            :form-data.sync="state.schemaForm"
                            :schema="storeState.selectedProtocolType?.plugin_info?.metadata.data.schema"
                            :language="storeState.language"
                            uniform-width
                            @validate="handleSchemaValidate"
        />
        <div class="pt-2">
            <p-pane-layout class="pt-8 px-4 pb-4">
                <p class="pb-4 text-display-md">
                    {{ $t('ALERT_MANAGER.NOTIFICATIONS.SCHEDULE') }}
                </p>
                <schedule-setting-form @update-form="handleScheduleForm" />
            </p-pane-layout>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.notification-schedule-form {
    .protocol-item {
        @apply flex items-center w-full;
        margin-bottom: 1.5rem;
        gap: 1rem;
        .info {
            @apply flex flex-col;
            gap: 0.125rem;
            flex: 1;
        }
    }
}
</style>
