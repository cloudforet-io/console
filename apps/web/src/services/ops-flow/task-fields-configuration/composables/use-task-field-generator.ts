import type { ComputedRef } from 'vue';
import { ref, onBeforeMount } from 'vue';

import type { TaskFieldTypeMetadata } from '@/services/ops-flow/task-fields-configuration/types/task-field-type-metadata-type';

export const useTaskFieldGenerator = ({
    fieldMetadata,
}: {
    fieldMetadata: ComputedRef<TaskFieldTypeMetadata>;
}) => {
    const fieldName = ref<string>();
    const options = ref(); // TODO: change it to use another composable to generate options
    const isRequired = ref<boolean>(false);
    const isPrimary = ref<boolean>(false);

    onBeforeMount(() => {
        fieldName.value = fieldMetadata.value.name;
    });
    return {
        fieldName,
        options,
        isRequired,
        isPrimary,
    };
};
