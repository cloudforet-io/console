<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import {
    PFieldGroup,
    PFieldTitle,
    PI,
    PRadio,
    PRadioGroup,
    PBadge,
    PSelectDropdown, PTextInput,
    PToggleButton,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import type { EventRuleModel } from '@/schema/alert-manager/event-rule/model';
import type {
    EventRuleActionsType,
} from '@/schema/alert-manager/event-rule/type';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CloudServiceTypeReferenceMap } from '@/store/reference/cloud-service-type-reference-store';


import { gray } from '@/styles/colors';

import { useServiceDetailPageStore } from '@/services/alert-manager/stores/service-detail-page-store';
import type {
    EventRuleActionsToggleType,
    EventRuleActionsTempAssetRadioType,
} from '@/services/alert-manager/types/alert-manager-type';

const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;
const serviceDetailPageStore = useServiceDetailPageStore();
const serviceDetailPageState = serviceDetailPageStore.state;

const emit = defineEmits<{(e: 'change-form', form: EventRuleActionsType): void}>();

const storeState = reactive({
    cloudServiceType: computed<CloudServiceTypeReferenceMap>(() => allReferenceGetters.cloudServiceType),
    isEventRuleEditMode: computed<boolean>(() => serviceDetailPageState.isEventRuleEditMode),
    eventRuleInfo: computed<EventRuleModel>(() => serviceDetailPageState.eventRuleInfo),
    cloudServiceTypeDropdownList: computed<SelectDropdownMenuItem[]>(() => Object.values(allReferenceGetters.cloudServiceType).map((i) => ({
        name: i.key,
        label: i.label,
    }))),
});
const state = reactive({
    actions: computed<EventRuleActionsToggleType[]>(() => ([
        {
            label: i18n.t('ALERT_MANAGER.EVENT_RULE.MATCH_ASSET'),
            name: 'match_asset',
        },
        {
            label: i18n.t('ALERT_MANAGER.EVENT_RULE.MERGE_ASSET_LABELS'),
            name: 'merge_asset_labels',
        },
    ])),
    tempAssetRadioMenuList: computed<EventRuleActionsTempAssetRadioType[]>(() => [
        { label: i18n.t('ALERT_MANAGER.CREATE'), name: 'CREATE' },
        { label: i18n.t('ALERT_MANAGER.EVENT_RULE.DO_NOT_CREATE'), name: 'DO_NOT_CREATE' },
    ]),
    selectedActions: {
        match_asset: false,
        merge_asset_labels: false,
    },
    rule: { source: 'resource', target: 'resource.resource_id' },
    selectedAssetList: [] as SelectDropdownMenuItem[],
    selectedTempAssetRadio: 'CREATE',
    period: 10,
});

const updateStateFromEventRuleInfo = (): void => {
    const actions = storeState.eventRuleInfo.actions;
    if (!actions) return;

    if (actions.match_asset) {
        state.selectedActions.match_asset = true;
        state.rule = {
            source: actions.match_asset?.rule?.source || '',
            target: actions.match_asset?.rule?.target || '',
        };
        state.selectedAssetList = (actions.match_asset?.asset_types || []).map((type) => ({
            name: type,
            label: storeState.cloudServiceType[type]?.label || '',
        }));
        state.selectedTempAssetRadio = actions.match_asset.create_temporary_asset ? 'CREATE' : 'DO_NOT_CREATE';
    }
    if (actions.merge_asset_labels) {
        state.selectedActions.merge_asset_labels = true;
        state.period = Number(actions.merge_asset_labels.period);
    }
};
const handleUpdateToggle = (action: string, value: boolean) => {
    state.selectedActions[action] = value;
    if (value) {
        if (action === 'match_asset') {
            state.rule = { source: 'resource', target: 'resource.resource_id' };
            state.selectedAssetList = [];
            state.selectedTempAssetRadio = 'CREATE';
        }
        if (action === 'merge_asset_labels') {
            state.period = 10;
        }
    }
};

watch([
    () => state.selectedActions, () => state.rule, () => state.selectedAssetList, () => state.selectedTempAssetRadio, () => state.period,
], ([selectedActions, rule, assetList, tempAsset, period]) => {
    emit('change-form', {
        match_asset: selectedActions.match_asset ? {
            rule,
            asset_types: assetList?.map((asset) => asset.name),
            create_temporary_asset: tempAsset === 'CREATE',
        } : undefined,
        merge_asset_labels: selectedActions.merge_asset_labels ? {
            period,
        } : undefined,
    });
}, { deep: true });
watch(() => storeState.isEventRuleEditMode, (isEditMode) => {
    if (isEditMode) {
        updateStateFromEventRuleInfo();
    } else {
        state.selectedActions = {
            match_asset: false,
            merge_asset_labels: false,
        };
    }
}, { immediate: true });
</script>

