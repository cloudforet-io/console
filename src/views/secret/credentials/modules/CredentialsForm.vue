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
                            <p-row>
                                <p-col :col="6">
                                    <p-row style="width: 100%" direction="column">
                                        <PFieldGroup label="Secret Type">
                                            <PSelectDropdown v-model="formState.schema_type" :items="schemaTypeItems"
                                                             @input="onSchemaTypeChange"
                                            />
                                        </PFieldGroup>
                                    </p-row>
                                </p-col>
                            </p-row>
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
                                                :dynamic-style="{'min-width': '96px', 'display': 'inline-flex'}"
                                                :buttons="inputTypeItems"
                                                :selected.sync="selectedInputType"
                                                @clickButton="onChangeInputType"
                            />
                            <PFieldGroup v-if="selectedInputType === 'Form'"
                                         :invalid-text="validateRightHalfJsonAPI.invalidMsg.form"
                                         :invalid="validateRightHalfJsonAPI.invalidState.form"
                            >
                                <template v-slot:default="{invalid}">
                                    <div v-if="dynamicForm.length > 0" class="form-editor">
                                        <p-dynamic-form v-for="(fm, idx) in dynamicForm" :key="idx"
                                                        v-model="values[fm.key]"
                                                        :form="fm"
                                                        :invalid="showValidation && vdApi.invalidState[fm.key]"
                                                        :invalid-text="vdApi.invalidMsg[fm.key]"
                                                        :validatable="true"
                                                        @change="onOptionChange(fm.key)"
                                        />
                                    </div>
                                    <div v-else style="display:block" class="form-editor invalid-feedback">
                                        * {{ $t('SECRET.NO_FORMAT') }}
                                    </div>
                                </template>
                            </PFieldGroup>

                            <PFieldGroup v-else
                                         :invalid-text="validateRightHalfJsonAPI.invalidMsg.data"
                                         :invalid="validateRightHalfJsonAPI.invalidState.data"
                                         :valid="validateRightHalfJsonAPI.validState.data"
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
import { setup as contentModalSetup } from '@/components/organisms/modals/content-modal/ContentModal.vue';
import {
    formValidation, makeProxy, requiredValidation, jsonParseValidation, credentialsNameValidation,
} from '@/lib/compostion-util';
import PMonacoEditor from '@/components/molecules/text-editor/monaco/MonacoEditor.vue';
import PButtonModal from '@/components/organisms/modals/button-modal/ButtonModal.vue';
import PFieldGroup from '@/components/molecules/forms/field-group/FieldGroup.vue';
import PTextInput from '@/components/atoms/inputs/TextInput.vue';
import PDictInputGroup from '@/components/organisms/forms/dict-input-group/DictInputGroup_origin.vue';
import PRow from '@/components/atoms/grid/row/Row.vue';
import PCol from '@/components/atoms/grid/col/Col.vue';
import PSelectDropdown from '@/components/organisms/dropdown/select-dropdown/SelectDropdown.vue';
import PButton from '@/components/atoms/buttons/Button.vue';
import CardLayout from '@/components/molecules/layouts/card-layout/CardLayout.vue';
import PSelectBtnGroup from '@/components/organisms/buttons/select-btn-group/SelectBtnGroup.vue';
import PLabel from '@/components/atoms/labels/Label.vue';
import PDynamicForm, { map, setValidation } from '@/components/organisms/forms/dynamic-form/DynamicForm.vue';
import _ from 'lodash';
import fluentApi from '@/lib/fluent-api';
import schema from '@/lib/fluent-api/repository/schema';


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

    const allItem = { type: 'item', label: 'All', name: null };
    const schemaAPI = fluentApi.repository().schema().list();
    const secretAPI = fluentApi.secret().secret();
    const schemaState = reactive({
        schemaList: [],
        selectedSchema: null,
        dynamicForm: [],
        values: {},
        showValidation: false,
        inputTypeItems: computed(() => {
            const res = {};
            // return makeTrItems(res,context.parent, { vbind: { styleType: 'dark', outline: true } })
            return makeTrItems([
                ['Json'],
                ['Form'],
            ],
            context.parent, { vbind: { styleType: 'dark', outline: true }});
        }),
        selectedInputType: 'Json',
    });
    const listSchema = async () => {
        const res = await schemaAPI.execute();
        schemaState.schemaList = res.data.results;
        if (props.selectedSchemaId) {
            schemaState.selectedSchema = _.find(schemaState.schemaList, { schema_id: props.selectedSchemaId });
            console.log('selected Schema', schemaState.selectedSchema);
            schemaState.dynamicForm = schemaState.selectedSchema.fields || [];
        } else schemaState.selectedSchema = null;
    };
    listSchema();

    state.selected = reactive({ selected: _.isEmpty(getDataInputType()) ? 'json' : 'form' });

    const formState = reactive({
        name: '',
        tags: {},
        issue_type: 'credential',
        schema_type: props.selectedSchemaId,
        data: '',
    });

    const onSchemaTypeChange = (name) => {
        if (name) {
            schemaState.dynamicForm = _.find(schemaState.schemaList, { schema_id: name }).fields;
        } else schemaState.dynamicForm = [];
    };
    // TODO: form to json, json to form
    const onChangeInputType = () => {
        formState.data = '';
        schemaState.values = {};
    }
    const vdApi = setValidation(schemaState.dynamicForm, schemaState.values);

    watch(() => schemaState.dynamicForm, () => {
        schemaState.values = reactive({});
        const newVdApi = setValidation(schemaState.dynamicForm, schemaState.values);
        vdApi.invalidMsg = newVdApi.invalidMsg;
        vdApi.invalidState = newVdApi.invalidState;
        vdApi.fieldValidation = newVdApi.fieldValidation;
        vdApi.allValidation = newVdApi.allValidation;
    });

    const onOptionChange = async (key) => {
        if (!schemaState.showValidation) return;
        await vdApi.fieldValidation(key);
    };

    const schemaTypeItems = computed(() => {
        const result = [allItem, ...schemaState.schemaList.map(schema => ({ type: 'item', label: schema.name, name: schema.schema_id }))];
        console.log('result test', result);
        return result;
    });

    const leftHalfValidations = {
        name: [requiredValidation(), credentialsNameValidation(context.parent)],
    };

    const rightHalfJsonValidations = {
        data: [requiredValidation(), jsonParseValidation()],
    };
    const validateLeftHalfAPI = formValidation(formState, leftHalfValidations);
    const validateRightHalfJsonAPI = formValidation(formState, rightHalfJsonValidations);
    const confirm = async () => {
        schemaState.showValidation = true;
        const leftHalfResult = await validateLeftHalfAPI.allValidation();
        const rightHalfResult = schemaState.selectedInputType === 'Json' ? await validateRightHalfJsonAPI.allValidation() : await vdApi.allValidation();

        if (leftHalfResult && rightHalfResult) {
            const params = {
                name: formState.name,
            };
            const keyArr = ['name', 'issue_type', 'tags', 'data'];

            if (schemaState.selectedInputType === 'Form') {
                const formParam = {};
                for (const [k, v] of Object.entries(schemaState.values)) {
                    formParam[k] = v;
                }
                formState.data = formParam;
            } else {
                formState.data = JSON.parse(formState.data);
            }
            keyArr.forEach((key) => {
                if (formState[key]) {
                    params[key] = formState[key];
                }
            });
            context.emit('confirm', params);
        }
    };

    return {
        ...state,
        ...toRefs(schemaState),
        formState,
        onOptionChange,
        onSchemaTypeChange,
        onChangeInputType,
        vdApi,
        schemaTypeItems,
        proxyVisible: makeProxy('visible', props, context.emit),
        confirm,
        validateLeftHalfAPI,
        validateRightHalfJsonAPI,
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
        font: Bold 14px/28px Arial;
        letter-spacing: 0;
        color: #222532;
        opacity: 1;
    }
</style>
