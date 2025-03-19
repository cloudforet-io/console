<script setup lang="ts">
import { useWindowSize } from '@vueuse/core';
import { computed, reactive, watch } from 'vue';

import {
    PFieldGroup,
    PFieldTitle,
    PI,
    PRadio,
    PRadioGroup,
    PBadge,
    PSelectDropdown, PTextInput,
    PToggleButton, screens,
    PButton,
} from '@cloudforet/mirinae';

import type { EventRuleModel } from '@/schema/alert-manager/event-rule/model';
import type {
    EventRuleActionsType,
} from '@/schema/alert-manager/event-rule/type';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CloudServiceTypeReferenceMap } from '@/store/reference/cloud-service-type-reference-store';
import type { ProviderReferenceMap } from '@/store/reference/provider-reference-store';

import DataSelector from '@/common/components/select/DataSelector.vue';
import type { DataSelectorItem } from '@/common/components/select/type';

import { gray } from '@/styles/colors';

import { useServiceDetailPageStore } from '@/services/alert-manager/v2/stores/service-detail-page-store';
import type {
    EventRuleActionsToggleType,
    EventRuleActionsTempAssetRadioType,
} from '@/services/alert-manager/v2/types/alert-manager-type';

const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;
const serviceDetailPageStore = useServiceDetailPageStore();
const serviceDetailPageState = serviceDetailPageStore.state;

const { width } = useWindowSize();

const emit = defineEmits<{(e: 'change-form', form: EventRuleActionsType): void}>();

const storeState = reactive({
    cloudServiceType: computed<CloudServiceTypeReferenceMap>(() => allReferenceGetters.cloudServiceType),
    provider: computed<ProviderReferenceMap>(() => allReferenceGetters.provider),
    isEventRuleEditMode: computed<boolean>(() => serviceDetailPageState.isEventRuleEditMode),
    eventRuleInfo: computed<EventRuleModel>(() => serviceDetailPageState.eventRuleInfo),
});
const state = reactive({
    isMobileSize: computed<boolean>(() => width.value < screens.mobile.max),
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
    providerDropdownList: computed<DataSelectorItem[]|undefined>(() => Object.values(allReferenceGetters.provider).map((i) => ({
        name: i.key,
        label: i.label,
        imageUrl: i.icon,
        data: i.data,
    }))),
    cloudServiceTypeDropdownList: computed<DataSelectorItem[]|undefined>(() => {
        if (!state.selectedProvider.length) return [];
        const _types = Object.values(allReferenceGetters.cloudServiceType).map((i) => ({
            name: i.key,
            label: i.label,
            data: i.data,
        }));
        return state.selectedProvider[0]?.name ? _types.filter((i) => i.data.provider === state.selectedProvider[0].name) : _types;
    }),
    visibleAssetDropdownMenu: false,
    selectedActions: {
        match_asset: false,
        merge_asset_labels: false,
    },
    key: 'resources',
    selectedProvider: [] as DataSelectorItem[],
    selectedAssetList: [] as DataSelectorItem[],
    provider: [] as DataSelectorItem[],
    assetList: [] as DataSelectorItem[],
    selectedTempAssetRadio: 'CREATE',
    period: 10,
});

const updateStateFromEventRuleInfo = (): void => {
    const actions = storeState.eventRuleInfo.actions;
    if (!actions) return;

    if (actions.match_asset) {
        state.selectedActions.match_asset = true;
        state.key = actions.match_asset?.key || 'resources';
        state.selectedTempAssetRadio = actions.match_asset.create_temporary_asset ? 'CREATE' : 'DO_NOT_CREATE';
        const assetTypes = actions.match_asset?.asset_types || [];
        const provider = storeState.cloudServiceType[assetTypes[0]]?.data?.provider;
        state.selectedProvider = [
            {
                name: storeState.provider[provider]?.key,
                label: storeState.provider[provider]?.label,
            },
        ];
        state.selectedAssetList = assetTypes.map((type) => ({
            name: type,
            label: storeState.cloudServiceType[type]?.label || '',
        }));
    }
    if (actions.merge_asset_labels) {
        state.selectedActions.merge_asset_labels = true;
        state.period = Number(actions.merge_asset_labels.period);
    }
};

const handleSelectProvider = (provider: DataSelectorItem[]) => {
    if (!provider.length) return;
    state.selectedProvider = provider;
    state.selectedAssetList = [];
};
const handleSelectAsset = (asset: DataSelectorItem[]) => {
    if (!asset.length) return;
    state.selectedAssetList = asset;
};
const handleClickDoneButton = () => {
    state.visibleAssetDropdownMenu = false;
};
const handleUpdateToggle = (action: string, value: boolean) => {
    state.selectedActions[action] = value;
    if (value) {
        if (action === 'match_asset') {
            state.key = 'resources';
            state.selectedProvider = [];
            state.selectedAssetList = [];
            state.selectedTempAssetRadio = 'CREATE';
        }
        if (action === 'merge_asset_labels') {
            state.period = 10;
        }
    }
};

