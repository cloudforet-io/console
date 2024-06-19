<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PFieldGroup, PTextInput, PSelectDropdown, PButton,
} from '@spaceone/design-system';

import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProviderReferenceMap } from '@/store/reference/provider-reference-store';

import { useFormValidator } from '@/common/composables/form-validator';

import {
    CONFIG_POLICY_TEMP_DATA,
    CONFIGURATION_CATEGORY_MENU,
} from '@/services/cost-explorer/constants/anomaly-detection-constant';

interface Props {
    isDetailPage: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    isDetailPage: false,
});

const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;

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
        if (!value) return i18n.t('INVENTORY.ASSET_ANALYSIS.NAME_REQUIRED');
        return true;
    },
});
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
                           class="field"
            >
                <p-select-dropdown class="select-options-dropdown"
                                   :menu="CONFIG_POLICY_TEMP_DATA"
                                   :placeholder="$t('BILLING.COST_MANAGEMENT.ANOMALY_DETECTION.CONFIG.COL_POLICY_PLACEHOLDER')"
                />
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
        max-width: 30rem;
        margin-top: 0.5rem;
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
        margin-top: -0.625rem;
        margin-bottom: 1rem;
        gap: 0.5rem;
    }
}
</style>
