<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import { zipObject } from 'lodash';

import {
    PFieldGroup, PLazyImg, PTextInput, PRadioGroup, PRadio, PPaneLayout,
} from '@cloudforet/mirinae';

import type { NotificationProtocolModel } from '@/schema/alert-manager/notification-protocol/model';
import type { ServiceChannelScheduleDayType } from '@/schema/alert-manager/service-channel/type';
import { i18n } from '@/translations';

import { assetUrlConverter } from '@/lib/helper/asset-helper';

import ScheduleSettingForm from '@/common/components/schedule-setting-form/ScheduleSettingForm.vue';
import { useFormValidator } from '@/common/composables/form-validator';
import type { SelectedUserDropdownIdsType } from '@/common/modules/user/typte';
import UserSelectDropdown from '@/common/modules/user/UserSelectDropdown.vue';

import { useServiceCreateFormStore } from '@/services/alert-manager-v2/stores/service-create-form-store';
import type { CreatedNotificationInfoType, UserRadioType } from '@/services/alert-manager-v2/types/alert-manager-type';
import type { ScheduleDayType, ScheduleForm } from '@/services/alert-manager-v2/types/schedule-setting-form';

const serviceFormStore = useServiceCreateFormStore();
const serviceFormState = serviceFormStore.state;

const storeState = reactive({
    selectedProtocolType: computed<NotificationProtocolModel|undefined>(() => serviceFormState.selectedProtocol),
});
const state = reactive({
    scheduleForm: {} as ScheduleForm,
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
});

const emit = defineEmits<{(e: 'change-form', form: CreatedNotificationInfoType): void}>();

const {
    forms: {
        name,
    },
    setForm,
    invalidState,
    invalidTexts,
} = useFormValidator({
    name: '',
}, {
    name(value: string) {
        if (value.length >= 40) {
            return i18n.t('ALERT_MANAGER.WEBHOOK.VALIDATION_NAME_MAX');
        }
        return '';
    },
});

const handleScheduleForm = (form: ScheduleForm) => {
    state.scheduleForm = form;
};
const handleChangeRadio = () => {
    state.selectedMemberItems = [];
};

const createScheduleMap = (scheduleForm: ScheduleForm): Record<ScheduleDayType, ServiceChannelScheduleDayType> => {
    const allDays: ScheduleDayType[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    const { days, start, end } = scheduleForm;

    const refinedDays = allDays.map((day) => ({
        is_schedule: days.includes(day),
        start,
        end,
    }));

    return zipObject(allDays, refinedDays) as Record<ScheduleDayType, ServiceChannelScheduleDayType>;
};

watch([() => name.value, () => state.scheduleForm, () => state.selectedRadioIdx, () => state.selectedMemberItems], ([nameVal, scheduleForm, selectedRadioIdx, selectedMemberItems]) => {
    emit('change-form', {
        name: nameVal,
        schedule: {
            SCHEDULE_TYPE: scheduleForm.type,
            ...createScheduleMap(scheduleForm),
        },
        data: {
            FORWARD_TYPE: state.radioMenuList[selectedRadioIdx].name,
            USER_GROUP: selectedRadioIdx === 1 ? selectedMemberItems.map((item) => item.value) : undefined,
            USER: selectedRadioIdx === 2 ? selectedMemberItems.map((item) => item.value) : undefined,
        },
    });
});
</script>

<template>
    <div class="notification-schedule-form">
        <div v-if="storeState.selectedProtocolType"
             class="protocol-item"
        >
            <p-lazy-img :src="assetUrlConverter(storeState.selectedProtocolType?.tags?.icon || '')"
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
                       :invalid-text="invalidTexts.name"
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
        <p-field-group :label="$t('ALERT_MANAGER.NOTIFICATIONS.USER')"
                       required
        >
            <template #default>
                <div class="flex flex-col mt-1 gap-2">
                    <p-radio-group>
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
        <div class="pt-2">
            <p-pane-layout class="pt-8 px-4 pb-4">
                <p class="pb-4 text-display-md">
                    {{ $t('ALERT_MANAGER.NOTIFICATIONS.SCHEDULE') }}
                </p>
                <schedule-setting-form @schedule-form="handleScheduleForm" />
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
