<template>
    <p-button-modal
        :header-title="headerTitle"
        :scrollable="true"
        :centered="true"
        size="xl"
        :fade="true"
        :backdrop="true"
        :visible.sync="proxyVisible"
        @confirm="confirm"
    >
        <template #body>
            <div class="form">
                <card-layout class="form-card-layout" :no-margin="true" :no-padding="true">
                    <template slot="leftHalf">
                        <div class="left-container">
                            <p-row style="width: 100%">
                                <p-col :col="12">
                                    <PFieldGroup
                                        label="Credentials Name"
                                        :invalid-text="validateLeftHalfAPI.invalidMsg.name"
                                        :invalid="showValidation && validateLeftHalfAPI.invalidState.name"
                                        :valid="validateLeftHalfAPI.validState.name"
                                        :required="true"
                                    >
                                        <template v-slot:default="{invalid}">
                                            <p-col :style="{'max-width': '32rem', 'margin-left': 'none', 'align-items':'center'}">
                                                <p-text-input
                                                    v-model="formState.name"
                                                    v-focus
                                                    placeholder="Credentials Name"
                                                    :class="{
                                                        'is-invalid':invalid
                                                    }"
                                                    @input="validateLeftHalfAPI.fieldValidation('name')"
                                                />
                                            </p-col>
                                        </template>
                                    </PFieldGroup>
                                </p-col>
                            </p-row>
                            <!--                            <p-row>-->
                            <!--                                <p-col :col="6">-->
                            <!--                                    <p-row style="width: 100%" direction="column">-->
                            <!--                                        <PFieldGroup label="Secret Type">-->
                            <!--                                            <PSelectDropdown v-model="formState.schema_type" :items="schemaTypeItems"-->
                            <!--                                                             @input="onSchemaTypeChange"-->
                            <!--                                            />-->
                            <!--                                        </PFieldGroup>-->
                            <!--                                    </p-row>-->
                            <!--                                </p-col>-->
                            <!--                            </p-row>-->
                            <p-row>
                                <p-col :col="12">
                                    <PFieldGroup label="Tags">
                                        <p-dict-input-group class="tag-input"
                                                            :remove-row-effect="true"
                                                            :use-full-col="true"
                                                            :edit-mode="true"
                                                            :dict.sync="formState.tags"
                                        />
                                    </PFieldGroup>
                                </p-col>
                            </p-row>
                        </div>
                    </template>
                    <template slot="rightHalf">
                        <div class="right-container">
                            <p-label class="input-title">
                                Data Input Type
                            </p-label>
                            <p-select-btn-group style="min-width: 6rem"
                                                :space="true"
                                                :buttons="inputTypeItems"
                                                :selected.sync="selectedInputType"
                                                @clickButton="onChangeInputType"
                            />
<!--                            :dynamic-style="{'min-width': '96px', 'display': 'inline-flex'}"-->

                            <PFieldGroup
                                :invalid-text="validateLeftHalfAPI.invalidMsg.data"
                                :invalid="validateLeftHalfAPI.invalidState.data"
                                :valid="validateLeftHalfAPI.validState.data"
                            >
                                <template v-slot:default="{invalid}">
                                    <div>
                                        <PMonacoEditor class="json-editor" :code.sync="formState.data" />
                                    </div>
                                </template>
                            </PFieldGroup>
                        </div>
                    </template>
                </card-layout>
            </div>
        </template>
    </p-button-modal>
</template>
<script>
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';
import { makeTrItems } from '@/lib/view-helper';
import { setup as contentModalSetup } from '@/components/organisms/modals/content-modal/PContentModal.vue';
import {
    formValidation, makeProxy, requiredValidation, jsonParseValidation, credentialsNameValidation,
} from '@/lib/compostion-util';
import PMonacoEditor from '@/components/molecules/text-editor/monaco/PMonacoEditor.vue';
import PButtonModal from '@/components/organisms/modals/button-modal/PButtonModal.vue';
import PFieldGroup from '@/components/molecules/forms/field-group/FieldGroup.vue';
import PTextInput from '@/components/atoms/inputs/PTextInput.vue';
import PDictInputGroup from '@/components/organisms/forms/dict-input-group/PDictInputGroup_deprecated.vue';
import PRow from '@/components/atoms/grid/row/Row.vue';
import PCol from '@/components/atoms/grid/col/Col.vue';
import PSelectDropdown from '@/components/organisms/dropdown/select-dropdown/PSelectDropdown.vue';
import PButton from '@/components/atoms/buttons/PButton.vue';
import CardLayout from '@/components/molecules/layouts/card-layout/PCardLayout.vue';
import PSelectBtnGroup from '@/components/organisms/buttons/select-btn-group/PSelectBtnGroup.vue';
import PLabel from '@/components/atoms/labels/PLabel.vue';
import PDynamicForm, { map, setValidation } from '@/components/organisms/forms/dynamic-form/PDynamicForm.vue';
import _ from 'lodash';


