import type { Ref } from 'vue';
import { ref, computed } from 'vue';

import { useFieldValidator } from '@/common/composables/form-validator';

import { DEFAULT_FIELD_ID_MAP } from '@/services/ops-flow/task-fields-configuration/constants/default-field-constant';

export const useTaskFieldGenerator = ({
    fieldId,
}: {
    fieldId: Ref<string>
}) => {
    const isDefaultField = computed(() => !!DEFAULT_FIELD_ID_MAP[fieldId.value]);
    const {
        value: fieldName, setValue: setFieldName,
        resetValidation: resetFieldNameValidation,
        invalidText: fieldNameInvalidText,
        isInvalid: isFieldNameInvalid,
    } = useFieldValidator('', (val: string) => val.trim().length > 0);
    const options = ref(); // TODO: change it to use another composable to generate options
    const isRequired = ref<boolean>(false);
    const isPrimary = ref<boolean>(false);
    const isFolded = ref<boolean>(false);

    return {
        isDefaultField,
        fieldName,
        setFieldName,
        isFieldNameInvalid,
        fieldNameInvalidText,
        resetFieldNameValidation,
        options,
        isRequired,
        isPrimary,
        isFolded,
    };
};
