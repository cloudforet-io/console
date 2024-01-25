<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';

import {
    PButtonModal, PFieldGroup, PSelectDropdown, PBadge, PTextInput, PCheckbox, PI,
} from '@spaceone/design-system';
import type { SelectDropdownMenuItem } from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';
import dayjs from 'dayjs';

import { i18n } from '@/translations';

import { CURRENCY, CURRENCY_SYMBOL } from '@/store/modules/settings/config';

import { useFormValidator } from '@/common/composables/form-validator';
import { useProxyValue } from '@/common/composables/proxy-state';

import { useCostReportPageStore } from '@/services/cost-explorer/stores/cost-report-page-store';


interface Props {
    visible: boolean;
}
const props = withDefaults(defineProps<Props>(), {
    visible: false,
});
const emit = defineEmits<{(e: 'update:visible', value: boolean): void;
    (e: 'confirm'): void;
}>();
const costReportPageStore = useCostReportPageStore();
const costReportPageState = costReportPageStore.state;
const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    selectedCurrency: 'KRW',
    enableLastDay: false,
    currencyMenuItems: computed<SelectDropdownMenuItem[]>(() => Object.values(CURRENCY).map((currency) => ({
        name: currency,
        label: `${CURRENCY_SYMBOL[currency]} ${currency}`,
    }))),
    upcomingIssueDateText: computed<string>(() => {
        const today = dayjs.utc();
        const _issueDay: number = state.enableLastDay ? today.endOf('month').date() : issueDay.value ?? 10;
        if (Number(today.format('D')) < _issueDay) {
            return today.date(_issueDay).format('YYYY-MM-DD');
        }
        if (state.enableLastDay) return today.add(1, 'month').endOf('month').format('YYYY-MM-DD');
        return today.add(1, 'month').date(_issueDay).format('YYYY-MM-DD');
    }),
});
const {
    forms: { issueDay },
    setForm,
    invalidState,
    invalidTexts,
    isAllValid,
} = useFormValidator({
    issueDay: undefined as number | undefined,
}, {
    issueDay(value: number) {
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
        const today = dayjs.utc();
        if (today.isSame(today.endOf('month'), 'day')) {
            setForm('issueDay', today.add(1, 'month').endOf('month').date());
        } else {
            setForm('issueDay', today.endOf('month').date());
        }
    }
};
const handleConfirm = () => {
    // TODO
    state.proxyVisible = false;
};

/* Watcher */
watch(() => props.visible, (visible) => {
    if (visible && costReportPageState.costReportConfig) {
        state.selectedCurrency = costReportPageState.costReportConfig?.currency;
        state.enableLastDay = costReportPageState.costReportConfig?.is_last_day;
        setForm('issueDay', costReportPageState.costReportConfig?.issue_day);
    }
});
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
                <p-field-group :label="$t('BILLING.COST_MANAGEMENT.COST_REPORT.ISSUE_DAY')"
                               :invalid="invalidState.issueDay"
                               :invalid-text="invalidTexts.issueDay"
                               required
                >
                    <template #default="{invalid}">
                        <p-text-input :value="issueDay"
                                      :invalid="invalid"
                                      :disabled="state.enableLastDay"
                                      type="number"
                                      class="input-field"
                                      @update:value="setForm('issueDay', $event)"
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
                        {{ $t('BILLING.COST_MANAGEMENT.COST_REPORT.UPCOMING_ISSUE_DATE') }}
                    </p>
                    <p class="text">
                        {{ state.upcomingIssueDateText }}
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
