<template>
    <div class="attached-service-account-form">
        <!--        TODO: translation-->
        <p-field-group :label="props.title || $t('Attached Service Account')"
                       :invalid="invalidState.selectedAttachedServiceAccount"
                       :invalid-text="invalidTexts.selectedAttachedServiceAccount"
                       :valid="state.isAttachedServiceAccountValid"
                       :valid-text="$t('Good')"
                       :required="true"
        >
            <p-radio-group class="attached-service-account-radio-group">
                <p-radio v-for="(item) in attachedServiceAccountList"
                         :key="`${item.name}`"
                         :value="item.name"
                         :selected="state.selectedAttachedServiceAccountType"
                         @change="handleChangeAttachedServiceAccountType"
                >
                    {{ item.label }}
                </p-radio>
            </p-radio-group>
            <p-select-dropdown class="attached-service-account-dropdown"
                               :selected="state.selectedAttachedServiceAccountType"
                               :items="attachedServiceAccountList"
                               @update:selected="handleChangeAttachedServiceAccountType"
            />
            <div v-if="state.selectedAttachedServiceAccountType !== 'all'">
                <p-field-title class="specific-service-account-dropdown-label"
                               :label="$t('Specific Service Account')"
                />
                <p-filterable-dropdown class="specific-service-account-dropdown"
                                       :selected="selectedAttachedServiceAccount"
                                       multi-selectable
                                       :menu="state.serviceAccountMenu"
                                       appearance-type="badge"
                                       @update:selected="setForm('selectedAttachedServiceAccount', $event)"
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

import { i18n } from '@/translations';

import { useFormValidator } from '@/common/composables/form-validator';

import { useCollectorFormStore } from '@/services/asset-inventory/store/collector-form-store';

interface Props {
    title?: TranslateResult;
}

const emit = defineEmits([
    'update:isAttachedServiceAccountValid',
]);

const props = defineProps<Props>();
const collectorFormStore = useCollectorFormStore();

const attachedServiceAccountList = [
    {
        label: 'All', // TODO: translation
        name: 'all',
    },
    {
        label: 'Specific Service Account', // TODO: translation
        name: 'specific',
    },
];

const state = reactive({
    selectedAttachedServiceAccountType: 'all',
    serviceAccountMenu: [{ // TODO: need to change to real data
        name: 'f5d14ee6-35b4-409c-973b-ebb0420548b5',
        label: 'Mouse',
        type: 'item',
    },
    {
        name: '82f0bd12-a630-4307-b9a3-d44f867a72d0',
        label: 'vortals',
        type: 'item',
    },
    {
        name: '8845d702-4f89-478e-9227-d90b33c42a60',
        label: 'Lempira',
        type: 'item',
    }],
    isAttachedServiceAccountValid: computed<boolean>(() => {
        if (invalidState.selectedAttachedServiceAccount === undefined || state.selectedAttachedServiceAccountType === 'all') {
            return false;
        }
        return !invalidState.selectedAttachedServiceAccount;
    }),
});

const {
    forms: {
        selectedAttachedServiceAccount,
    },
    setForm,
    invalidState,
    invalidTexts,
    isAllValid,
} = useFormValidator({
    selectedAttachedServiceAccount: [],
}, {
    selectedAttachedServiceAccount(value: string[]|null) {
        if (state.selectedAttachedServiceAccountType !== 'all' && value && value.length) {
            return true;
        }
        if (state.selectedAttachedServiceAccountType !== 'all') {
            return i18n.t('Required field');
        }
        return true;
    },
});

const handleChangeAttachedServiceAccountType = (selectedValue: string) => {
    state.selectedAttachedServiceAccountType = selectedValue;
    if (selectedValue === 'all') {
        collectorFormStore.setAttachedServiceAccount(null);
    } else {
        collectorFormStore.setAttachedServiceAccount(selectedAttachedServiceAccount);
    }
};

watch(() => isAllValid.value, (value) => {
    emit('update:isAttachedServiceAccountValid', value);
}, { immediate: true });

</script>

<style lang="postcss" scoped>
.attached-service-account-form {
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

