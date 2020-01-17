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
                <card-layout style="border:none">
                    <template slot="leftHalf">
                        <p-row>
                            <p-col :col="12">
                                <PFieldGroup
                                    label="Credentials Name"
                                    :invalid-text="invalidMessage.name"
                                    :invalid="invalidState.name"
                                    :valid="validState.name"
                                    :required="true"
                                >
                                    <template v-slot:default="{invalid}">
                                        <p-row style="width: 100%">
                                            <p-col :style="{'max-width': '19rem'}">
                                                <p-text-input
                                                    v-model="formState.name"
                                                    v-focus
                                                    placeholder="Credentials Name"
                                                    :class="{
                                                        'form-control':true,
                                                        'is-invalid':invalid
                                                    }"
                                                />
                                            </p-col>
                                        </p-row>
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
                                                        :use-full-col="true"
                                                        :edit-mode="true"
                                                        :dict.sync="formState.tags"
                                    />
                                </PFieldGroup>
                            </p-col>
                        </p-row>
                    </template>
                    <template slot="rightHalf">
                        <p-label class="input-title">
                            Data Input Type
                        </p-label>
                        <p-select-btn-group style="margin-bottom: 1rem"
                                            :space="true"
                                            :buttons="optionType"
                                            :selected.sync="selected"
                        />
                        <PFieldGroup v-if="selected === 'form'"
                                     :invalid-text="invalidMessage.form"
                                     :invalid="invalidState.form"
                        >
                            <template v-slot:default="{invalid}">
                                <div class="form-editor">
                                    <p-dynamic-form v-for="(fm, idx) in dynamicFormState.form" :key="idx"
                                                    v-model="values[fm.key]"
                                                    :form="fm"
                                                    :invalid="vdApi.invalidState[fm.key]"
                                                    :invalid-text="vdApi.invalidMsg[fm.key]"
                                                    :validatable="true"
                                                    @change="onOptionChange"
                                    />
                                </div>
                            </template>
                        </PFieldGroup>

                        <PFieldGroup v-else
                                     :invalid-text="invalidMessage.data"
                                     :invalid="invalidState.data"
                        >
                            <template v-slot:default="{invalid}">
                                <div>
                                    <PMonacoEditor class="json-editor" :code.sync="formState.data" />
                                    <div v-show="invalid" style="display:block" class="invalid-feedback">
                                        * {{ $t('SECRET.JASON_ALERT') }}
                                    </div>
                                </div>
                            </template>
                        </PFieldGroup>
                    </template>
                </card-layout>
            </div>
        </template>
    </p-button-modal>
</template>
<script>
import {
    computed, reactive, ref, toRefs, watch,
} from '@vue/composition-api';
import { makeTrItems } from '@/lib/view-helper';
import { setup as contentModalSetup } from '@/components/organisms/modals/content-modal/ContentModal.vue';
import {
    formValidation, makeProxy, requiredValidation, jsonParseValidation, credentialsNameValidation
} from '@/lib/compostion-util';
import PMonacoEditor from '@/components/molecules/text-editor/monaco/MonacoEditor.vue';
import PButtonModal from '@/components/organisms/modals/button-modal/ButtonModal.vue';
import PFieldGroup from '@/components/molecules/forms/field-group/FieldGroup.vue';
import PTextInput from '@/components/atoms/inputs/TextInput.vue';
import PDictInputGroup from '@/components/organisms/forms/dict-input-group/DictInputGroup.vue';
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
    state.selected = _.isEmpty(getDataInputType()) ? 'json' : 'form';
    state.values = {};

    const invalidMessage = {
        name: 'Required fields!',
        data: 'Please, confirm your Json String Format.',
    };

    const formState = reactive({
        name: '',
        tags: {},
        issue_type: 'credential',
        data: '',
    });

    const onOptionChange = () => {};
    const dynamicForm = computed(() => props.dynamicFormState.form);
    const vdApi = setValidation(props.dynamicFormState.form, state.values);

    watch(() => props.dynamicFormState, () => {
        state.values = reactive({});
        const newVdApi = setValidation(props.dynamicFormState.form, state.values);
        vdApi.invalidMsg = newVdApi.invalidMsg;
        vdApi.invalidState = newVdApi.invalidState;
        vdApi.fieldValidation = newVdApi.fieldValidation;
        vdApi.allValidation = newVdApi.allValidation;
        vdApi.isAllValid = newVdApi.isAllValid;
    });

    const issueTypeSelectItems = [
        { type: 'item', label: 'Token', name: 'token' },
        { type: 'item', label: 'Credentials', name: 'credential' },
    ];

    const optionType = makeTrItems(
        [
            ['form', null, { label: 'Form' }],
            ['json', null, { label: 'Json' }],
        ],
        context.parent,
        { vbind: { styleType: 'dark', outline: true } },
    );

    const leftHalfValidations = {
        name: [requiredValidation(), credentialsNameValidation(context.parent)],
    };

    if (state.selected === 'json') { leftHalfValidations.data = [jsonParseValidation()]; }

    const validateAPI = formValidation(formState, leftHalfValidations);

    const confirm = async () => {
        const leftHalfResult = await validateAPI.allValidation();
        const rightHalfResult = state.selected === 'json' ? true : await vdApi.allValidation();

        if (leftHalfResult && rightHalfResult) {
            const params = {
                name: formState.name,
            };
            const keyArr = ['name', 'issue_type', 'tags', 'data'];

            if (state.selected === 'form') {
                const formParam = {};
                for (const [k, v] of Object.entries(state.values)) {
                    formParam[k] = v;
                }
                formState.data = formParam;
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
        invalidMessage,
        formState,
        dynamicForm,
        onOptionChange,
        vdApi,
        issueTypeSelectItems,
        optionType,
        proxyVisible: makeProxy('visible', props, context.emit),
        confirm,
        ...validateAPI,
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
    .p-text-input{
        max-width: 19rem;
    }
    .p-select-dropdown{
        max-width: 19rem;
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
    .user-id-check-btn{
        margin-left: 0.5rem;
        min-height: 2rem;
    }

    .form-editor{
        min-height: 288px;
        > div {
            padding-top: 10px;
        }
    }

    .json-editor{
        min-height: 288px;
        > div {
            padding-top: 10px;
        }
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
