<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PFieldGroup, PTextInput, PSelectDropdown, PButton, PBoardItem, PBadge, PLink,
} from '@cloudforet/mirinae';


import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProviderReferenceMap } from '@/store/reference/provider-reference-store';

import { useFormValidator } from '@/common/composables/form-validator';
import { useProxyValue } from '@/common/composables/proxy-state';

import {
    CONFIGURATION_CATEGORY_MENU, MANAGED_POLICY_MENU,
} from '@/services/cost-explorer/constants/anomaly-detection-constant';

interface Props {
    isDetailPage: boolean;
    isEdit: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    isDetailPage: false,
    isEdit: false,
});

const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;

const emit = defineEmits<{(event: 'is-edit'): void;
}>();

const storeState = reactive({
    providers: computed<ProviderReferenceMap>(() => allReferenceGetters.provider),
});
const state = reactive({
    providerList: computed(() => [
        ...Object.keys(storeState.providers).map((k) => ({
            label: storeState.providers[k].name,
            name: k,
        })),
    ]),
    selectedRules: undefined,
    proxyIsEdit: useProxyValue('isEdit', props, emit),
});

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
    name(value) {
        if (!value) return i18n.t('BILLING.COST_MANAGEMENT.ANOMALY_DETECTION.CONFIG.NAME_REQUIRED');
        return true;
    },
});

// HACK: type check
const handleClickBoardItem = (item) => {
    state.selectedRules = item;
};
</script>