watch([
    () => state.selectedActions, () => state.key, () => state.selectedAssetList, () => state.selectedTempAssetRadio, () => state.period,
], ([selectedActions, key, assetList, tempAsset, period]) => {
    emit('change-form', {
        match_asset: selectedActions.match_asset ? {
            key,
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
    <div class="service-detail-tabs-settings-event-rule-action-asset-form"
         :class="{ 'is-mobile': state.isMobileSize }"
    >
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
                    <div class="toggle-wrapper flex items-center gap-2 mr-2">
                        <p-toggle-button :value="state.selectedActions[action.name]"
                                         @update:value="handleUpdateToggle(action.name, $event)"
                        />
                        <p-field-title font-weight="regular">
                            {{ action.label }}
                        </p-field-title>
                    </div>
                    <div v-if="state.selectedActions[action.name]">
                        <div v-if="action.name === 'match_asset'"
                             class="match-asset-wrapper pr-3 pl-3"
                        >
                            <div class="field-group flex items-center mt-3">
                                <p-field-title font-weight="regular"
                                               class="field-title toggle-wrapper"
                                >
                                    {{ $t('ALERT_MANAGER.EVENT_RULE.ASSET_TYPE') }}
                                </p-field-title>
                                <p-select-dropdown :menu="state.providerDropdownList"
                                                   :visible-menu.sync="state.visibleAssetDropdownMenu"
                                                   use-fixed-menu-style
                                                   block
                                                   class="asset-dropdown"
                                                   multi-selectable
                                                   show-delete-all-button
                                >
                                    <template #menu-menu>
                                        <div class="flex flex-col">
                                            <div class="flex">
                                                <div class="selector">
                                                    <data-selector :label="$t('ALERT_MANAGER.EVENT_RULE.PROVIDER')"
                                                                   :menu="state.providerDropdownList"
                                                                   :selected="state.selectedProvider"
                                                                   @update:selected="handleSelectProvider"
                                                    />
                                                </div>
                                                <div class="selector">
                                                    <data-selector :label="$t('ALERT_MANAGER.EVENT_RULE.ASSET_TYPE')"
                                                                   :menu="state.cloudServiceTypeDropdownList"
                                                                   multi-selectable
                                                                   show-select-marker
                                                                   :selected="state.selectedAssetList"
                                                                   @update:selected="handleSelectAsset"
                                                    />
                                                </div>
                                            </div>
                                            <div class="flex justify-end py-3 px-3 border-t border-gray-200">
                                                <p-button style-type="substitutive"
                                                          @click="handleClickDoneButton"
                                                >
                                                    <span>{{ $t('ALERT_MANAGER.DONE') }}</span>
                                                </p-button>
                                            </div>
                                        </div>
                                    </template>
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
                                <p-field-group class="input-box">
                                    <p-text-input v-model="state.key"
                                                  block
                                                  :style="state.isMobileSize ? 'width: 200px;': ''"
                                    />
                                </p-field-group>
                            </div>
                            <div class="field-group flex items-center">
                                <p-field-title font-weight="regular"
                                               class="field-title toggle-wrapper"
                                >
                                    {{ $t('ALERT_MANAGER.EVENT_RULE.TEMP_ASSET') }}
                                    <span class="text-gray-500">({{ $t('ALERT_MANAGER.EVENT_RULE.OPTIONAL') }})</span>
                                </p-field-title>
                                <div class="temp-asset-group">
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
                                    <p class="temp-asset-desc">
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
                             class="field-group flex items-center pt-3 pr-3 pl-3 merge-asset-wrapper"
                        >
                            <p-field-title font-weight="regular"
                                           class="field-title toggle-wrapper"
                            >
                                {{ $t('ALERT_MANAGER.EVENT_RULE.LABEL_PERIOD') }}
                            </p-field-title>
                            <div class="merge-asset">
                                <p-field-group class="input-box">
                                    <p-text-input v-model="state.period"
                                                  type="number"
                                                  block
                                                  :min="0"
                                                  :max="1440"
                                                  class="merge-asset-labels"
                                                  :style="state.isMobileSize ? 'width: 200px;': ''"
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
    .match-asset-wrapper {
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
        .asset-dropdown {
            @apply relative;
            .dropdown-button-wrapper {
                @apply absolute;
                max-width: calc(100% - 4.5rem);
            }
            .selector {
                @apply flex flex-col flex-1 border-r border-gray-200;
                gap: 0.5rem;
                width: 16rem;
                padding: 0.75rem 0;
                &:last-child {
                    @apply border-r-0;
                }
            }
        }
        .merge-asset {
            @apply flex items-center flex-1 gap-3;
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
    .temp-asset-group {
        @apply flex-1 flex items-center;
        .temp-asset-desc {
            @apply flex-1 flex items-center justify-end gap-1 text-gray-500 text-label-sm;
        }
    }
    &.is-mobile {
        .field-title {
            @apply flex;
            padding-top: 0.375rem;
            padding-bottom: 0.375rem;
        }
        .field-group {
            @apply flex flex-col;
            margin-bottom: 0;
            & + .field-group {
                @apply mt-3 pt-3 border-t border-gray-200;
            }
            .asset-dropdown {
                @apply relative;
                .dropdown-button-wrapper {
                    @apply absolute;
                    width: 100%;
                }
            }
        }
        .toggle-wrapper {
            min-width: 12.5rem;
            height: 2rem;
        }
        .temp-asset-group {
            @apply flex-col items-start;
            .temp-asset-desc {
                @apply mt-2;
            }
        }
        .merge-asset-wrapper {
            @apply items-start;
            .merge-asset {
                @apply flex-col items-start;
            }
        }
    }
}
</style>
