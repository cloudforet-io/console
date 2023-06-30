<script lang="ts" setup>

import { PFieldGroup } from '@spaceone/design-system';
import { debounce } from 'lodash';
import { watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { useFormValidator } from '@/common/composables/form-validator';
import ProjectSelectDropdown from '@/common/modules/project/ProjectSelectDropdown.vue';

interface Props {
    targets: string[];
    multiSelectable?: boolean;
    disableValidation?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    targets: () => [],
    multiSelectable: false,
    disableValidation: false,
});
const emit = defineEmits<{(e:'update', value: string|string[], valid: boolean): void}>();
const { t } = useI18n();

const {
    forms: {
        selectedTargets,
    },
    setForm,
    invalidState,
    invalidTexts,
    isAllValid,
    validate,
} = useFormValidator({
    selectedTargets: [] as string[],
}, {
    selectedTargets(value: string[]) { return value.length ? '' : t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.REQUIRED_TARGET'); },
});

watch([() => selectedTargets.value, () => isAllValid.value], debounce(([targets, isValid]) => {
    const target: string[]|string = props.multiSelectable ? targets : targets[0];
    emit('update', target, isValid);
}, 300) as any, { immediate: true });

</script>

<template>
    <p-field-group :label="t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.LABEL_TARGET')"
                   :invalid="!disableValidation && invalidState.selectedTargets"
                   :invalid-text="invalidTexts.selectedTargets"
                   required
                   class="budget-target-select-field"
    >
        <project-select-dropdown :selected-project-ids="selectedTargets"
                                 :invalid="!disableValidation && invalidState.selectedTargets"
                                 project-selectable
                                 project-group-selectable
                                 :multi-selectable="multiSelectable"
                                 @update:selected-project-ids="setForm('selectedTargets', $event)"
                                 @close="validate('selectedTargets')"
        />
    </p-field-group>
</template>

<style lang="postcss" scoped>
.budget-target-select-field {
    width: 30rem;
}

@screen mobile {
    .budget-target-select-field {
        width: 100%;
    }
}
</style>
