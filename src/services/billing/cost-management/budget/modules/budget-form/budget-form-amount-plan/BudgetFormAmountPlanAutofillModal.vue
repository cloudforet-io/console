<template>
    <p-button-modal :visible="_visible" :header-title="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.AMOUNT_PLAN.AUTO_FILL')"
                    :scrollable="false"
                    :disabled="!isAllValid"
                    size="sm"
                    @confirm="handleConfirm"
                    @update:visible="handleUpdateVisible"
    >
        <template #body>
            <div class="inner">
                <p class="description">
                    {{ $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.AMOUNT_PLAN.AUTO_FILL_DESC') }}
                </p>

                <p-field-group required :label="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.AMOUNT_PLAN.LABEL_STARTING_BUDGET')"
                               :invalid="invalidState.start"
                               :invalid-text="invalidTexts.start"
                >
                    <p-text-input v-model="formattedStartBudget" placeholder="1,000"
                                  :invalid="invalidState.start"
                    >
                        <template #right-extra>
                            ($)
                        </template>
                    </p-text-input>
                </p-field-group>

                <p-field-group :label="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.AMOUNT_PLAN.LABEL_EXPECTED_BUDGET')">
                    <p-text-input :value="growth" placeholder="10"
                                  type="number"
                                  @input="setForm('growth', $event)"
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

<script lang="ts">
import {
    computed,
    reactive, toRefs, watch,
} from '@vue/composition-api';
import { PButtonModal, PFieldGroup, PTextInput } from '@spaceone/design-system';
import { useFormValidator } from '@/common/composables/form-validator';
import { commaFormatter, getNumberFromString } from '@spaceone/console-core-lib';

interface Props {
    visible: boolean;
}

export interface AutofillOptions {
    start?: number;
    growth?: number;
}

export default {
    name: 'BudgetFormAmountPlanAutofillModal',
    components: {
        PButtonModal,
        PFieldGroup,
        PTextInput,
    },
    model: {
        prop: 'visible',
        event: 'update:visible',
    },
    props: {
        visible: {
            type: Boolean,
            required: true,
        },
    },
    setup(props: Props, { emit }) {
        const {
            forms: { start, growth },
            isAllValid, invalidState, invalidTexts,
            setForm, resetAll,
        } = useFormValidator({
            start: undefined as number|undefined,
            growth: undefined as number|undefined,
        }, {
            start: val => (typeof val === 'number' ? '' : 'Required'),
        }, { growth: true });

        const state = reactive({
            _visible: props.visible,
            formattedStartBudget: computed({
                get: () => commaFormatter(start.value),
                set: (val: string) => { setForm('start', getNumberFromString(val)); },
            }),
        });

        const setVisible = (value: boolean) => {
            state._visible = value;
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
            if (visible !== state._visible) state._visible = visible;
        });

        return {
            start,
            growth,
            isAllValid,
            invalidState,
            invalidTexts,
            ...toRefs(state),
            setForm,
            setVisible,
            handleUpdateVisible,
            handleConfirm,
        };
    },
};
</script>
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
