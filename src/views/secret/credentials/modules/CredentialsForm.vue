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
                                        :invalid="validateLeftHalfAPI.invalidState.name"
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
                                                />
                                            </p-col>
                                        </template>
                                    </PFieldGroup>
                                </p-col>
                            </p-row>
                            <p-row>
                                <p-col :col="6">
                                    <p-row style="width: 100%" direction="column">
                                        <PFieldGroup label="Issue Type">
                                            <PSelectDropdown v-model="formState.issue_type" :items="issueTypeSelectItems" />
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
                                                :buttons="optionType"
                                                :selected.sync="optionSelected.selected"
                            />
                            <PFieldGroup v-if="optionSelected.selected === 'form'"
                                         :invalid-text="validaterightHalfJsonAPI.invalidMsg.form"
                                         :invalid="validaterightHalfJsonAPI.invalidState.form"
                            >
                                <template v-slot:default="{invalid}">
                                    <div v-if="dynamicFormExist" class="form-editor">
                                        <p-dynamic-form v-for="(fm, idx) in dynamicFormState.form" :key="idx"
                                                        v-model="values[fm.key]"
                                                        :form="fm"
                                                        :invalid="vdApi.invalidState[fm.key]"
                                                        :invalid-text="vdApi.invalidMsg[fm.key]"
                                                        :validatable="true"
                                                        @change="onOptionChange"
                                        />
                                    </div>
                                    <div v-else style="display:block" class="form-editor invalid-feedback">
                                        * {{ $t('SECRET.NO_FORMAT') }}
                                    </div>
                                </template>
                            </PFieldGroup>

                            <PFieldGroup v-else
                                         :invalid-text="validaterightHalfJsonAPI.invalidMsg.data"
                                         :invalid="validaterightHalfJsonAPI.invalidState.data"
                                         :valid="validaterightHalfJsonAPI.validState.data"
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
    computed, reactive, watch,
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
    const selectiveOptions = [];
    const optionSelected = reactive({ selected: _.isEmpty(getDataInputType()) ? 'json' : 'form' });

    // state.selected = reactive({selected: _.isEmpty(getDataInputType()) ? 'json' : 'form'});
    state.values = {};

    if (optionSelected.selected === 'json') {
        selectiveOptions.push(['json', null, { label: 'Json' }]);
    } else {
        selectiveOptions.push(['form', null, { label: 'Form' }]);
        selectiveOptions.push(['json', null, { label: 'Json' }]);
    }

    const formState = reactive({
        name: '',
        tags: {},
        issue_type: 'credential',
        data: '',
    });

    const onOptionChange = () => {};
    const dynamicForm = computed(() => props.dynamicFormState.form);
    const dynamicFormExist = computed(() => dynamicForm.value.length > 0);
    const vdApi = setValidation(props.dynamicFormState.form, state.values);

    watch(() => props.dynamicFormState, () => {
        state.values = reactive({});
        const newVdApi = setValidation(props.dynamicFormState.form, state.values);
        vdApi.invalidMsg = newVdApi.invalidMsg;
        vdApi.invalidState = newVdApi.invalidState;
        vdApi.fieldValidation = newVdApi.fieldValidation;
        vdApi.allValidation = newVdApi.allValidation;
    });

    const issueTypeSelectItems = [
        /* TODO:: Remove this comment out part when token feature is ready.
        { type: 'item', label: 'Token', name: 'token' }, */
        { type: 'item', label: 'credential', name: 'credential' },
    ];


    const optionType = makeTrItems(selectiveOptions,
        context.parent,
        { vbind: { styleType: 'dark', outline: true } });

    const leftHalfValidations = {
        name: [requiredValidation(), credentialsNameValidation(context.parent)],
    };

    const rightHalfJsonValidations = {
        data: [requiredValidation(), jsonParseValidation()],
    };
    const validateLeftHalfAPI = formValidation(formState, leftHalfValidations);
    const validaterightHalfJsonAPI = formValidation(formState, rightHalfJsonValidations);


    const confirm = async () => {
        if (optionSelected.selected === 'form' && !dynamicFormExist.value) {
            context.root.$notify({
                group: 'noticeBottomRight',
                type: 'alert',
                title: 'Template unavailable',
                text: 'Please, check selected plug-in availability!.',
                duration: 2000,
                speed: 1000,
            });
            context.emit('close');
        } else {
            const leftHalfResult = await validateLeftHalfAPI.allValidation();
            const rightHalfResult = optionSelected.selected === 'json' ? await validaterightHalfJsonAPI.allValidation() : await vdApi.allValidation();

            if (leftHalfResult && rightHalfResult) {
                const params = {
                    name: formState.name,
                };
                const keyArr = ['name', 'issue_type', 'tags', 'data'];

                if (optionSelected.selected === 'form') {
                    const formParam = {};
                    for (const [k, v] of Object.entries(state.values)) {
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
        }
    };

    return {
        ...state,
        optionSelected,
        formState,
        dynamicForm,
        dynamicFormExist,
        onOptionChange,
        vdApi,
        issueTypeSelectItems,
        optionType,
        proxyVisible: makeProxy('visible', props, context.emit),
        confirm,
        validateLeftHalfAPI,
        validaterightHalfJsonAPI,
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
        dynamicFormState: {
            type: Object,
            default: () => ({
                form: [{}],
            }),
        },
    },
    setup(props, context) {
        return setup(props, context);
    },
};
</script>

<style lang="scss" scoped>
    .p-table-check-modal-sub-title{
        margin-bottom: 2rem;
    }
    .p-select-dropdown{
        width: 100%;
    }
    .tag-input{
        padding-top: 0.5rem;
        background-color: $primary4;
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
