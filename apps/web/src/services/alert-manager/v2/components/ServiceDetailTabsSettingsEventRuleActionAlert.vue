<script setup lang="ts">
import { useWindowSize } from '@vueuse/core';
import { computed, reactive, watch } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButton, PDivider,
    PFieldGroup,
    PFieldTitle,
    PI, PIconButton,
    PRadio,
    PRadioGroup,
    PSelectDropdown,
    PTextInput,
    PToggleButton, screens,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';
import type { InputItem } from '@cloudforet/mirinae/types/controls/input/text-input/type';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import { ALERT_STATUS } from '@/schema/alert-manager/alert/constants';
import type { AlertStatusType } from '@/schema/alert-manager/alert/type';
import type { EscalationPolicyListParameters } from '@/schema/alert-manager/escalation-policy/api-verbs/list';
import type { EscalationPolicyModel } from '@/schema/alert-manager/escalation-policy/model';
import { EVENT_RULE_URGENCY } from '@/schema/alert-manager/event-rule/constant';
import type { EventRuleModel } from '@/schema/alert-manager/event-rule/model';
import type {
    EventRuleActionsType,
    EventRuleUrgencyType,
} from '@/schema/alert-manager/event-rule/type';
import type { ServiceModel } from '@/schema/alert-manager/service/model';
import { i18n } from '@/translations';

import ErrorHandler from '@/common/composables/error/errorHandler';
import type { TagItem } from '@/common/modules/tags/type';

import { gray } from '@/styles/colors';

import { useServiceDetailPageStore } from '@/services/alert-manager/v2/stores/service-detail-page-store';
import type {
    EventRuleActionsToggleType,
    EventRuleActionsUrgencyRadioType,
} from '@/services/alert-manager/v2/types/alert-manager-type';

const serviceDetailPageStore = useServiceDetailPageStore();
const serviceDetailPageState = serviceDetailPageStore.state;

const { width } = useWindowSize();

const emit = defineEmits<{(e: 'change-form', form: EventRuleActionsType): void}>();

const storeState = reactive({
    service: computed<ServiceModel>(() => serviceDetailPageState.serviceInfo),
    isEventRuleEditMode: computed<boolean>(() => serviceDetailPageState.isEventRuleEditMode),
    eventRuleInfo: computed<EventRuleModel>(() => serviceDetailPageState.eventRuleInfo),
});
const state = reactive({
    isMobileSize: computed<boolean>(() => width.value < screens.mobile.max),
    actions: computed<EventRuleActionsToggleType[]>(() => ([
        {
            label: i18n.t('ALERT_MANAGER.EVENT_RULE.CHANGE_TITLE'),
            name: 'change_title',
        },
        {
            label: i18n.t('ALERT_MANAGER.EVENT_RULE.CHANGE_STATUS'),
            name: 'change_status',
        },
        {
            label: i18n.t('ALERT_MANAGER.EVENT_RULE.CHANGE_URGENCY'),
            name: 'change_urgency',
        },
        {
            label: i18n.t('ALERT_MANAGER.ESCALATION_POLICY.TITLE'),
            name: 'change_escalation_policy',
        },
    ])),
    additionalActions: computed<EventRuleActionsToggleType[]>(() => ([
        {
            label: i18n.t('ALERT_MANAGER.EVENT_RULE.LABEL_LABELS'),
            name: 'set_labels',
        },
        {
            label: i18n.t('ALERT_MANAGER.EVENT_RULE.LABEL_ADDITIONAL_INFO'),
            name: 'add_additional_info',
        },
    ])),
    statusDropdownList: computed<SelectDropdownMenuItem[]>(() => [
        { label: i18n.t('ALERT_MANAGER.ALERTS.TRIGGERED'), name: ALERT_STATUS.TRIGGERED },
        { label: i18n.t('ALERT_MANAGER.ALERTS.ACKNOWLEDGED'), name: ALERT_STATUS.ACKNOWLEDGED },
        { label: i18n.t('ALERT_MANAGER.ALERTS.RESOLVED'), name: ALERT_STATUS.RESOLVED },
        { label: i18n.t('ALERT_MANAGER.ALERTS.IGNORED'), name: ALERT_STATUS.IGNORED },
    ]),
    urgencyRadioMenuList: computed<EventRuleActionsUrgencyRadioType[]>(() => [
        { label: i18n.t('ALERT_MANAGER.EVENT_RULE.HIGH'), name: EVENT_RULE_URGENCY.HIGH },
        { label: i18n.t('ALERT_MANAGER.EVENT_RULE.LOW'), name: EVENT_RULE_URGENCY.LOW },
    ]),
    escalationPolicyDropdownList: [] as SelectDropdownMenuItem[],

    selectedActions: {
        change_title: false,
        change_status: false,
        change_urgency: false,
        change_escalation_policy: false,
    },

    title: '',
    selectedStatus: ALERT_STATUS.TRIGGERED as AlertStatusType,
    selectedUrgencyRadio: EVENT_RULE_URGENCY.HIGH as EventRuleUrgencyType,
    selectedEscalationPolicyId: storeState.service.escalation_policy_id,
    labels: [] as InputItem[],
    additionalInfoTags: [{ key: '', value: '' }] as TagItem[],
});

