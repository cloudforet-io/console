import type { ErrorObject, ValidateFunction } from 'ajv';
import type Ajv from 'ajv';
import type { Localize } from 'ajv-i18n/localize/types';
import { isEmpty } from 'lodash';
import {
    computed, reactive, toRefs, watch,
} from 'vue';
import type { Ref } from 'vue';

import type { JsonSchemaFormProps, InnerJsonSchema, CustomErrorMap } from '@/inputs/forms/json-schema-form/type';

const getErrorMessage = ({ instancePath, message, params }: ErrorObject) => {
    const dataKey = instancePath.slice(1).replace('/', '.');
    return `${dataKey ? `${dataKey}: ` : ''}${message}${params.allowedValues ? `: ${params.allowedValues.join(', ')}` : ''}`;
};

export const useValidation = (props: JsonSchemaFormProps, {
    ajv, formData, localize, customErrorMap,
}: {
    ajv: Ajv,
    formData: Ref<object|undefined>;
    localize: Ref<Localize|null>;
    customErrorMap: Ref<CustomErrorMap|undefined>;
}) => {
    const state = reactive({
        validator: computed<ValidateFunction|null>(() => {
            if (props.schema?.properties && !isEmpty(props.schema?.properties)) {
                return ajv.compile(props.schema);
            }
            return null;
        }),
        validatorErrors: null as ErrorObject[]|null,
        invalidMessagesMap: computed<Record<string, string[]>>(() => { // invalid message array map for form input case
            const errorObj: Record<string, string[]> = {};

            if (state.validatorErrors) {
                if (localize.value) {
                    localize.value(state.validatorErrors);
                }

                state.validatorErrors.forEach((error) => {
                    if (!error.instancePath && props.isRoot) {
                        /*
                         when the formData value is undefined, instancePath is empty string.
                         get property names that have 'required' error from error.params' value.
                         */
                        Object.values(error.params).forEach((property) => {
                            if (errorObj[property as string]) {
                                errorObj[property as string].push(getErrorMessage(error));
                            } else {
                                errorObj[property as string] = [getErrorMessage(error)];
                            }
                        });
                    } else {
                        const dataKey = error.instancePath.split('/')?.[1];
                        // 'required' error has high priority
                        if (errorObj[dataKey]) {
                            errorObj[dataKey].push(getErrorMessage(error));
                        } else {
                            errorObj[dataKey] = [getErrorMessage(error)];
                        }
                    }
                });

                if (customErrorMap.value) {
                    Object.entries(customErrorMap.value).forEach(([property, errorMessage]) => {
                        if (errorObj[property]) {
                            errorObj[property].push(errorMessage);
                        } else {
                            errorObj[property] = [errorMessage];
                        }
                    });
                }
            }
            return errorObj;
        }),
        inputOccurredMap: {} as Record<string, boolean|undefined>,
        invalidMessages: computed<string[]>(() => { // invalid message array for json input case
            let errorTexts: string[] = [];
            if (state.jsonInputParsingError) errorTexts.push(state.jsonInputParsingError.message);
            if (!state.validatorErrors) return errorTexts;

            if (localize.value) {
                localize.value(state.validatorErrors);
            }
            errorTexts = errorTexts.concat(state.validatorErrors.map((error) => getErrorMessage(error)));
            return errorTexts;
        }),
        jsonInputOccurred: false,
        jsonInputParsingError: null as Error|null,
    });

    const validateFormData = (): boolean => {
        const validator = state.validator;
        if (!validator) return false;

        const valid = validator(formData.value ?? {});

        if (!valid && validator.errors) {
            state.validatorErrors = validator.errors;
        } else {
            state.validatorErrors = null;
        }

        return valid;
    };

    const getPropertyInvalidState = ({ propertyName }: InnerJsonSchema): boolean|undefined => {
        if (props.validationMode === 'all') return !!state.invalidMessagesMap[propertyName]?.length;
        if (props.validationMode === 'input' && state.inputOccurredMap[propertyName]) return !!state.invalidMessagesMap[propertyName]?.length;
        return undefined;
    };

    const getJsonInputInvalidState = (): boolean|undefined => {
        if (!props.isRoot) return undefined;
        if (props.validationMode === 'all') return state.invalidMessages.length > 0;
        if (props.validationMode === 'input' && state.jsonInputOccurred) return state.invalidMessages.length > 0;
        return undefined;
    };

    const setJsonInputParsingError = (e: Error|null) => {
        state.jsonInputParsingError = e;
    };

    watch(() => props.validationMode, (validationMode) => {
        if (validationMode === 'all') validateFormData();
    }, { immediate: true });

    return {
        ...toRefs(state),
        validateFormData,
        getPropertyInvalidState,
        getJsonInputInvalidState,
        setJsonInputParsingError,
    };
};
