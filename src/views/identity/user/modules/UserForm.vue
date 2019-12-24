<template>
    <p-button-modal
        :header-title="headerTitle"
        :centered="true"
        size="lg"
        :fade="true"
        :backdrop="true"
        :visible.sync="proxyVisible"
        @confirm="confirm"
    >
        <template #body>
            <div class="form">
                <p-row>
                    <p-col :col="12">
                        <PFieldGroup
                            label="User ID"
                            :invalid-text="invalidMsg.userId"
                            :invalid="invalidState.userId"
                            :required="true"
                        >
                            <template v-slot:default="{invalid}">
                                <p-row style="width: 100%">
                                    <p-col :style="{'max-width': '19rem'}">
                                        <p-text-input
                                            v-model="formState.userId"
                                            v-focus
                                            :disabled="updateMode"
                                            placeholder="Insert User ID here"
                                            :class="{
                                                'form-control':true,
                                                'is-invalid':invalid
                                            }"
                                        />
                                    </p-col>
                                    <p-col>
                                        <p-button style-type="primary" class="user-id-check-btn" @click="checkUserID">
                                            check user id
                                        </p-button>
                                    </p-col>
                                </p-row>
                            </template>
                        </PFieldGroup>
                    </p-col>
                </p-row>
                <p-row>
                    <p-col :col="6">
                        <PFieldGroup
                            label="Password"
                            :invalid-text="invalidMsg.password1"
                            help-text="Your Password must be 5~12 characters long"
                            :invalid="invalidState.password1"
                            :required="true"
                        >
                            <template v-slot:default="{invalid}">
                                <p-text-input
                                    v-model="formState.password1"
                                    type="password"
                                    :class="{
                                        'form-control':true,
                                        'is-invalid':invalid
                                    }"
                                />
                            </template>
                        </PFieldGroup>
                    </p-col>
                    <p-col :col="6">
                        <PFieldGroup
                            label="Password Check"
                            :invalid-text="invalidMsg.password2"
                            :invalid="invalidState.password2"
                            :required="true"
                        >
                            <template v-slot:default="{invalid}">
                                <p-text-input
                                    v-model="formState.password2"
                                    type="password"
                                    :class="{
                                        'form-control':true,
                                        'is-invalid':invalid
                                    }"
                                />
                            </template>
                        </PFieldGroup>
                    </p-col>
                </p-row>
                <p-row>
                    <p-hr class="p-divider" />
                </p-row>
                <p-row>
                    <p-col :col="6">
                        <PFieldGroup label="Name">
                            <p-text-input v-model="formState.name" class="form-control" />
                        </PFieldGroup>
                    </p-col>
                    <p-col :col="6">
                        <PFieldGroup label="E-mail">
                            <p-text-input v-model="formState.email" class="form-control" />
                        </PFieldGroup>
                    </p-col>
                </p-row>
                <p-row>
                    <p-col :col="6">
                        <PFieldGroup label="Phone">
                            <p-text-input v-model="formState.phone" class="form-control" />
                        </PFieldGroup>
                    </p-col>
                    <p-col :col="6">
                        <PFieldGroup label="Group">
                            <p-text-input v-model="formState.group" class="form-control" />
                        </PFieldGroup>
                    </p-col>
                </p-row>
                <p-row>
                    <p-col :col="6">
                        <p-row style="width: 100%" direction="column">
                            <PFieldGroup label="Language">
                                <PSelectDropdown v-model="formState.language" :items="languageSelectItems" />
                            </PFieldGroup>
                            <PFieldGroup label="Timezone">
                                <PSelectDropdown v-model="formState.timezone" :items="timezoneSelectItems" />
                            </PFieldGroup>
                        </p-row>
                    </p-col>
                    <p-col :col="6">
                        <PFieldGroup label="Tags">
                            <p-tag-input-group class="tag-input"
                                               :use-full-col="true"
                                               :edit-mode="true"
                                               :tags.sync="formState.tags"
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
import PButtonModal from '@/components/organisms/modals/button-modal/ButtonModal';
import PFieldGroup from '@/components/molecules/forms/FieldGroup';
import PTextInput from '@/components/atoms/inputs/TextInput';
import { setup as contentModalSetup } from '@/components/organisms/modals/content-modal/ContentModal';
import {
    formValidation, makeProxy, requiredValidation, userIDValidation, Validation,
} from '@/lib/compostion-util';
import PTagInputGroup from '@/components/organisms/forms/tag-input-group/TagInputGroup';
import PHr from '@/components/atoms/hr/Hr';
import PRow from '@/components/atoms/grid/row/Row';
import PCol from '@/components/atoms/grid/col/Col';
import PSelectDropdown from '@/components/organisms/buttons/select-dropdown/SelectDropdown';
import PButton from '@/components/atoms/buttons/Button';

const components = {
    PButtonModal,
    PFieldGroup,
    PTextInput,
    PTagInputGroup,
    PHr,
    PRow,
    PCol,
    PSelectDropdown,
    PButton,
};

const setup = (props, context) => {
    const state = contentModalSetup(props, context);
    const formState = reactive({
        userId: '',
        password1: '',
        password2: '',
        name: '',
        email: '',
        phone: '',
        group: '',
        language: 'korean',
        timezone: 'UTC',
        tags: {},
        ...props.item,
    });
    const languageSelectItems = [
        { type: 'item', label: '한국어', name: 'korean' },
        { type: 'item', label: 'english', name: 'english' },
    ];
    const timezoneSelectItems = [
        { type: 'item', label: 'UTC', name: 'UTC' },
        { type: 'item', label: 'SEOUL(UTC+9)', name: 'UTC+9' },
    ];

    const userFormValidations = {
        userId: [requiredValidation(), userIDValidation(context.parent)],
        password1: [requiredValidation()],
        password2: [
            requiredValidation(),
            new Validation((value, data) => data.password1 === value, 'please enter same value again'),
        ],
    };

    const validateAPI = formValidation(formState, userFormValidations);
    const checkUserID = async () => {
        const result = await validateAPI.fieldValidation('userId');
        return result;
    };
    const confirm = async () => {
        const result = await validateAPI.allValidation();
        if (result) {
            const data = {
                user_id: formState.userId,
            };
            if (props.updateMode) {
                if (formState.password1) {
                    data.password = formState.password1;
                }
            } else {
                data.password = formState.password1;
            }
            data.name = formState.name;
            ['email', 'mobile', 'group', 'language', 'timezone', 'tags'].forEach((key) => {
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
        languageSelectItems,
        timezoneSelectItems,
        proxyVisible: makeProxy('visible', props, context.emit),
        confirm,
        ...validateAPI,
        checkUserID,
    };
};

export default {
    name: 'PUserForm',
    components,
    directives: {
        focus: {
            // 디렉티브 정의
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
                user_id: '',
                password1: '',
                password2: '',
                name: '',
                email: '',
                phone: '',
                group: '',
                language: 'korean',
                timezone: 'UTC',
                tags: {},
            }),
        },
        updateMode: {
            type: Boolean,
            default: false,
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

</style>