const updateStateFromEventRuleInfo = (): void => {
    const actions = storeState.eventRuleInfo.actions;
    if (!actions) return;

    if (actions.change_title) {
        state.selectedActions.change_title = true;
        state.title = actions.change_title;
    }
    if (actions.change_status) {
        state.selectedActions.change_status = true;
        state.selectedStatus = actions.change_status;
    }
    if (actions.change_urgency) {
        state.selectedActions.change_urgency = true;
        state.selectedUrgencyRadio = actions.change_urgency;
    }
    if (actions.change_escalation_policy) {
        state.selectedActions.change_escalation_policy = true;
        state.selectedEscalationPolicyId = actions.change_escalation_policy;
    }
    if (actions.set_labels) {
        state.labels = actions.set_labels.map((label) => ({ name: label }));
    }
    if (actions.add_additional_info) {
        state.additionalInfoTags = Object.entries(actions.add_additional_info).map(([key, value]) => ({
            key,
            value,
        }));
    }
};
const handleSelectEscalationPolicy = (value) => {
    if (value) state.selectedEscalationPolicyId = value;
    else state.selectedEscalationPolicyId = '';
};
const handleUpdateToggle = (action: string, value: boolean) => {
    state.selectedActions[action] = value;
    if (value) {
        if (action === 'change_title') {
            state.title = '';
        }
        if (action === 'change_status') {
            state.selectedStatus = ALERT_STATUS.TRIGGERED;
        }
        if (action === 'change_urgency') {
            state.selectedUrgencyRadio = EVENT_RULE_URGENCY.HIGH;
        }
        if (action === 'change_escalation_policy') {
            state.selectedEscalationPolicyId = storeState.service.escalation_policy_id;
        }
    }
};

const handleAddTagPair = () => {
    state.additionalInfoTags.push({ key: '', value: '' });
};
const handleDeleteTagPair = (idx: number) => {
    const _items = [...state.additionalInfoTags];
    _items.splice(idx, 1);
    state.additionalInfoTags = _items;
};
const handleInputTagKey = (idx, val) => {
    const _items = [...state.additionalInfoTags];
    _items[idx].key = val;
    state.additionalInfoTags = _items;
};
const handleInputTagValue = (idx, val) => {
    const _items = [...state.additionalInfoTags];
    _items[idx].value = val;
    state.additionalInfoTags = _items;
};

const fetchEscalationPolicyList = async () => {
    try {
        const { results } = await SpaceConnector.clientV2.alertManager.escalationPolicy.list<EscalationPolicyListParameters, ListResponse<EscalationPolicyModel>>({
            service_id: storeState.service.service_id,
        });
        state.escalationPolicyDropdownList = (results || []).map((item) => ({
            name: item.escalation_policy_id,
            label: item.name,
        }));
    } catch (e) {
        ErrorHandler.handleError(e);
        state.escalationPolicyDropdownList = [];
    }
};

