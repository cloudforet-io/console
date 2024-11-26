import type { Ref } from 'vue';
import { ref, computed } from 'vue';

import { useFieldValidator, useFormValidator } from '@/common/composables/form-validator';

import { DEFAULT_FIELD_ID_MAP } from '@/services/ops-flow/task-fields-configuration/constants/default-field-constant';

export const useTaskFieldGenerator = ({
    fieldId,
}: {
    fieldId: Ref<string>
}) => {
    const isDefaultField = computed(() => !!DEFAULT_FIELD_ID_MAP[fieldId.value]);
    const fieldNameValidator = useFieldValidator<string|undefined>('', (val?: string) => (val ? val.trim().length > 0 : false));
    const options = ref(); // TODO: change it to use another composable to generate options
    const isRequired = ref<boolean>(false);
    const isPrimary = ref<boolean>(false);
    const isFolded = ref<boolean>(false);

    const formValidator = useFormValidator({
        name: fieldNameValidator,
    });

    return {
        isDefaultField,
        fieldName: fieldNameValidator.value,
        setFieldName: fieldNameValidator.setValue,
        isFieldNameInvalid: fieldNameValidator.isInvalid,
        resetFieldNameValidation: fieldNameValidator.resetValidation,
        options,
        isRequired,
        isPrimary,
        isFolded,
        isAllValid: formValidator.isAllValid,
    };
};
