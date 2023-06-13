<template>
    <div class="attached-service-account-form">
        <p-field-group :label="props.title || $t('INVENTORY.COLLECTOR.CREATE.ATTACHED_SERVICE_ACCOUNT')"
                       :invalid="invalidState.selectedAttachedServiceAccount"
                       :invalid-text="invalidTexts.selectedAttachedServiceAccount"
                       :valid="state.isAttachedServiceAccountValid"
                       :valid-text="$t('INVENTORY.COLLECTOR.CREATE.ATTACHED_SERVICE_ACCOUNT_VALID')"
                       :required="true"
                       :class="{'margin-on-specific': props.marginOnSpecific && collectorFormState.attachedServiceAccountType === 'specific'}"
        >
            <!-- NOTE: screen desktop size-->
            <p-radio-group class="attached-service-account-radio-group">
                <p-radio v-for="(item) in attachedServiceAccountList"
                         :key="`${item.name}`"
                         :value="item.name"
                         :selected="collectorFormState.attachedServiceAccountType"
                         @change="handleChangeAttachedServiceAccountType"
                >
                    {{ item.label }}
                </p-radio>
            </p-radio-group>
            <!-- NOTE: screen mobile size-->
            <p-select-dropdown class="attached-service-account-dropdown"
                               :selected="collectorFormState.attachedServiceAccountType"
                               :items="attachedServiceAccountList"
                               @update:selected="handleChangeAttachedServiceAccountType"
            />
            <div v-if="collectorFormState.attachedServiceAccountType !== 'all'">
                <p-field-title class="specific-service-account-dropdown-label"
                               :label="$t('INVENTORY.COLLECTOR.CREATE.SPECIFIC_SERVICE_ACCOUNT')"
                />
                <p-filterable-dropdown class="specific-service-account-dropdown"
                                       :selected="selectedAttachedServiceAccount"
                                       multi-selectable
                                       :handler="serviceAccountHandler"
                                       appearance-type="badge"
                                       :reset-selected-on-unmounted="false"
                                       @update:selected="handleSelectAttachedServiceAccount"
                />
            </div>
        </p-field-group>
    </div>
</template>

<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PFieldGroup, PRadioGroup, PRadio, PFilterableDropdown, PSelectDropdown, PFieldTitle,
} from '@spaceone/design-system';
import type { AutocompleteHandler } from '@spaceone/design-system/types/inputs/dropdown/filterable-dropdown/type';

import { QueryHelper } from '@cloudforet/core-lib/query';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { i18n } from '@/translations';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import type {
    AttachedServiceAccount,
    AttachedServiceAccountType,
} from '@/services/asset-inventory/collector/shared/collector-forms/collector-form-store';
import {
    useCollectorFormStore,
} from '@/services/asset-inventory/collector/shared/collector-forms/collector-form-store';



interface Props {
    title?: TranslateResult;
    marginOnSpecific?: boolean;
    resetOnCollectorIdChange?: boolean;
}


const emit = defineEmits<{(e: 'update:isAttachedServiceAccountValid', value: boolean): void;
}>();

const props = defineProps<Props>();
const collectorFormStore = useCollectorFormStore();
const collectorFormState = collectorFormStore.$state;

const attachedServiceAccountList = [
    {
        label: i18n.t('INVENTORY.COLLECTOR.CREATE.ALL'),
        name: 'all',
    },
    {
        label: i18n.t('INVENTORY.COLLECTOR.CREATE.SPECIFIC_SERVICE_ACCOUNT'),
        name: 'specific',
    },
];

const queryHelper = new QueryHelper();
const state = reactive({
    isAttachedServiceAccountValid: computed<boolean>(() => {
        if (invalidState.selectedAttachedServiceAccount === undefined || collectorFormState.attachedServiceAccountType === 'all') {
            return false;
        }
        return !invalidState.selectedAttachedServiceAccount;
    }),
    handlerParams: computed(() => {
        queryHelper.setFilters([]); // init filters
        if (collectorFormStore.collectorProvider) {
            queryHelper.addFilter({ k: 'provider', v: collectorFormStore.collectorProvider, o: '=' });
        }
        return {
            resource_type: 'identity.ServiceAccount',
            options: {
                limit: 10,
                filter: queryHelper.apiQuery.filter,
            },
        };
    }),
});

const serviceAccountHandler: AutocompleteHandler = async (keyword: string) => {
    try {
        const res = await SpaceConnector.client.addOns.autocomplete.resource({
            ...state.handlerParams, search: keyword,
        });
        return {
            results: res.results.map((d) => ({ label: d.name, name: d.key })),
            totalCount: res.total_count,
        };
    } catch (e) {
        ErrorHandler.handleError(e);
        return {
            results: [],
            totalCount: 0,
        };
    }
};

const {
    forms: {
        selectedAttachedServiceAccount,
    },
    setForm,
    invalidState,
    invalidTexts,
    isAllValid,
} = useFormValidator<{selectedAttachedServiceAccount : AttachedServiceAccount}>({
    selectedAttachedServiceAccount: collectorFormState.attachedServiceAccount ?? [],
}, {
    selectedAttachedServiceAccount(value: string[]|null) {
        if (collectorFormState.attachedServiceAccountType !== 'all' && value && value.length) {
            return true;
        }
        if (collectorFormState.attachedServiceAccountType !== 'all') {
            return i18n.t('INVENTORY.COLLECTOR.CREATE.REQUIRED_FIELD');
        }
        return true;
    },
});

const handleChangeAttachedServiceAccountType = (selectedValue: AttachedServiceAccountType) => {
    collectorFormStore.$patch({
        attachedServiceAccountType: selectedValue,
        attachedServiceAccount: [],
    });
};

const handleSelectAttachedServiceAccount = (selectedValue: AttachedServiceAccount) => {
    setForm('selectedAttachedServiceAccount', selectedValue);
    collectorFormStore.$patch({
        attachedServiceAccount: selectedValue,
    });
};

watch(() => isAllValid.value, (value) => {
    emit('update:isAttachedServiceAccountValid', value);
}, { immediate: true });

watch(() => collectorFormStore.collectorId, (collectorId) => {
    if (props.resetOnCollectorIdChange && !collectorId) return;
    collectorFormStore.resetAttachedServiceAccount();
}, { immediate: true });

</script>

<style lang="postcss" scoped>
.attached-service-account-form {
    .margin-on-specific {
        margin-bottom: 15rem;
    }

    .attached-service-account-radio-group {
        display: block;
    }
    .attached-service-account-dropdown {
        width: 100%;
        display: none;
    }

    .specific-service-account-dropdown {
        margin-top: 1rem;
        width: 100%;
    }

    .specific-service-account-dropdown-label {
        display: none;
    }
}

@screen mobile {
    .attached-service-account-form {
        .attached-service-account-radio-group {
            display: none;
        }

        .attached-service-account-dropdown {
            display: block;
        }

        .specific-service-account-dropdown {
            margin-top: 0.3125rem;
            width: 100%;
        }
        .specific-service-account-dropdown-label {
            display: block;
            margin-top: 1rem;
        }
    }
}
</style>