watch([
    () => state.selectedActions,
    () => state.title,
    () => state.selectedStatus,
    () => state.selectedUrgencyRadio,
    () => state.selectedEscalationPolicyId,
    () => state.labels,
    () => state.additionalInfoTags,
], (
    [selectedActions, title, selectedStatus, selectedUrgencyRadio, selectedEscalationPolicyId, labels, additionalInfoTags],
) => {
    const validAdditionalInfoTags = additionalInfoTags.filter(
        (item) => item.key.toString().trim() !== '' && item.value.toString().trim() !== '',
    );
    const addAdditionalInfo = validAdditionalInfoTags.length > 0 ? validAdditionalInfoTags.reduce((acc, item) => {
        acc[item.key] = item.value.toString().trim();
        return acc;
    }, {} as Record<string, string>) : undefined;

    emit('change-form', {
        change_title: selectedActions.change_title ? title : undefined,
        change_status: selectedActions.change_status ? selectedStatus : undefined,
        change_urgency: selectedActions.change_urgency ? selectedUrgencyRadio : undefined,
        change_escalation_policy: selectedActions.change_escalation_policy ? selectedEscalationPolicyId : undefined,
        set_labels: labels.length > 0 ? labels.map((label) => label.name) : undefined,
        add_additional_info: addAdditionalInfo,
    });
}, { deep: true });
watch(() => storeState.isEventRuleEditMode, (isEditMode) => {
    if (isEditMode) {
        updateStateFromEventRuleInfo();
    } else {
        state.selectedActions = {
            change_title: false,
            change_status: false,
            change_urgency: false,
            change_escalation_policy: false,
        };
    }
}, { immediate: true });
watch(() => storeState.service.service_id, (id) => {
    if (!id) return;
    fetchEscalationPolicyList();
}, { immediate: true });
</script>

