<template>
    <p-button-modal
        :header-title="headerTitle"
        :centered="true"
        size="md"
        :fade="true"
        :backdrop="true"
        :visible.sync="proxyVisible"
        @confirm="confirm"
    >
        <template #body>
            <div class="form">
                <p-row>
                    <p-col :col="12">
                        <PFieldGroup label="Credentials Group Name"
                                     :invalid-text="invalidMsg.name"
                                     :invalid="invalidState.name"
                                     :required="true"
                        >
                            <template v-slot:default="{invalid}">
                                <p-row style="width: 100%">
                                    <p-col>
                                        <p-text-input
                                            v-model="formState.name"
                                            type="name"
                                            @change="checkCdgName"

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
            </div>
        </template>
    </p-button-modal>
</template>
<script>
import { reactive } from '@vue/composition-api';
import PButtonModal from '@/components/organisms/modals/button-modal/ButtonModal.vue';
import PFieldGroup from '@/components/molecules/forms/field-group/FieldGroup.vue';
import PTextInput from '@/components/atoms/inputs/TextInput.vue';
import { setup as contentModalSetup } from '@/components/organisms/modals/content-modal/ContentModal.vue';
import {
    formValidation, makeProxy, requiredValidation, Validation
} from '@/lib/compostion-util';
import PDictInputGroup from '@/components/organisms/forms/dict-input-group/DictInputGroup.vue';
import PHr from '@/components/atoms/hr/Hr.vue';
import PRow from '@/components/atoms/grid/row/Row.vue';
import PCol from '@/components/atoms/grid/col/Col.vue';
import PSelectDropdown from '@/components/organisms/dropdown/select-dropdown/SelectDropdown.vue';
import PButton from '@/components/atoms/buttons/Button.vue';

const components = {
    PButtonModal,
    PFieldGroup,
    PTextInput,
    PDictInputGroup,
    PHr,
    PRow,
    PCol,
    PSelectDropdown,
    PButton,
};

const setup = (props, context) => {
    const state = contentModalSetup(props, context);
    const formState = reactive({
        name: '',
        tags: {},
        ...props.item,
    });
    const addCdgValidations = {
        name: [requiredValidation(), props.cdgNameValidation],
    };
    const updateCdgValidations = {
        name: [requiredValidation(), props.cdgNameValidation],
    };
    const validateAPI = formValidation(formState, props.updateMode ? updateCdgValidations : addCdgValidations);
    const checkCdgName = async () => {
        const result = await validateAPI.fieldValidation('name');
        return result;
    };
    const confirm = async () => {
        const result = await validateAPI.allValidation();
        if (result) {
            const data = {
                name: formState.name,
            };
            if (props.updateMode) {
                data.name = formState.name;
            }
            data.name = formState.name;
            ['name', 'tags'].forEach((key) => {
                if (formState[key]) {
                    data[key] = formState[key];
                }
            });

            context.emit('confirm', data);
        }
    };

    return {
        ...state,
        formState,
        proxyVisible: makeProxy('visible', props, context.emit),
        confirm,
        ...validateAPI,
        checkCdgName,
    };
};

export default {
    name: 'PCdgForm',
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
        item: {
            type: Object,
            default: () => ({
                name: '',
                tags: {},
            }),
        },
        updateMode: {
            type: Boolean,
            default: false,
        },
        cdgNameValidation: {
            type: Object,
            default: new Validation(() => true, 'error'),
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
        max-width: 30rem;
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

</style>
