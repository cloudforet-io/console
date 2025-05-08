<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';

import dayjs from 'dayjs';
import map from 'lodash/map';

import {
    PButtonModal, PFieldGroup, PSelectDropdown, PBadge, PTextInput, PCheckbox, PI,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import { useCostReportUpdateMutation } from '@/api-clients/cost-analysis/cost-report-config/composables/mutations/use-cost-report-update-mutation';
import type { CostReportConfigUpdateParameters } from '@/api-clients/cost-analysis/cost-report-config/schema/api-verbs/update';
import { i18n } from '@/translations';

import { CURRENCY, CURRENCY_SYMBOL } from '@/store/display/constant';
import type { Currency } from '@/store/display/type';
import { languages } from '@/store/user/constant';
import type { LanguageCode } from '@/store/user/type';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';
import { useProxyValue } from '@/common/composables/proxy-state';

import { useCostReportConfigQuery } from '@/services/cost-explorer/composables/queries/use-cost-report-config-query';

interface Props {
    visible: boolean;
}
const props = withDefaults(defineProps<Props>(), {
    visible: false,
});
const emit = defineEmits<{(e: 'update:visible', value: boolean): void;
    (e: 'confirm'): void;
}>();

const { costReportConfig } = useCostReportConfigQuery();
const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    selectedCurrency: undefined as undefined|Currency,
    selectedLanguage: undefined as undefined|LanguageCode,
    enableLastDay: false,
    currencyMenuItems: computed<SelectDropdownMenuItem[]>(() => Object.values(CURRENCY).map((currency) => ({
        name: currency,
        label: `${CURRENCY_SYMBOL[currency]} ${currency}`,
    }))),
    languageMenuItems: map(languages, (d, k) => ({
        type: 'item', label: d, name: k,
    })) as SelectDropdownMenuItem[],
    upcomingIssueDateText: computed<string>(() => getUpcomingIssueDate(state.enableLastDay, issueDay.value)),
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
    issueDay(value: number | undefined) {
        if (state.enableLastDay) return true;
        if (!value) return i18n.t('BILLING.COST_MANAGEMENT.COST_REPORT.REQUIRED_FIELD');
        if (value < 1) return i18n.t('BILLING.COST_MANAGEMENT.COST_REPORT.GREATER_THAN_OR_EQUAL_TO_1');
        if (value > 31) return i18n.t('BILLING.COST_MANAGEMENT.COST_REPORT.LESS_THAN_OR_EQUAL_TO_31');
        return true;
    },
});

/* Util */
const getLastDay = (): number => {
    const today = dayjs.utc();
    if (today.isSame(today.endOf('month'), 'day')) {
        return today.add(1, 'month').endOf('month').date();
    }
    return today.endOf('month').date();
};
const getUpcomingIssueDate = (enableLastDay: boolean, _issueDay?: number): string => {
    const today = dayjs.utc();
    const __issueDay: number = enableLastDay ? today.endOf('month').date() : _issueDay ?? 10;

    // 1. case for today(2024-01-15) is before issue day(31) -> 2024-01-31
    if (Number(today.format('D')) < __issueDay) {
        return today.date(__issueDay).format('YYYY-MM-DD');
    }

    // 2. case for next month(2024-02) has less days than issue day(31) -> 2024-02-29
    const nextMonth = today.add(1, 'month');
    if (nextMonth.endOf('month').date() < __issueDay) {
        return nextMonth.endOf('month').format('YYYY-MM-DD');
    }

    // 3. case for next month(2024-02) has equal or more days than issue day(10) -> 2024-02-10
    return nextMonth.date(__issueDay).format('YYYY-MM-DD');
};

/* Api */
const { mutate: updateCostReportConfig } = useCostReportUpdateMutation({
    onSuccess: () => {
        showSuccessMessage(i18n.t('BILLING.COST_MANAGEMENT.COST_REPORT.ALT_S_UPDATE_SETTINGS'), '');
    },
    onError: (error) => {
        ErrorHandler.handleRequestError(error, i18n.t('BILLING.COST_MANAGEMENT.COST_REPORT.ALT_E_UPDATE_SETTINGS'));
    },
});

/* Event */
const handleChangeEnableLastDay = () => {
    state.enableLastDay = !state.enableLastDay;
    if (state.enableLastDay) {
        setForm('issueDay', getLastDay());
    }
};
const handleSelectCurrency = (item: string | number | SelectDropdownMenuItem) => {
    state.selectedCurrency = item as Currency;
};
const handleConfirm = () => {
    const params: CostReportConfigUpdateParameters = {
        cost_report_config_id: costReportConfig.value?.cost_report_config_id ?? '',
        currency: state.selectedCurrency,
        language: state.selectedLanguage,
        is_last_day: state.enableLastDay,
        issue_day: state.enableLastDay ? undefined : Number(issueDay.value),
    };

    updateCostReportConfig(params);
    state.proxyVisible = false;
};

/* Watcher */
watch(() => props.visible, (visible) => {
    if (visible && costReportConfig.value) {
        state.selectedCurrency = costReportConfig.value?.currency;
        state.enableLastDay = costReportConfig.value?.is_last_day;
        state.selectedLanguage = costReportConfig.value?.language;
        if (!costReportConfig.value?.is_last_day) {
            setForm('issueDay', costReportConfig.value?.issue_day);
        } else {
            setForm('issueDay', getLastDay());
        }
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
                <p-field-group :label="$t('BILLING.COST_MANAGEMENT.COST_REPORT.LANGUAGE')"
                               required
                >
                    <p-select-dropdown :menu="state.languageMenuItems"
                                       :selected.sync="state.selectedLanguage"
                                       :page-size="10"
                                       class="input-field"
                    />
                </p-field-group>
                <p-field-group :label="$t('BILLING.COST_MANAGEMENT.COST_REPORT.CURRENCY')"
                               required
                >
                    <p-select-dropdown :menu="state.currencyMenuItems"
                                       :selected="state.selectedCurrency"
                                       :required="true"
                                       class="input-field"
                                       use-fixed-menu-style
                                       @select="handleSelectCurrency"
                    >
                        <template #menu-item--format="{item}">
                            <div class="menu-item">
                                <span>{{ item?.label }}</span>
                                <p-badge v-if="item.name === CURRENCY.KRW"
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
                                      block
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

<style lang="postcss" scoped>
.input-field {
    width: 10rem;
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
