<template>
    <p-field-group :label="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.LABEL_TARGET')"
                   :invalid="isInvalid"
                   :invalid-text="invalidText"
                   required
    >
        <project-select-dropdown :selected-project-ids="selectedTargets"
                                 :invalid="isInvalid"
                                 project-selectable
                                 project-group-selectable
                                 :multi-selectable="multiSelectable"
                                 @update:selectedProjectIds="$emit('update', $event)"
                                 @close="$emit('close')"
        />
    </p-field-group>
</template>

<script lang="ts">
import { PFieldGroup } from '@spaceone/design-system';
import ProjectSelectDropdown from '@/common/modules/project/ProjectSelectDropdown.vue';
import { defineComponent } from '@vue/composition-api';

interface Props {
    isInvalid?: boolean;
    invalidText?: string;
    selectedTargets: string[];
    multiSelectable?: boolean;
}
export default defineComponent<Props>({
    name: 'BudgetTargetSelect',
    components: {
        PFieldGroup,
        ProjectSelectDropdown,
    },
    props: {
        isInvalid: {
            type: Boolean,
            default: undefined,
        },
        invalidText: {
            type: String,
            default: undefined,
        },
        selectedTargets: {
            type: Array,
            default: () => [],
        },
        multiSelectable: {
            type: Boolean,
            default: false,
        },
    },
});
</script>