<template>
    <div class="service-detail-tabs-settings-event-rule-action-asset-form">
        <p-field-title :label="$t('ALERT_MANAGER.EVENT_RULE.ASSET_SETTINGS')"
                       size="lg"
                       required
                       class="field-title"
        />
        <div class="flex flex-col pr-3 pl-3">
            <p-field-group v-for="(action, actionIdx) in state.actions"
                           :key="`action-${actionIdx}`"
                           class="field-group flex flex-col"
            >
                <div class="flex flex-col w-full">
                    <div class="toggle-wrapper flex items-center gap-2 mr-2"
                         :class="{'match-asset': action.name === 'match_asset'}"
                    >
                        <p-toggle-button :value="state.selectedActions[action.name]"
                                         @update:value="handleUpdateToggle(action.name, $event)"
                        />
                        <p-field-title font-weight="regular">
                            {{ action.label }}
                        </p-field-title>
                    </div>
                    <div v-if="state.selectedActions[action.name]">
                        <div v-if="action.name === 'match_asset'">
                            <div class="field-group flex items-center mt-3">
                                <p-field-title font-weight="regular"
                                               class="field-title toggle-wrapper"
                                >
                                    {{ $t('ALERT_MANAGER.EVENT_RULE.ASSET_TYPE') }}
                                </p-field-title>
                                <p-select-dropdown :menu="storeState.cloudServiceTypeDropdownList"
                                                   use-fixed-menu-style
                                                   block
                                                   class="asset-dropdown"
                                                   multi-selectable
                                                   show-delete-all-button
                                                   :selected.sync="state.selectedAssetList"
                                >
                                    <template #dropdown-button>
                                        <div v-if="state.selectedAssetList.length > 0"
                                             class="dropdown-button-wrapper flex gap-1"
                                        >
                                            <p class="flex-1 truncate">
                                                <span v-for="(asset, assetIdx) in state.selectedAssetList"
                                                      :key="`selected-asset-${assetIdx}`"
                                                >
                                                    {{ asset.label }}
                                                    <span v-if="assetIdx !== state.selectedAssetList.length - 1">, </span>
                                                </span>
                                            </p>
                                            <p-badge v-if="state.selectedAssetList.length > 1"
                                                     style-type="blue200"
                                                     badge-type="subtle"
                                            >
                                                + {{ state.selectedAssetList.length - 1 }}
                                            </p-badge>
                                        </div>
                                        <span v-else
                                              class="text-gray-600"
                                        >{{ $t('ALERT_MANAGER.EVENT_RULE.SELECT') }}</span>
                                    </template>
                                </p-select-dropdown>
                            </div>
                            <div class="field-group flex items-center">
                                <p-field-title font-weight="regular"
                                               class="field-title toggle-wrapper"
                                >
                                    {{ $t('ALERT_MANAGER.EVENT_RULE.POLICY') }}
                                </p-field-title>
                                <div class="flex flex-1 gap-2 items-center">
                                    <p-field-group class="input-box">
                                        <p-text-input v-model="state.rule.source"
                                                      block
                                        />
                                    </p-field-group>
                                    <p-field-group class="input-box">
                                        <p-text-input v-model="state.rule.target"
                                                      block
                                        />
                                    </p-field-group>
                                </div>
                            </div>
                            <div class="field-group flex items-center">
                                <p-field-title font-weight="regular"
                                               class="field-title toggle-wrapper"
                                >
                                    {{ $t('ALERT_MANAGER.EVENT_RULE.TEMP_ASSET') }}
                                    <span class="text-gray-500">({{ $t('ALERT_MANAGER.EVENT_RULE.OPTIONAL') }})</span>
                                </p-field-title>
                                <div class="flex-1 flex items-center">
                                    <p-radio-group class="flex-1">
                                        <p-radio v-for="(item, statusIdx) in state.tempAssetRadioMenuList"
                                                 :key="`change-temp-asset-${statusIdx}`"
                                                 v-model="state.selectedTempAssetRadio"
                                                 :value="item.name"
                                        >
                                            <span class="radio-item">
                                                {{ item.label }}
                                            </span>
                                        </p-radio>
                                    </p-radio-group>
                                    <p class="flex-1 flex items-center gap-1 text-gray-500 text-label-sm">
                                        <p-i name="ic_warning-filled"
                                             width="1rem"
                                             height="1rem"
                                             :color="gray[500]"
                                        />
                                        <span>{{ $t('ALERT_MANAGER.EVENT_RULE.TEMP_ASSET_DESC') }}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div v-if="action.name === 'merge_asset_labels'"
                             class="field-group flex items-center pt-3"
                        >
                            <p-field-title font-weight="regular"
                                           class="field-title toggle-wrapper"
                            >
                                {{ $t('ALERT_MANAGER.EVENT_RULE.LABEL_PERIOD') }}
                            </p-field-title>
                            <div class="flex items-center flex-1 gap-3">
                                <p-field-group class="input-box">
                                    <p-text-input v-model="state.period"
                                                  type="number"
                                                  block
                                                  :min="0"
                                                  :max="1440"
                                                  class="merge-asset-labels"
                                    >
                                        <template #right-edge>
                                            <span class="unit">{{ $t('ALERT_MANAGER.EVENT_RULE.MINUTE') }}</span>
                                        </template>
                                    </p-text-input>
                                </p-field-group>
                                <p class="inline-flex items-center gap-1 px-1 text-label-sm text-gray-500">
                                    <p-i name="ic_info-circle"
                                         width="1rem"
                                         height="1rem"
                                         :color="gray[500]"
                                    />
                                    <span>{{ $t('ALERT_MANAGER.EVENT_RULE.MIN') }} 0 ~ {{ $t('ALERT_MANAGER.EVENT_RULE.MAX') }} 1440</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </p-field-group>
        </div>
    </div>
</template>

<style scoped lang="postcss">
.service-detail-tabs-settings-event-rule-action-asset-form {
    .field-title {
        padding-top: 0.375rem;
        padding-bottom: 0.375rem;
    }
    .field-group {
        margin-bottom: 0;
        & + .field-group {
            @apply mt-3 pt-3 border-t border-gray-200;
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
            .merge-asset-labels {
                .unit {
                    @apply text-label-md text-gray-400;
                    margin-top: -0.125rem;
                    line-height: 1rem;
                }
            }
        }
    }
    .toggle-wrapper {
        min-width: 12.5rem;
        height: 2rem;
    }
}
</style>