export const getDataInputType = () => {
    const currentURL = window.location.href;
    const url = new URL(currentURL);
    const plugin_id = url.searchParams.get('plugin_id');
    const repository_id = url.searchParams.get('repository_id');
    return plugin_id;
};

const components = {
    CardLayout,
    PButtonModal,
    PFieldGroup,
    PTextInput,
    PDictInputGroup,
    PSelectBtnGroup,
    PMonacoEditor,
    PDynamicForm,
    PRow,
    PCol,
    PSelectDropdown,
    PLabel,
    PButton,
};

const setup = (props, context) => {
    const state = contentModalSetup(props, context);

    const dynamicFormState = reactive({
        // schemaList: [],
        // selectedSchema: null,
        dynamicForm: [],
        values: {},
        showValidation: false,
        inputTypeItems: computed(() => {
            const res = {};
            // return makeTrItems(res,context.parent, { vbind: { styleType: 'gray900', outline: true } })
            return makeTrItems([
                ['Json'],
                // ['Form'],
            ],
            context.parent, { styleType: 'gray900', outline: true });
        }),
        selectedInputType: 'Json',
    });

    state.selected = reactive({ selected: _.isEmpty(getDataInputType()) ? 'json' : 'form' });

    const formState = reactive({
        name: '',
        tags: {},
        secret_type: 'CREDENTIALS',
        data: '',
    });

    const onSchemaTypeChange = (name) => {
        if (name) {
            dynamicFormState.dynamicForm = _.find(dynamicFormState.schemaList, { schema_id: name }).fields;
        } else dynamicFormState.dynamicForm = [];
    };
    // TODO: form to json, json to form
    const onChangeInputType = () => {
        formState.data = '';
        dynamicFormState.values = {};
    };
    const vdApi = setValidation(dynamicFormState.dynamicForm, dynamicFormState.values);

    watch(() => dynamicFormState.dynamicForm, () => {
        dynamicFormState.values = reactive({});
        const newVdApi = setValidation(dynamicFormState.dynamicForm, dynamicFormState.values);
        vdApi.invalidMsg = newVdApi.invalidMsg;
        vdApi.invalidState = newVdApi.invalidState;
        vdApi.fieldValidation = newVdApi.fieldValidation;
        vdApi.allValidation = newVdApi.allValidation;
    });

    const onOptionChange = async (key) => {
        if (!dynamicFormState.showValidation) return;
        await vdApi.fieldValidation(key);
    };

    // const schemaTypeItems = computed(() => {
    //     const result = [allItem, ...dynamicFormState.schemaList.map(schema => ({ type: 'item', label: schema.name, name: schema.schema_id }))];
    //     console.log('result test', result);
    //     return result;
    // });

    const leftHalfValidations = {
        name: [
            requiredValidation(),
            credentialsNameValidation(context.parent),
        ],
        data: [requiredValidation(), jsonParseValidation()],
    };

    const validateLeftHalfAPI = formValidation(formState, leftHalfValidations);
    const confirm = async () => {
        dynamicFormState.showValidation = true;
        const leftHalfResult = await validateLeftHalfAPI.allValidation();

        if (leftHalfResult) {
            // console.log(formState, formState.data);
            const params = {
                name: formState.name,
                secret_type: formState.secret_type,
                data: JSON.parse(formState.data),
                tags: formState.tags,
            };
            // console.log('params', params);
            context.emit('confirm', params);
        }
    };

    return {
        ...state,
        ...toRefs(dynamicFormState),
        formState,
        onOptionChange,
        onSchemaTypeChange,
        onChangeInputType,
        vdApi,
        // schemaTypeItems,
        proxyVisible: makeProxy('visible', props, context.emit),
        confirm,
        validateLeftHalfAPI,
    };
};

export default {
    name: 'PCredentialsForm',
    components,
    directives: {
        focus: {
            inserted(el) {
                el.focus();
            },
        },
    },
    props: {
        headerTitle: String,
        visible: {
            type: Boolean,
            default: false,
        },
        selectedSchemaId: {
            type: String,
            default: null,
        },
    },
    setup(props, context) {
        return setup(props, context);
    },
};
</script>

<style lang="postcss" scoped>
    .p-table-check-modal-sub-title{
        margin-bottom: 2rem;
    }
    .p-select-dropdown{
        width: 100%;
    }
    .tag-input{
        @apply bg-primary4;
        padding-top: 0.5rem;
    }
    .p-divider{
        margin-bottom: 1.5rem;
        margin-top: .5rem;
    }
    .p-field-group{
        width: 100%;
    }

    .form-editor{
        min-height: 288px;
        > div {
            padding-top: 10px;
        }
    }
    .right-container{
        margin-left: 39.95px
    }
    .left-container{
        margin-right: 39.95px
    }
    .json-editor{
        min-height: 288px;
        > div {
            padding-top: 10px;
        }
    }
    .form-card-layout{
        border:none;
    }
    .input-title{
        margin-bottom: 0px;
        text-align: left;
        font-weight: bold;
        font-size: .875 rem;
        letter-spacing: 0;
        color: #222532;
        opacity: 1;
    }
</style>
