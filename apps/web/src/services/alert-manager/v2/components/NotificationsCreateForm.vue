<script setup lang="ts">
import { useWindowSize } from '@vueuse/core';
import { computed, reactive, watch } from 'vue';

import {
    PFieldGroup, PLazyImg, PTextInput, PRadioGroup, PRadio, PPaneLayout, PJsonSchemaForm, screens, PI, PSelectDropdown, PTag,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import type { NotificationProtocolModel } from '@/schema/alert-manager/notification-protocol/model';
import type { MembersType } from '@/schema/alert-manager/service/type';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { PluginReferenceMap } from '@/store/reference/plugin-reference-store';
import { useUserStore } from '@/store/user/user-store';

import { assetUrlConverter } from '@/lib/helper/asset-helper';

import type { ScheduleSettingFormType } from '@/common/components/schedule-setting-form/schedule-setting-form';
import ScheduleSettingForm from '@/common/components/schedule-setting-form/ScheduleSettingForm.vue';
import { useFormValidator } from '@/common/composables/form-validator';
import UserSelectDropdown from '@/common/modules/user/UserSelectDropdown.vue';

import { useServiceCreateFormStore } from '@/services/alert-manager/v2/stores/service-create-form-store';
import type { CreatedNotificationInfoType, UserRadioType, ProtocolCardItemType } from '@/services/alert-manager/v2/types/alert-manager-type';

const serviceCreateFormStore = useServiceCreateFormStore();
const serviceCreateFormState = serviceCreateFormStore.state;
const userStore = useUserStore();
const userState = userStore.state;
const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;

const { width } = useWindowSize();

const storeState = reactive({
    language: computed<string|undefined>(() => userState.language),
    plugins: computed<PluginReferenceMap>(() => allReferenceGetters.plugin),
    createdServiceMembers: computed<Record<MembersType, string[]>>(() => serviceCreateFormState.createdService.members),
    selectedProtocolType: computed<ProtocolCardItemType>(() => serviceCreateFormState.selectedProtocol),
    protocolList: computed<NotificationProtocolModel[]>(() => serviceCreateFormState.protocolList),
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
    selectedMemberIds: [] as string[],
    selectedMemberItems: {} as Record<MembersType, string[]>,
    notificationChannelList: computed<SelectDropdownMenuItem[]>(() => storeState.protocolList.map((i) => ({
        name: i.protocol_id,
        label: i.name,
    }))),
    selectedNotificationChannelIds: [],
    isSchemaDataValid: false,
    isMemberDataValid: computed<boolean>(() => {
        if (state.selectedRadioIdx === 0) {
            return true;
        }
        if (state.selectedRadioIdx === 1) {
            return (state.selectedMemberItems.USER_GROUP || []).length > 0;
        }
        return (state.selectedMemberItems.USER || []).length > 0;
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

const getPluginIcon = (id: string): string => {
    const item = storeState.protocolList.find((i) => i.protocol_id === id);
    if (!item) return '';
    return storeState.plugins[item.plugin_info.plugin_id]?.icon || '';
};
const handleFormattedSelectedIds = (value: Record<MembersType, string[]>) => {
    state.selectedMemberItems = value;
};
const handleSchemaValidate = (isValid: boolean) => {
    state.isSchemaDataValid = isValid;
};
const handleScheduleForm = (form: ScheduleSettingFormType) => {
    state.scheduleForm = form;
};
const handleChangeRadio = () => {
    state.selectedMemberItems = {};
    state.selectedMemberIds = [];
};
const handleTagDelete = (idx: number) => {
    state.selectedNotificationChannelIds.splice(idx, 1);
};

watch([() => name.value, () => state.scheduleForm, () => state.selectedRadioIdx, () => state.selectedMemberItems, () => state.schemaForm, () => state.selectedNotificationChannelIds], (
    [nameVal, scheduleForm, selectedRadioIdx, selectedMemberItems, schemaForm, selectedNotificationChannelIds],
) => {
    emit(
        'change-form',
        {
            name: nameVal,
            schedule: scheduleForm,
            data: !state.isForwardTypeProtocol ? schemaForm : {
                FORWARD_TYPE: state.radioMenuList[selectedRadioIdx].name,
                USER_GROUP: selectedRadioIdx === 1 ? selectedMemberItems.USER_GROUP : undefined,
                USER: selectedRadioIdx === 2 ? selectedMemberItems.USER : undefined,
                PROTOCOL: selectedNotificationChannelIds.map((i) => i.name),
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
            <p-i v-if="storeState.selectedProtocolType.protocol_id === 'forward'"
                 name="ic_notification-protocol_users"
                 width="4rem"
                 height="4rem"
            />
            <p-lazy-img v-else
                        :src="assetUrlConverter(storeState.selectedProtocolType?.icon || '')"
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
                       :invalid="invalidState.name"
                       required
                       class="field-group"
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
        <div v-if="state.isForwardTypeProtocol"
             class="flex flex-col gap-6 mb-2"
        >
            <p-field-group :label="$t('ALERT_MANAGER.NOTIFICATIONS.TARGET')"
                           required
                           class="field-group"
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
                                              :selected-ids.sync="state.selectedMemberIds"
                                              :user-pool="storeState.createdServiceMembers?.USER || []"
                                              :user-group-pool="storeState.createdServiceMembers?.USER_GROUP || []"
                                              :show-category-title="false"
                                              :show-user-group-list="state.selectedRadioIdx === 1"
                                              :show-user-list="state.selectedRadioIdx === 2"
                                              @formatted-selected-ids="handleFormattedSelectedIds"
                        />
                    </div>
                </template>
            </p-field-group>
            <p-field-group :label="$t('ALERT_MANAGER.NOTIFICATIONS.NOTIFICATION_CHANNEL')"
                           class="field-group"
            >
                <template #default>
                    <p-select-dropdown :menu="state.notificationChannelList"
                                       use-fixed-menu-style
                                       multi-selectable
                                       is-filterable
                                       show-select-marker
                                       appearance-type="stack"
                                       :selected.sync="state.selectedNotificationChannelIds"
                    >
                        <template #menu-item--format="{ item }">
                            <div class="flex items-center gap-1">
                                <p-lazy-img :src="assetUrlConverter(getPluginIcon(item.name))"
                                            width="1.25rem"
                                            height="1.25rem"
                                />
                                <span>{{ item.label }}</span>
                            </div>
                        </template>
                        <template #dropdown-button>
                            <div v-if="state.selectedNotificationChannelIds.length > 0"
                                 class="flex flex-wrap py-1 gap-y-2"
                            >
                                <p-tag v-for="(item, idx) in state.selectedNotificationChannelIds"
                                       :key="item.name"
                                       @delete="handleTagDelete(idx)"
                                >
                                    <div class="flex items-center gap-1">
                                        <p-lazy-img :src="assetUrlConverter(getPluginIcon(item.name))"
                                                    width="1rem"
                                                    height="1rem"
                                        />
                                        <span>{{ item.label }}</span>
                                    </div>
                                </p-tag>
                            </div>
                        </template>
                    </p-select-dropdown>
                </template>
            </p-field-group>
        </div>
        <p-json-schema-form v-else
                            :form-data.sync="state.schemaForm"
                            :schema="storeState.selectedProtocolType?.plugin_info?.metadata.data.schema"
                            :language="storeState.language"
                            uniform-width
                            @validate="handleSchemaValidate"
        />
        <p-pane-layout class="pt-8 px-4 pb-4">
            <p class="pb-4 text-display-md">
                {{ $t('ALERT_MANAGER.NOTIFICATIONS.SCHEDULE') }}
            </p>
            <schedule-setting-form @update-form="handleScheduleForm" />
        </p-pane-layout>
    </div>
</template>

<style lang="postcss" scoped>
.notification-schedule-form {
    @apply flex flex-col gap-6;
    .protocol-item {
        @apply flex items-center w-full;
        margin-bottom: 0.5rem;
        gap: 1rem;
        .info {
            @apply flex flex-col;
            gap: 0.125rem;
            flex: 1;
        }
    }
    .field-group {
        margin-bottom: 0;
    }
}
</style>
