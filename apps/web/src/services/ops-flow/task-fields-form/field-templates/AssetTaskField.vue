<script setup lang="ts">
import { computed, ref } from 'vue';

import {
    PFieldGroup,
} from '@cloudforet/mirinae';
import type { MenuAttachHandler } from '@cloudforet/mirinae/types/hooks/use-context-menu-attach/use-context-menu-attach';

import type { OtherTaskField } from '@/schema/opsflow/_types/task-field-type';
import { i18n } from '@/translations';

import type { CloudServiceTypeItem } from '@/store/reference/cloud-service-type-reference-store';
import {
    useCloudServiceTypeReferenceStore,
} from '@/store/reference/cloud-service-type-reference-store';

import { VariableModelFactory } from '@/lib/variable-models';
import { getVariableModelMenuHandler } from '@/lib/variable-models/variable-model-menu-handler';

import DataSelector from '@/common/components/select/DataSelector.vue';
import type { DataSelectorItem } from '@/common/components/select/type';

import { useTaskFieldValidation } from '@/services/ops-flow/task-fields-form/composables/use-task-field-validation';
import type {
    TaskFieldFormEmits,
    TaskFieldFormProps,
} from '@/services/ops-flow/task-fields-form/types/task-field-form-type';

const props = defineProps<TaskFieldFormProps<OtherTaskField, string[]>>();
const emit = defineEmits<TaskFieldFormEmits<string[]>>();

const {
    updateFieldValue,
    isInvalid, invalidText,
} = useTaskFieldValidation(props, emit);

const cloudServiceTypeReferenceStore = useCloudServiceTypeReferenceStore();
const cloudServiceTypeItems = computed<CloudServiceTypeItem[]>(() => Object.values(cloudServiceTypeReferenceStore.getters.cloudServiceTypeItems));

const cloudServiceOptions = computed<Record<string, string>>(() => ({
    cloud_service_type: selectedStates.value[0]?.[0]?.name,
}));
const cloudServiceHandler = getVariableModelMenuHandler([{ variableModel: new VariableModelFactory({ type: 'MANAGED', managedModelKey: 'cloud_service' }) }], cloudServiceOptions);

type Step = {
    name: string;
} & ({ menu?: DataSelectorItem[]; } | { handler?: MenuAttachHandler<DataSelectorItem>; });
const steps = computed<Step[]>(() => [
    {
        name: i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.CATEGORY') as string,
        menu: cloudServiceTypeItems.value.map((item) => ({
            type: 'item',
            name: item.name,
            label: item.label,
            imageUrl: item.icon,
        })),
    },
    {
        name: i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.CATEGORY') as string,
        handler: cloudServiceHandler,
    },
]);
const selectedStates = ref<DataSelectorItem[][]>([]);

const getStepKey = (idx: number): string => {
    if (idx === 0) return '--';
    if (!selectedStates.value[idx - 1]) return `${idx}-none`;
    return selectedStates.value[idx - 1].map((d) => d.name).join(', ');
};
const handleUpdateSearchKey = (stepIdx: number) => {
    if (stepIdx === 0) {
        selectedStates.value.splice(stepIdx, 1, []);
    }
};
const handleUpdateSelected = (stepIdx: number, selected: DataSelectorItem[]) => {
    selectedStates.value.splice(stepIdx, 1, selected);

    if (stepIdx === steps.value.length - 1) {
        updateFieldValue(selected.map((item) => item.name));
    }
};
</script>

<template>
    <p-field-group :label="field.name"
                   :required="props.readonly ||field.is_required"
                   :invalid="isInvalid"
                   :invalid-text="invalidText"
                   no-spacing
    >
        <div v-if="props.readonly">
            {{ props.value ? props.value.join(', ') : '' }}
        </div>
        <div v-else
             class="mt-1 flex overflow-x-auto border border-gray-200 rounded-lg"
             :class="{'border-red-500': isInvalid}"
        >
            <div v-for="(step, idx) in steps"
                 :key="idx"
                 class="flex-1 data-select-col"
            >
                <data-selector :key="getStepKey(idx)"
                               :label="step.name"
                               :menu="step.menu"
                               :handler="step.handler"
                               @update:search-text="handleUpdateSearchKey(idx, $event)"
                               @update:selected="handleUpdateSelected(idx, $event)"
                />
            </div>
        </div>
    </p-field-group>
</template>

<style lang="scss" scoped>
.data-select-col {
    @apply border-r border-gray-200;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-width: 16rem;
    padding: 0.75rem 0;
    &:last-child {
        @apply border-r-0;
    }
}
</style>
