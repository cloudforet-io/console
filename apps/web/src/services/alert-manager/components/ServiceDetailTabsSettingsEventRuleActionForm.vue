<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import { cloneDeep } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PFieldTitle,
    PFieldGroup,
    PToggleButton,
    PSelectDropdown,
    PLink,
    PBadge,
    PDivider,
    PTextInput,
    PRadio,
    PRadioGroup,
    PI, PButton, PIconButton,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';
import type { InputItem } from '@cloudforet/mirinae/types/controls/input/text-input/type';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import { ALERT_STATUS } from '@/schema/alert-manager/alert/constants';
import type { EscalationPolicyListParameters } from '@/schema/alert-manager/escalation-policy/api-verbs/list';
import type { EscalationPolicyModel } from '@/schema/alert-manager/escalation-policy/model';
import { EVENT_RULE_URGENCY } from '@/schema/alert-manager/event-rule/constant';
import type { EventRuleActionsType } from '@/schema/alert-manager/event-rule/type';
import type { ServiceModel } from '@/schema/alert-manager/service/model';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';

import type { TagItem } from '@/common/components/forms/tags-input-group/type';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { gray } from '@/styles/colors';

import { getActionSettingTypeI18n } from '@/services/alert-manager/composables/event-rule-action-data';
import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/routes/route-constant';
import { useServiceDetailPageStore } from '@/services/alert-manager/stores/service-detail-page-store';
import type {
    EventRuleActionsToggleType,
    EventRuleSettingsType,
    EventRuleActionsUrgencyRadioType,
    EscalationPolicyRadioType,
} from '@/services/alert-manager/types/alert-manager-type';

const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;
const serviceDetailPageStore = useServiceDetailPageStore();
const serviceDetailPageState = serviceDetailPageStore.state;

const emit = defineEmits<{(e: 'change-form', form: EventRuleActionsType): void}>();

const storeState = reactive({
    service: computed<ServiceModel>(() => serviceDetailPageState.serviceInfo),
    serviceDropdownList: computed<SelectDropdownMenuItem[]>(() => Object.values(allReferenceGetters.service).map((i) => ({
        name: i.name,
        label: i.label,
    }))),
    cloudServiceTypeDropdownList: computed<SelectDropdownMenuItem[]>(() => Object.values(allReferenceGetters.cloudServiceType).map((i) => ({
        name: i.key,
        label: i.label,
    }))),
});

const state = reactive({
    actionSettingType: getActionSettingTypeI18n(),
    actions: computed<Record<EventRuleSettingsType, EventRuleActionsToggleType[]>>(() => ({
        service: [
            {
                label: i18n.t('ALERT_MANAGER.EVENT_RULE.CHANGE_SERVICE'),
                name: 'change_service',
            },
        ],
        asset: [
            {
                label: i18n.t('ALERT_MANAGER.EVENT_RULE.ASSET_SCOPE'),
                name: 'match_asset.asset_types',
            },
        ],
        alert: [
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
        ],
    })),
    additionalActions: computed<EventRuleActionsToggleType[]>(() => ([
        {
            label: i18n.t('ALERT_MANAGER.ESCALATION_POLICY.TITLE'),
            name: 'change_escalation_policy',
        },
        {
            label: i18n.t('ALERT_MANAGER.EVENT_RULE.LABEL_LABELS'),
            name: 'set_labels',
        },
        {
            label: i18n.t('ALERT_MANAGER.EVENT_RULE.LABEL_ADDITIONAL_INFO'),
            name: 'additional_info',
        },
    ])),
    statusRadioMenuList: computed<EscalationPolicyRadioType[]>(() => [
        { label: i18n.t('ALERT_MANAGER.ALERTS.IGNORED'), name: ALERT_STATUS.IGNORED },
        { label: i18n.t('ALERT_MANAGER.ALERTS.TRIGGERED'), name: ALERT_STATUS.TRIGGERED },
    ]),
    urgencyRadioMenuList: computed<EventRuleActionsUrgencyRadioType[]>(() => [
        { label: i18n.t('ALERT_MANAGER.EVENT_RULE.HIGH'), name: EVENT_RULE_URGENCY.HIGH },
        { label: i18n.t('ALERT_MANAGER.EVENT_RULE.LOW'), name: EVENT_RULE_URGENCY.LOW },
    ]),
    selectedActions: {} as EventRuleActionsType,
    selectedServiceId: storeState.service.service_id,
    selectedAssetList: [],
    selectedStatusRadio: ALERT_STATUS.IGNORED,
    selectedUrgencyRadio: EVENT_RULE_URGENCY.HIGH,
    escalationPolicyDropdownList: [] as SelectDropdownMenuItem[],
    selectedEscalationPolicyId: '',
    labels: [] as InputItem[],
    additionalInfoTags: [{ key: '', value: '' }] as TagItem[],
});

