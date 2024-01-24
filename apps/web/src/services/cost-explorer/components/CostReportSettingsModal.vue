<script lang="ts" setup>
import { computed, reactive } from 'vue';

import {
    PButtonModal, PFieldGroup, PSelectDropdown, PBadge, PTextInput, PCheckbox, PI,
} from '@spaceone/design-system';
import type { SelectDropdownMenuItem } from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';

import { i18n } from '@/translations';

import { CURRENCY, CURRENCY_SYMBOL } from '@/store/modules/settings/config';

import { useFormValidator } from '@/common/composables/form-validator';
import { useProxyValue } from '@/common/composables/proxy-state';


interface Props {
    visible: boolean;
}
const props = withDefaults(defineProps<Props>(), {
    visible: false,
});
const emit = defineEmits<{(e: 'update:visible', value: boolean): void;
    (e: 'confirm'): void;
}>();
const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    selectedCurrency: 'KRW',
    enableLastDay: false,
    currencyMenuItems: computed<SelectDropdownMenuItem[]>(() => Object.values(CURRENCY).map((currency) => ({
        name: currency,
        label: `${CURRENCY_SYMBOL[currency]} ${currency}`,
    }))),
    nextReportDate: computed(() => '2023-08-10'),
});
const {
    forms: { issueDate },
    setForm,
    invalidState,
    invalidTexts,
    isAllValid,
} = useFormValidator({
    issueDate: undefined,
}, {
    issueDate(value: number) {
        if (state.enableLastDay) return true;
        if (!value) return i18n.t('BILLING.COST_MANAGEMENT.COST_REPORT.REQUIRED_FIELD');
        if (value < 1) return i18n.t('BILLING.COST_MANAGEMENT.COST_REPORT.GREATER_THAN_OR_EQUAL_TO_1');
        if (value > 31) return i18n.t('BILLING.COST_MANAGEMENT.COST_REPORT.LESS_THAN_OR_EQUAL_TO_31');
        return true;
    },
});

/* Event */
const handleChangeEnableLastDay = () => {
    state.enableLastDay = !state.enableLastDay;
    if (state.enableLastDay) {
        setForm('issueDate', undefined);
    }
};
const handleConfirm = () => {
    // TODO
    state.proxyVisible = false;
};
</script>

<template>
    <p-button-modal :visible.sync="state.proxyVisible"
                    :header-title="$t('BILLING.COST_MANAGEMENT.COST_REPORT.REPORT_SETTINGS')"
                    :disabled="!isAllValid"
                    size="sm"
                    @confirm="handleConfirm"
    >
        <template #body>
            <div class="modal-content-wrapper">
                <p-field-group :label="$t('BILLING.COST_MANAGEMENT.COST_REPORT.CURRENCY')"
                               required
                >
                    <p-select-dropdown :menu="state.currencyMenuItems"
                                       :selected="state.selectedCurrency"
                                       :required="true"
                                       class="input-field"
                                       use-fixed-menu-style
                    >
                        <template #menu-item--format="{item}">
                            <div class="menu-item">
                                <span>{{ item?.label }}</span>
                                <p-badge v-if="item.name === CURRENCY.USD"
                                         class="ml-1"
                                         badge-type="subtle"
                                         style-type="indigo100"
                                >
                                    Default
                                </p-badge>
                            </div>
                        </template>
                    </p-select-dropdown>
                </p-field-group>
                <p-field-group :label="$t('BILLING.COST_MANAGEMENT.COST_REPORT.ISSUE_DATE')"
                               :invalid="invalidState.issueDate"
                               :invalid-text="invalidTexts.issueDate"
                               required
                >
                    <template #default="{invalid}">
                        <p-text-input :value="issueDate"
                                      :invalid="invalid"
                                      :disabled="state.enableLastDay"
                                      type="number"
                                      class="input-field"
                                      @update:value="setForm('issueDate', $event)"
                        />
                        <p-checkbox class="checkbox"
                                    :value="true"
                                    :selected="state.enableLastDay"
                                    @change="handleChangeEnableLastDay"
                        >
                            {{ $t('BILLING.COST_MANAGEMENT.COST_REPORT.LAST_DAY_OF_THE_MONTH') }}
                        </p-checkbox>
                    </template>
                </p-field-group>
                <div class="description-box">
                    <p class="title">
                        <p-i name="ic_roket"
                             width="1rem"
                             height="1rem"
                             color="inherit"
                        />
                        {{ $t('BILLING.COST_MANAGEMENT.COST_REPORT.UPCOMING_REPORT_DATE') }}
                    </p>
                    <p class="text">
                        {{ state.nextReportDate }}
                    </p>
                </div>
            </div>
        </template>
        <template #confirm-button>
            <span>{{ $t('BILLING.COST_MANAGEMENT.COST_REPORT.SAVE') }}</span>
        </template>
    </p-button-modal>
</template>

<style lang="scss" scoped>
.input-field {
    width: 10rem;
}

/* custom design-system component - p-text-input */
:deep(.p-text-input) {
    .input-container {
        .tag-container {
            width: 90%;
        }
    }
}
.checkbox {
    padding-left: 0.5rem;
}
.description-box {
    @apply bg-violet-200 rounded-md;
    padding: 0.5rem 1rem;
    .title {
        @apply text-label-lg text-violet-700;
        font-weight: 700;
        padding-bottom: 0.25rem;
    }
    .text {
        @apply text-paragraph-md;
    }
}
</style>