<template>
    <div class="service-detail-tabs-settings-event-rule-action-alert-form"
         :class="{ 'is-mobile': state.isMobileSize }"
    >
        <p-field-title :label="$t('ALERT_MANAGER.EVENT_RULE.ALERT_SETTINGS')"
                       size="lg"
                       required
                       class="field-title"
        />
        <div class="flex flex-col pr-3 pl-3">
            <p-field-group v-for="(action, actionIdx) in state.actions"
                           :key="`action-${actionIdx}`"
                           class="field-group flex flex-col"
            >
                <div class="contents-wrapper">
                    <div class="toggle-wrapper flex items-center gap-2 mr-2">
                        <p-toggle-button :value="state.selectedActions[action.name]"
                                         @update:value="handleUpdateToggle(action.name, $event)"
                        />
                        <p-field-title font-weight="regular">
                            {{ action.label }}
                        </p-field-title>
                    </div>
                    <div v-if="state.selectedActions[action.name]"
                         class="input-wrapper"
                    >
                        <p-text-input v-if="action.name === 'change_title'"
                                      v-model="state.title"
                                      block
                        />
                        <div v-if="action.name === 'change_status'"
                             class="field-title change-status flex gap-2 justify-between"
                        >
                            <p-select-dropdown :menu="state.statusDropdownList"
                                               use-fixed-menu-style
                                               class="status-dropdown"
                                               :selected.sync="state.selectedStatus"
                            />
                            <p v-if="state.selectedStatus === ALERT_STATUS.IGNORED"
                               class="flex items-center gap-1 text-gray-500 text-label-sm"
                            >
                                <p-i name="ic_warning-filled"
                                     width="1rem"
                                     height="1rem"
                                     :color="gray[500]"
                                />
                                <span>{{ $t('ALERT_MANAGER.EVENT_RULE.IGNORED_DESC') }}</span>
                            </p>
                        </div>
                        <p-radio-group v-if="action.name === 'change_urgency'"
                                       class="field-title"
                        >
                            <p-radio v-for="(item, urgencyIdx) in state.urgencyRadioMenuList"
                                     :key="`change-status-${urgencyIdx}`"
                                     v-model="state.selectedUrgencyRadio"
                                     :value="item.name"
                            >
                                <span class="radio-item">
                                    {{ item.label }}
                                </span>
                            </p-radio>
                        </p-radio-group>
                        <p-select-dropdown v-if="action.name === 'change_escalation_policy'"
                                           :menu="state.escalationPolicyDropdownList"
                                           use-fixed-menu-style
                                           block
                                           show-delete-all-button
                                           :selected="state.selectedEscalationPolicyId"
                                           @update:selected="handleSelectEscalationPolicy"
                        />
                    </div>
                </div>
            </p-field-group>
            <div class="mt-3">
                <p-divider />
                <div class="pt-3 pb-3">
                    <div class="field-title flex items-center gap-1">
                        <p-field-title :label="$t('ALERT_MANAGER.EVENT_RULE.ADDITIONAL_OPTIONS')"
                                       size="md"
                        />
                        <span class="text-label-md text-gray-500">
                            ({{ $t('ALERT_MANAGER.EVENT_RULE.OPTIONAL') }})
                        </span>
                    </div>
                </div>
                <div class="additional-info-wrapper pl-3 pr-3">
                    <p-field-group v-for="(item, adIdx) in state.additionalActions"
                                   :key="`additional-action-${adIdx}`"
                                   class="field-group flex items-start"
                    >
                        <p-field-title font-weight="regular"
                                       class="field-title toggle-wrapper"
                        >
                            {{ item.label }}
                        </p-field-title>
                        <div class="input-wrapper">
                            <p-text-input v-if="item.name === 'set_labels'"
                                          multi-input
                                          appearance-type="stack"
                                          :selected.sync="state.labels"
                                          block
                            />
                            <div v-if="item.name === 'add_additional_info'"
                                 class="flex flex-col gap-3"
                            >
                                <div v-for="(tag, tagIdx) in state.additionalInfoTags"
                                     :key="`tag-${tagIdx}`"
                                     class="flex gap-2 items-center"
                                >
                                    <p-field-group class="input-box">
                                        <p-text-input :value="tag.key"
                                                      :style="state.isMobileSize ? 'width: 6rem' : ''"
                                                      block
                                                      @update:value="handleInputTagKey(tagIdx, ...arguments)"
                                        />
                                    </p-field-group>
                                    <p-field-group class="input-box">
                                        <p-text-input :value="tag.value"
                                                      :style="state.isMobileSize ? 'width: 6rem' : ''"
                                                      block
                                                      @update:value="handleInputTagValue(tagIdx, ...arguments)"
                                        />
                                    </p-field-group>
                                    <p-icon-button name="ic_delete"
                                                   @click="handleDeleteTagPair(tagIdx)"
                                    />
                                </div>
                                <p-button icon-left="ic_plus_bold"
                                          class="w-full mb-3"
                                          style-type="tertiary"
                                          size="md"
                                          @click="handleAddTagPair"
                                >
                                    {{ $t('COMMON.BUTTONS.ADD') }}
                                </p-button>
                            </div>
                        </div>
                    </p-field-group>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="postcss">
.service-detail-tabs-settings-event-rule-action-alert-form {
    .additional-info-wrapper {
        .field-group {
            & + .field-group {
                @apply border-gray-150;
            }
        }
    }
    .field-group {
        margin-bottom: 0;
        & + .field-group {
            @apply mt-3 pt-3 border-t border-gray-200;
        }
        .input-box {
            @apply inline-block flex-1;
            margin-bottom: 0;
        }
        .contents-wrapper {
            @apply flex items-start w-full;
        }
    }
    .field-title {
        padding-top: 0.375rem;
        padding-bottom: 0.375rem;
    }
    .toggle-wrapper {
        min-width: 12.5rem;
        height: 2rem;
    }
    .input-wrapper {
        width: calc(100% - 12.5rem);
        .status-dropdown {
            min-width: 10.375rem;
        }
    }
    &.is-mobile {
        .field-group {
            @apply flex flex-col;
            margin-bottom: 0;
            & + .field-group {
                @apply mt-3 pt-3 border-t border-gray-200;
            }
            .contents-wrapper {
                @apply flex flex-col;
            }
        }
        .field-title {
            @apply flex;
            padding-top: 0.375rem;
            padding-bottom: 0.375rem;
            &.change-status {
                @apply flex flex-col;
            }
        }
        .toggle-wrapper {
            min-width: 12.5rem;
            height: 2rem;
        }
        .input-wrapper {
            @apply flex flex-col;
            width: 100%;
        }
    }
}
</style>
