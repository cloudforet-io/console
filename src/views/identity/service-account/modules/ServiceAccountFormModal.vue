<template>
    <p-button-modal
        header-title="Create Service Account"
        :centered="true"
        size="lg"
        :fade="true"
        :backdrop="true"
        :visible.sync="proxyVisible"
        @confirm="confirm"
    >
        <template #body>
            <div class="form">
                <div class="half-form">
                    <PFieldGroup
                        label="Name"
                        :invalid-text="validateAPI.invalidMsg.name"
                        :invalid="validateAPI.invalidState.name"
                        :required="true"
                    >
                        <template v-slot:default="{invalid}">
                            <p-text-input
                                v-model="formState.name"
                                class="block appearance-none w-full mb-1 text-base px-2 leading-normal bg-white text-grey-darker border border-grey rounded-sm"
                                :class="{
                                    'is-invalid':invalid
                                }"
                            />
                        </template>
                    </PFieldGroup>
                    <PFieldGroup
                        label="Tags"
                    >
                        <template v-slot:default="{invalid}">
                            <p-dict-input-group
                                class="w-full bg-primary4 border-gray-200 border-gray-200 p-2"
                                v-bind="tagsTS.state"
                                :items.sync="tagsTS.syncState.items"
                                v-on="tagsTS.events"
                            />
                        </template>
                    </PFieldGroup>
                </div>
                <div class="half-form right">
                    <PJsonSchemaForm
                        v-for="form in jsForms"
                        :key="form.key"
                        v-model="jsFormData[form.key]"
                        :schema="form.schema"
                        :invalid="jscInvalidData[form.key]"
                        :invalid-text="jscInvalidMessage[form.key]"
                        :required="form.required"
                    />
                </div>
            </div>
        </template>
    </p-button-modal>
</template>
<script lang="ts">

import { reactive, computed } from '@vue/composition-api';
import PButtonModal from '@/components/organisms/modals/button-modal/ButtonModal.vue';
import PFieldGroup from '@/components/molecules/forms/field-group/FieldGroup.vue';
import PTextInput from '@/components/atoms/inputs/TextInput.vue';
import {
    formValidation,
    makeProxy,
    requiredValidation,
    noEmptySpaceValidation,
} from '@/lib/compostion-util';
import PDictInputGroup from '@/components/organisms/forms/dict-input-group/DictInputGroup.vue';
import { DictIGToolSet } from '@/components/organisms/forms/dict-input-group/DictInputGroup.toolset';
import PJsonSchemaForm from '@/components/organisms/forms/json-schema-form/JsonSchemaForm.vue';
import Ajv from 'ajv';
import { error } from 'vue-i18n/src/util';
import _skipFirstGeneratorNext from '@babel/runtime-corejs2/helpers/esm/skipFirstGeneratorNext';
import _ from 'lodash';

export default {
    name: 'SServiceAccountFormModal',
    components: {
        PButtonModal,
        PFieldGroup,
        PTextInput,
        PDictInputGroup,
        PJsonSchemaForm,
    },
    directives: {
        focus: {
            inserted(el) {
                el.focus();
            },
        },
    },
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
        schema: {
            type: Object,
            default: undefined,
        },
        item: {
            type: Object,
            default: () => ({
                properties: {},
            }),
        },
        updateMode: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, context) {
        const formState = reactive({
            name: props.item.name || '',
        });

        const defaultValidation = {
            name: [requiredValidation(), noEmptySpaceValidation()],

        };
        const validateAPI = formValidation(formState, defaultValidation);

        const tagsTS = new DictIGToolSet({
            showValidation: true,
        });
        const keys = Object.keys(props.schema.properties);
        const jsFormData: any = reactive(_.zipObject(keys));
        const jscInvalidMessage: any = reactive(
            _.zipObject(Object.keys(props.schema.properties), _.fill(Array(keys.length), '')),
        );
        const jscInvalidData: any = reactive({
            ..._.zipObject(Object.keys(props.schema.properties), _.fill(Array(keys.length), false)),
        });

        const resetInvalidData = () => {
            keys.forEach((k) => { jscInvalidData[k] = false; });
        };


        const jsForms = computed(() => {
            if (props.schema) {
                return Object.entries(props.schema.properties).map(([key, value]) => ({
                    key,
                    schema: value,
                    required: props.schema.required ? props.schema.required.includes(key) : false,
                }));
            }
            return [];
        });


        const jscValidate = (JSC: object, data: object) => {
            resetInvalidData();
            const ajv = new Ajv({ allErrors: true });
            const valid = ajv.validate(JSC, data);

            if (ajv.errors) {
                ajv.errors.forEach((e) => {
                    const key = (e.params as any).missingProperty;
                    jscInvalidMessage[key] = e.message;
                    jscInvalidData[key] = true;
                });
            }
            console.debug(jscInvalidMessage, jscInvalidData);

            return valid;
        };


        const confirm = async () => {
            const validationResult = await validateAPI.allValidation();
            keys.forEach((k: string) => {
                if (typeof jsFormData[k] === 'string') {
                    console.log(jsFormData[k], k);
                    jsFormData[k] = (jsFormData[k] as string).trim();
                }
            });
            const jscValid = jscValidate(props.schema, jsFormData);
            if (tagsTS.allValidation() && validationResult && jscValidate(props.schema, jsFormData) && jscValid) {
                const item = {
                    name: formState.name,
                    data: jsFormData,
                    tags: tagsTS.vdState.newDict,
                };
                context.emit('confirm', item);
            }
        };

        return {
            proxyVisible: makeProxy('visible', props, context.emit),
            validateAPI,
            formState,
            tagsTS,
            confirm,
            jsFormData,
            jsForms,
            jscInvalidMessage,
            jscInvalidData,
        };
    },
};
</script>

<style lang="postcss" scoped>
    .form{
        @apply flex flex-row;
        .half-form{
            @apply w-1/2;
            &.right{
                @apply pl-8 border-l border-gray-200 ml-4 pl-4;
            }
        }
    }


</style>
