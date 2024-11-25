import type { ComputedRef } from 'vue';
import { ref, onBeforeMount, computed } from 'vue';

import getRandomId from '@/lib/random-id-generator';

import { DEFAULT_FIELD_ID_MAP } from '@/services/ops-flow/task-fields-configuration/constants/default-field-constant';
import type { TaskFieldTypeMetadata } from '@/services/ops-flow/task-fields-configuration/types/task-field-type-metadata-type';

export const useTaskFieldGenerator = ({
    fieldMetadata,
}: {
    fieldMetadata: ComputedRef<TaskFieldTypeMetadata>;
}) => {
    const fieldId = computed(() => DEFAULT_FIELD_ID_MAP[fieldMetadata.value.type] || getRandomId());
    const fieldName = ref<string>();
    const options = ref(); // TODO: change it to use another composable to generate options
    const isRequired = ref<boolean>(false);
    const isPrimary = ref<boolean>(false);
    const isFolded = ref<boolean>(false);

    onBeforeMount(() => {
        fieldName.value = fieldMetadata.value.name;
    });
    return {
        fieldId,
        fieldName,
        options,
        isRequired,
        isPrimary,
        isFolded,
    };
};