<template>
    <div class="anomaly-detection-configuration-information-form">
        <div>
            <p-field-group :label="$t('BILLING.COST_MANAGEMENT.ANOMALY_DETECTION.CONFIG.COL_NAME')"
                           required
                           :invalid="invalidState.name"
                           :invalid-text="invalidTexts.name"
                           class="field"
            >
                <p-text-input :value="name"
                              block
                              :placeholder="$t('BILLING.COST_MANAGEMENT.ANOMALY_DETECTION.CONFIG.COL_NAME_PLACEHOLDER')"
                              :invalid="invalidState.name"
                              @update:value="setForm('name', $event)"
                />
            </p-field-group>
            <p-field-group :label="$t('BILLING.COST_MANAGEMENT.ANOMALY_DETECTION.CONFIG.COL_POLICY')"
                           required
                           class="field board-field"
            >
                <div class="policy-wrapper board">
                    <p-board-item v-for="(item, idx) in MANAGED_POLICY_MENU"
                                  :key="idx"
                                  class="policy-board-item board"
                                  @click="handleClickBoardItem(item)"
                    >
                        <template #content>
                            <div class="contents-wrapper">
                                <div class="contents">
                                    <strong class="title">{{ item.label }}</strong>
                                    <p-badge shape="square"
                                             :style-type="item.rules.length > 0 ? 'gray900' : 'red100'"
                                             :badge-type="item.rules.length > 0 ? 'solid-outline' : 'subtle'"
                                             class="badge"
                                    >
                                        <span v-if="item.rules.length === 0">{{ $t('BILLING.COST_MANAGEMENT.ANOMALY_DETECTION.CONFIG.NO_RULES') }}</span>
                                        <p v-else>
                                            <span>{{ item.rules.length }}</span>
                                            <span> {{
                                                item.rules.length === 1
                                                    ? $t('BILLING.COST_MANAGEMENT.ANOMALY_DETECTION.CONFIG.RULE')
                                                    : $t('BILLING.COST_MANAGEMENT.ANOMALY_DETECTION.CONFIG.RULES')
                                            }}
                                            </span>
                                        </p>
                                    </p-badge>
                                    <p>
                                        <span class="rule-text">{{ item.rules[0] }}</span>
                                        <span v-if="item.rules.length > 1">{{ $t('BILLING.COST_MANAGEMENT.ANOMALY_DETECTION.CONFIG.AND_MORE') }}</span>
                                    </p>
                                </div>
                                <p-link action-icon="internal-link"
                                        new-tab
                                        highlight
                                        :to="{}"
                                        class="view-history"
                                >
                                    {{ $t('BILLING.COST_MANAGEMENT.ANOMALY_DETECTION.CONFIG.VIEW_POLICY') }}
                                </p-link>
                            </div>
                        </template>
                    </p-board-item>
                </div>
            </p-field-group>
            <p-field-group :label="$t('BILLING.COST_MANAGEMENT.ANOMALY_DETECTION.CONFIG.COL_DATA_SOURCE')"
                           required
                           class="field"
            >
                <p-select-dropdown class="select-options-dropdown"
                                   :menu="state.providerList"
                                   :placeholder="$t('BILLING.COST_MANAGEMENT.ANOMALY_DETECTION.CONFIG.COL_DATASOURCE_PLACEHOLDER')"
                />
            </p-field-group>
            <div class="category-wrapper field">
                <p-field-group :label="$t('BILLING.COST_MANAGEMENT.ANOMALY_DETECTION.CONFIG.COL_CATEGORY')"
                               required
                >
                    <p-select-dropdown class="select-options-dropdown"
                                       :menu="CONFIGURATION_CATEGORY_MENU"
                                       :placeholder="$t('BILLING.COST_MANAGEMENT.ANOMALY_DETECTION.CONFIG.COL_CATEGORY_PLACEHOLDER')"
                    />
                </p-field-group>
                <p-field-group :label="$t('BILLING.COST_MANAGEMENT.ANOMALY_DETECTION.CONFIG.COL_ITEM')"
                               required
                               class="col-item"
                >
                    <p-select-dropdown class="select-options-dropdown"
                                       :menu="CONFIGURATION_CATEGORY_MENU"
                                       :placeholder="$t('BILLING.COST_MANAGEMENT.ANOMALY_DETECTION.CONFIG.COL_ITEM_PLACEHOLDER')"
                    />
                </p-field-group>
            </div>
        </div>
        <div v-if="props.isDetailPage"
             class="buttons-wrapper"
        >
            <p-button style-type="tertiary"
                      size="md"
                      @click="state.proxyIsEdit = false"
            >
                {{ $t('BILLING.COST_MANAGEMENT.ANOMALY_DETECTION.CANCEL') }}
            </p-button>
            <p-button style-type="primary"
                      size="md"
            >
                {{ $t('BILLING.COST_MANAGEMENT.ANOMALY_DETECTION.SAVE_CHANGES') }}
            </p-button>
        </div>
    </div>
</template>

<style scoped lang="postcss">
.anomaly-detection-configuration-information-form {
    padding-right: 1rem;
    padding-bottom: 1.5rem;
    padding-left: 1rem;
    .field {
        margin-top: 0.5rem;
        &:not(.board-field) {
            max-width: 30rem;
        }
        .select-options-dropdown {
            @apply block w-full;
        }
    }
    .category-wrapper {
        @apply flex;
        gap: 1rem;
        .col-item {
            flex: 1;
        }
    }
    .buttons-wrapper {
        @apply inline-flex;
        margin-top: 1rem;
        margin-bottom: 1rem;
        gap: 0.5rem;
    }
    .board {
        @apply border border-gray-200;
        padding: 1rem;
        border-radius: 0.375rem;
    }
    .policy-wrapper {
        @apply flex flex-col;
        width: 100%;
        gap: 0.5rem;
        .policy-board-item {
            @apply text-label-sm border border-gray-200;
            max-width: 40rem;
            padding: 1rem;
            border-radius: 0.375rem;
            .contents-wrapper {
                @apply flex;
                .contents {
                    @apply flex flex-col;
                    flex: 1;
                    gap: 0.125rem;
                    .title {
                        @apply text-label-md;
                    }
                    .badge {
                        margin-top: 0.375rem;
                    }
                }
                .view-history {
                    @apply flex items-center justify-center;
                }
            }
        }
    }
}
</style>
