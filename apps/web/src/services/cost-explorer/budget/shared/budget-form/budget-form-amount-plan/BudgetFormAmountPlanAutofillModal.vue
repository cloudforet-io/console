<script setup lang="ts">

import { commaFormatter, getNumberFromString } from '@cloudforet/core-lib';
import { PButtonModal, PFieldGroup, PTextInput } from '@spaceone/design-system';
import {
    computed, reactive, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';

import { useFormValidator } from '@/common/composables/form-validator';
import { useProxyValue } from '@/common/composables/proxy-state';

import type { AutofillOptions } from '@/services/cost-explorer/budget/type';

interface Props {
    visible?: boolean;
}


const props = defineProps<Props>();

const emit = defineEmits<{(e: 'update:visible', visible: boolean): void; (e: 'confirm', options: AutofillOptions): void; }>();
const { t } = useI18n();

const {
    forms: { start, growth },
    isAllValid, invalidState, invalidTexts,
    setForm, resetAll,
} = useFormValidator({
    start: undefined as number|undefined,
    growth: undefined as number|undefined,
}, {
    start: (val) => (typeof val === 'number' ? '' : t('BILLING.COST_MANAGEMENT.BUDGET.FORM.AMOUNT_PLAN.REQUIRED_AMOUNT')),
}, { growth: true });

const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    formattedStartBudget: computed({
        get: () => commaFormatter(start.value),
        set: (val: string) => { setForm('start', getNumberFromString(val)); },
    }),
});

const setVisible = (value: boolean) => {
    state.proxyVisible = value;
    emit('update:visible', value);
};

const handleConfirm = () => {
    emit('confirm', {
        start: start.value,
        growth: growth.value,
    });

    setVisible(false);
};

const handleUpdateVisible = (visible: boolean) => {
    setVisible(visible);
    if (!visible) {
        resetAll();
    }
};

watch(() => props.visible, (visible) => {
    if (visible !== state.proxyVisible) state.proxyVisible = visible;
});

</script>

<template>
    <p-button-modal :visible="state.proxyVisible"
                    :header-title="t('BILLING.COST_MANAGEMENT.BUDGET.FORM.AMOUNT_PLAN.AUTO_FILL')"
                    :disabled="!isAllValid"
                    size="sm"
                    @confirm="handleConfirm"
                    @update:visible="handleUpdateVisible"
    >
        <template #body>
            <div class="inner">
                <p class="description">
                    {{ t('BILLING.COST_MANAGEMENT.BUDGET.FORM.AMOUNT_PLAN.AUTO_FILL_DESC') }}
                </p>

                <p-field-group required
                               :label="t('BILLING.COST_MANAGEMENT.BUDGET.FORM.AMOUNT_PLAN.LABEL_STARTING_BUDGET')"
                               :invalid="invalidState.start"
                               :invalid-text="invalidTexts.start"
                >
                    <p-text-input v-model:value="state.formattedStartBudget"
                                  placeholder="1,000"
                                  :invalid="invalidState.start"
                    >
                        <template #right-extra>
                            ($)
                        </template>
                    </p-text-input>
                </p-field-group>

                <p-field-group :label="t('BILLING.COST_MANAGEMENT.BUDGET.FORM.AMOUNT_PLAN.LABEL_EXPECTED_BUDGET')">
                    <p-text-input :value:value="growth"
                                  placeholder="10"
                                  type="number"
                                  @update:value="setForm('growth', $event)"
                    >
                        <template #right-extra>
                            %
                        </template>
                    </p-text-input>
                </p-field-group>
            </div>
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.inner {
    .description {
        margin-bottom: 1rem;
        line-height: 1.6;
    }
    .p-text-input {
        width: 15rem;
    }
}
</style>
