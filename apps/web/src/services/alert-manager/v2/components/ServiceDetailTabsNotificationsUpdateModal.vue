<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import { mapValues } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButtonModal, PFieldGroup, PTextInput, PRadio, PRadioGroup, PPaneLayout, PLazyImg, PJsonSchemaForm, PI, PSelectDropdown, PTag,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';
import type { JsonSchema } from '@cloudforet/mirinae/types/controls/forms/json-schema-form/type';

import type { ServiceChannelUpdateParameters } from '@/schema/alert-manager/service-channel/api-verbs/update';
import { SERVICE_CHANNEL_FORWARD_TYPE, SERVICE_CHANNEL_TYPE } from '@/schema/alert-manager/service-channel/constants';
import type { ServiceChannelModel } from '@/schema/alert-manager/service-channel/model';
import type { MembersType } from '@/schema/alert-manager/service/type';
import { i18n } from '@/translations';

import { assetUrlConverter } from '@/lib/helper/asset-helper';
import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import type { ScheduleSettingFormType } from '@/common/components/schedule-setting-form/schedule-setting-form';
import ScheduleSettingForm from '@/common/components/schedule-setting-form/ScheduleSettingForm.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';
import { useProxyValue } from '@/common/composables/proxy-state';
import UserSelectDropdown from '@/common/modules/user/UserSelectDropdown.vue';

import { useServiceDetailPageStore } from '@/services/alert-manager/v2/stores/service-detail-page-store';
import type { UserRadioType, ProtocolInfo, ProtocolCardItemType } from '@/services/alert-manager/v2/types/alert-manager-type';

interface Props {
    selectedItem?: ServiceChannelModel;
    visible?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
    selectedItem: undefined,
    visible: false,
});

const serviceDetailPageStore = useServiceDetailPageStore();
const serviceDetailPageGetters = serviceDetailPageStore.getters;

const emit = defineEmits<{(e: 'close'): void;
    (e: 'update:visible'): void
}>();

const storeState = reactive({
    serviceMember: computed<Record<MembersType, string[]>>(() => serviceDetailPageGetters.serviceInfo?.members || []),
    notificationProtocolList: computed<ProtocolCardItemType[]>(() => serviceDetailPageGetters.notificationProtocolList),
    language: computed<string>(() => serviceDetailPageGetters.language),
});
const state = reactive({
    loading: false,
    proxyVisible: useProxyValue('visible', props, emit),

    isForwardTypeProtocol: computed<boolean>(() => props.selectedItem?.protocol_id?.toLowerCase().includes('forward') || false),
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
    defaultMemberItems: [] as string[],
    selectedMemberItems: {} as Record<MembersType, string[]>,
    isMemberDataValid: computed<boolean>(() => {
        if (state.selectedRadioIdx === 0) {
            return true;
        }
        if (state.selectedRadioIdx === 1) {
            return (state.selectedMemberItems.USER_GROUP || []).length > 0;
        }
        return (state.selectedMemberItems.USER || []).length > 0;
    }),
    isAllFormValid: computed<boolean>(() => {
        if (!name.value) return false;
        return isAllValid && (state.isForwardTypeProtocol ? state.isMemberDataValid : true);
    }),
    notificationChannelList: computed<SelectDropdownMenuItem[]>(() => storeState.notificationProtocolList.map((i) => ({
        name: i.protocol_id || '',
        label: i.name,
    }))),
    selectedNotificationChannelIds: [],
});

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
        return '';
    },
});

const getProtocolInfo = (id: string): ProtocolInfo => {
    if (id === 'forward') {
        if (props.selectedItem?.data?.FORWARD_TYPE === SERVICE_CHANNEL_FORWARD_TYPE.ALL_MEMBER) {
            return { name: i18n.t('ALERT_MANAGER.NOTIFICATIONS.NOTIFY_TO_ALL_MEMBER') };
        }
        if (props.selectedItem?.data?.FORWARD_TYPE === SERVICE_CHANNEL_FORWARD_TYPE.USER_GROUP) {
            return { name: i18n.t('ALERT_MANAGER.NOTIFICATIONS.NOTIFY_TO_USER_GROUP') };
        }
        if (props.selectedItem?.data?.FORWARD_TYPE === SERVICE_CHANNEL_FORWARD_TYPE.USER) {
            return { name: i18n.t('ALERT_MANAGER.NOTIFICATIONS.NOTIFY_TO_USER') };
        }
        return { name: i18n.t('ALERT_MANAGER.NOTIFICATIONS.ASSOCIATED_MEMBER') };
    }
    const protocol = storeState.notificationProtocolList.find((item) => item.protocol_id === id);
    const schema = protocol?.plugin_info?.metadata.data.schema || {};
    const disabledProperties: Record<string, JsonSchema> = mapValues(schema.properties, (property) => ({
        ...property,
        disabled: true,
    }));
    return {
        name: protocol?.name || '',
        icon: protocol?.icon || '',
        schema: protocol?.plugin_info?.metadata.data_type === 'SECRET' ? {
            ...protocol?.plugin_info?.metadata.data.schema,
            properties: disabledProperties,
        } : schema,
    };
};
const handleTagDelete = (idx: number) => {
    state.selectedNotificationChannelIds.splice(idx, 1);
};
const handleFormattedSelectedIds = (value: Record<MembersType, string[]>) => {
    state.selectedMemberItems = value;
};
const handleChangeRadio = () => {
    state.defaultMemberItems = [];
    state.selectedMemberItems = {} as Record<MembersType, string[]>;
};
const handleScheduleForm = (form: ScheduleSettingFormType) => {
    state.scheduleForm = form;
};