const handleUpdateValue = (action: string, value: boolean) => {
    const _actions = cloneDeep(state.selectedActions);
    if (value) {
        let _value: any;
        if (action === 'change_service') {
            _value = state.selectedServiceId;
        } else if (action === 'match_asset.asset_types') {
            _value = [];
        } else if (action === 'change_status') {
            _value = ALERT_STATUS.IGNORED;
        } else if (action === 'change_urgency') {
            _value = 'NO_SET';
        } else {
            _value = '';
        }
        _actions[action] = _value;

        state.selectedActions = _actions;
        return;
    }
    delete _actions[action];
    state.selectedActions = _actions;
};
const handleSelectAction = (action: string, value: any) => {
    if (action === 'set_labels') {
        state.selectedActions[action] = value.map((item) => item.name);
        return;
    }
    state.selectedActions[action] = value;
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

watch(() => state.additionalInfoTags, (after) => {
    emit('change-form', {
        ...state.selectedActions,
        additional_info: after,
    });
}, { immediate: true });
watch(() => state.selectedActions, (after) => {
    emit('change-form', after);
}, { immediate: true });
watch(() => storeState.service.service_id, (id) => {
    if (!id) return;
    fetchEscalationPolicyList();
}, { immediate: true });
</script>

<template>
    <div class="service-detail-tabs-settings-event-rule-action-form">
        <div v-for="(type, idx) in Object.values(state.actionSettingType)"
             :key="`action-setting-type-${idx}`"
             class="action-wrapper flex flex-col gap-2 p-3 border-t-4 border-b-4 border-gray-100 rounded-xl"
        >
            <p-field-title :label="type"
                           size="lg"
                           required
                           class="field-title"
            />
            <div class="flex flex-col pr-3 pl-3">
                <p-field-group v-for="(action, actionIdx) in state.actions[Object.keys(state.actionSettingType)[idx]]"
                               :key="`action-${actionIdx}`"
                               class="field-group flex items-start w-full"
                >
                    <div class="toggle-wrapper flex items-center gap-2 mr-2">
                        <p-toggle-button :value="!!state.selectedActions[action.name]"
                                         @update:value="handleUpdateValue(action.name, $event)"
                        />
                        <p-field-title font-weight="regular">
                            {{ action.label }}
                        </p-field-title>
                    </div>
                    <div v-if="state.selectedActions[action.name] !== undefined"
                         class="input-wrapper"
                    >
                        <div v-if="action.name === 'change_service'"
                             class="flex flex-col gap-1"
                        >
                            <p-select-dropdown :menu="storeState.serviceDropdownList"
                                               use-fixed-menu-style
                                               block
                                               show-delete-all-button
                                               :selected.sync="state.selectedServiceId"
                                               @update:selected="handleSelectAction(action.name, $event)"
                            />
                            <p class="text-label-md pl-1">
                                <span class="text-gray-500">{{ $t('ALERT_MANAGER.EVENT_RULE.CURRENT_SERVICE') }}</span>
                                <p-link action-icon="internal-link"
                                        new-tab
                                        highlight
                                        :to="{
                                            name: ALERT_MANAGER_ROUTE.SERVICE.DETAIL._NAME,
                                            params: {
                                                serviceId: storeState.service.service_id,
                                            },
                                        }"
                                >
                                    {{ storeState.service.name }}
                                </p-link>
                            </p>
                        </div>
                        <p-select-dropdown v-if="action.name === 'match_asset.asset_types'"
                                           :menu="storeState.cloudServiceTypeDropdownList"
                                           use-fixed-menu-style
                                           block
                                           class="asset-dropdown"
                                           multi-selectable
                                           show-delete-all-button
                                           :selected.sync="state.selectedAssetList"
                                           @update:selected="handleSelectAction(action.name, $event)"
                        >
                            <template #dropdown-button>
                                <div v-if="state.selectedActions[action.name].length > 0"
                                     class="dropdown-button-wrapper flex gap-1"
                                >
                                    <p class="flex-1 truncate">
                                        <span v-for="(asset, assetIdx) in state.selectedActions[action.name]"
                                              :key="`selected-asset-${assetIdx}`"
                                        >
                                            {{ asset.label }}
                                        </span>
                                    </p>
                                    <p-badge v-if="state.selectedActions[action.name].length > 1"
                                             style-type="blue200"
                                             badge-type="subtle"
                                    >
                                        + {{ state.selectedActions[action.name].length - 1 }}
                                    </p-badge>
                                </div>
                                <span v-else
                                      class="text-gray-600"
                                >{{ $t('ALERT_MANAGER.EVENT_RULE.SELECT') }}</span>
                            </template>
                        </p-select-dropdown>
                        <p-text-input v-if="action.name === 'change_title'"
                                      block
                                      :value="state.selectedActions[action.name]"
                                      @update:value="handleSelectAction(action.name, $event)"
                        />
                        <div v-if="action.name === 'change_status'"
                             class="field-title flex gap-2"
                        >
                            <p-radio-group>
                                <p-radio v-for="(item, statusIdx) in state.statusRadioMenuList"
                                         :key="`change-status-${statusIdx}`"
                                         v-model="state.selectedStatusRadio"
                                         :value="item.name"
                                         @change="handleSelectAction(action.name, $event)"
                                >
                                    <span class="radio-item">
                                        {{ item.label }}
                                    </span>
                                </p-radio>
                            </p-radio-group>
                            <p v-if="state.selectedStatusRadio === ALERT_STATUS.IGNORED"
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
                                     @change="handleSelectAction(action.name, $event)"
                            >
                                <span class="radio-item">
                                    {{ item.label }}
                                </span>
                            </p-radio>
                        </p-radio-group>
                    </div>
                </p-field-group>
                <div v-if="idx === 2"
                     class="mt-3"
                >
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
                    <div class="pl-3">
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
                                <p-select-dropdown v-if="item.name === 'change_escalation_policy'"
                                                   :menu="state.escalationPolicyDropdownList"
                                                   use-fixed-menu-style
                                                   block
                                                   show-delete-all-button
                                                   :selected.sync="state.selectedEscalationPolicyId"
                                                   @update:selected="handleSelectAction(item.name, $event)"
                                />
                                <p-text-input v-if="item.name === 'set_labels'"
                                              multi-input
                                              appearance-type="stack"
                                              :selected.sync="state.labels"
                                              block
                                              @update:selected="handleSelectAction(item.name, $event)"
                                />
                                <div v-if="item.name === 'additional_info'"
                                     class="flex flex-col gap-3"
                                >
                                    <div v-for="(tag, tagIdx) in state.additionalInfoTags"
                                         :key="`tag-${tagIdx}`"
                                         class="flex gap-2 items-center"
                                    >
                                        <p-field-group class="input-box">
                                            <p-text-input :value="tag.key"
                                                          block
                                                          :placeholder="$t('COMMON.COMPONENTS.TAGS.KEY')"
                                                          @update:value="handleInputTagKey(tagIdx, ...arguments)"
                                            />
                                        </p-field-group>
                                        <p-field-group class="input-box">
                                            <p-text-input :value="tag.value"
                                                          block
                                                          :placeholder="$t('COMMON.COMPONENTS.TAGS.VALUE')"
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
    </div>
</template>

<style scoped lang="postcss">
.service-detail-tabs-settings-event-rule-action-form {
    @apply bg-gray-100;
    .action-wrapper {
        @apply bg-white;
        border-bottom-left-radius: 0.5rem;
        border-bottom-right-radius: 0.5rem;
        &:last-child {
            border-bottom: none;
        }
        &:first-child {
            border-top: none;
        }
        .field-group {
            margin-bottom: 0;
            & + .field-group {
                @apply mt-3 pt-3 border-t border-gray-200;
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
        }
        .asset-dropdown {
            @apply relative;
            .dropdown-button-wrapper {
                @apply absolute;
                max-width: calc(100% - 4.5rem);
            }
        }
        .input-box {
            @apply inline-block flex-1;
            margin-bottom: 0;
        }
    }
}
</style>