const handleConfirm = async () => {
    state.loading = true;
    try {
        await SpaceConnector.clientV2.alertManager.serviceChannel.update<ServiceChannelUpdateParameters>({
            channel_id: props.selectedItem?.channel_id || '',
            name: name.value,
            schedule: state.scheduleForm,
            data: !state.isForwardTypeProtocol ? state.schemaForm : {
                FORWARD_TYPE: state.radioMenuList[state.selectedRadioIdx].name,
                USER_GROUP: state.selectedRadioIdx === 1 ? state.selectedMemberItems.USER_GROUP : undefined,
                USER: state.selectedRadioIdx === 2 ? state.selectedMemberItems.USER : undefined,
                PROTOCOL: state.selectedNotificationChannelIds?.map((item) => item.name),
            },
        });
        showSuccessMessage(i18n.t('ALERT_MANAGER.SERVICE.ALT_S_UPDATE_SERVICE'), '');
        state.proxyVisible = false;
        emit('close');
    } catch (e) {
        ErrorHandler.handleError(e, true);
    } finally {
        state.loading = false;
    }
};

watch(() => props.selectedItem, (selectedItem) => {
    if (selectedItem) {
        setForm('name', selectedItem.name);
        state.selectedRadioIdx = state.radioMenuList.findIndex((item) => item.name === selectedItem?.data.FORWARD_TYPE);
        state.defaultMemberItems = state.selectedRadioIdx === 1 ? props.selectedItem?.data.USER_GROUP || [] : props.selectedItem?.data.USER || [];
        state.scheduleForm = selectedItem.schedule;
        if (selectedItem.channel_type === SERVICE_CHANNEL_TYPE.DIRECT) {
            state.schemaForm = selectedItem.data;
        }
        state.selectedNotificationChannelIds = (props.selectedItem?.data.PROTOCOL || []).map((i) => ({
            name: i,
            label: storeState.notificationProtocolList.find((item) => item.protocol_id === i)?.name || '',
        }));
    }
}, { immediate: true });
</script>

<template>
    <p-button-modal class="service-detail-tabs-notifications-update-modal"
                    :header-title="$t('ALERT_MANAGER.NOTIFICATIONS.MODAL_UPDATE_TITLE')"
                    :visible.sync="state.proxyVisible"
                    :loading="state.loading"
                    :disabled="!state.isAllFormValid"
                    @confirm="handleConfirm"
    >
        <template #body>
            <div class="bg-gray-100 p-4">
                <p-pane-layout class="pt-6 px-4 pb-4">
                    <p class="pb-4 text-display-md">
                        {{ $t('ALERT_MANAGER.NOTIFICATIONS.BASE_INFO_TITLE') }}
                    </p>
                    <div class="bg-gray-100 inline-flex w-full items-center mb-4 py-2 px-4 gap-2 rounded-md">
                        <p-i v-if="props.selectedItem.protocol_id === 'forward'"
                             name="ic_notification-protocol_users"
                             width="3rem"
                             height="3rem"
                        />
                        <p-lazy-img v-else
                                    :src="assetUrlConverter(getProtocolInfo(props.selectedItem.protocol_id).icon)"
                                    width="3rem"
                                    height="3rem"
                        />
                        <span>{{ getProtocolInfo(props.selectedItem.protocol_id).name }}</span>
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
                    <div v-if="state.isForwardTypeProtocol"
                         class="flex flex-col gap-2"
                    >
                        <p-field-group :label="$t('ALERT_MANAGER.NOTIFICATIONS.TARGET')"
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
                                                          :user-pool="storeState.serviceMember?.USER || []"
                                                          :user-group-pool="storeState.serviceMember?.USER_GROUP || []"
                                                          :show-category-title="false"
                                                          :show-user-group-list="state.selectedRadioIdx === 1"
                                                          :show-user-list="state.selectedRadioIdx === 2"
                                                          :selected-ids="state.defaultMemberItems"
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
                                            <p-lazy-img :src="assetUrlConverter(getProtocolInfo(item.name).icon)"
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
                                                    <p-lazy-img :src="assetUrlConverter(getProtocolInfo(item.name).icon)"
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
                                        :schema="getProtocolInfo(props.selectedItem.protocol_id).schema"
                                        :language="storeState.language"
                                        uniform-width
                    />
                </p-pane-layout>
                <div class="pt-2">
                    <p-pane-layout class="pt-6 px-4 pb-4">
                        <p class="pb-4 text-display-md">
                            {{ $t('ALERT_MANAGER.NOTIFICATIONS.SCHEDULE') }}
                        </p>
                        <schedule-setting-form :schedule-form="state.scheduleForm"
                                               @update-form="handleScheduleForm"
                        />
                    </p-pane-layout>
                </div>
            </div>
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.service-detail-tabs-webhook-update-modal {
    .webhook-item {
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
