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
                            :invalid-text="invalidMsg.user_id"
                            :invalid="invalidState.user_id"
                            valid-text="you can use this ID"
                            :valid="validState.user_id"
                            :required="true"
                        >
                            <template v-slot:default="{invalid}">
                                <p-row style="width: 100%">
                                    <p-col :style="{'max-width': '19rem'}">
                                        <p-text-input
                                            v-model="formState.user_id"
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
                                        <p-button style-type="primary-dark" :disabled="updateMode" class="user-id-check-btn"
                                                  @click="checkUserID"
                                        >
                                            check user id
                                        </p-button>
                                    </p-col>
                                </p-row>
                            </template>
                        </PFieldGroup>
                    </p-col>
                </p-row>
                <p-row v-if="formState.is_local_auth">
                    <p-col :col="6">
                        <PFieldGroup
                            label="Password"
                            :invalid-text="invalidMsg.password1"
                            help-text="Your Password must be 5 ~ 12 characters long"
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
                        <PFieldGroup label="mobile">
                            <p-text-input v-model="formState.mobile" class="form-control" />
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

import { reactive, computed } from '@vue/composition-api';
import PButtonModal from '@/components/organisms/modals/button-modal/ButtonModal.vue';
import PFieldGroup from '@/components/molecules/forms/field-group/FieldGroup.vue';
import PTextInput from '@/components/atoms/inputs/TextInput.vue';
import { setup as contentModalSetup } from '@/components/organisms/modals/content-modal/ContentModal.vue';
import {
    formValidation,
    makeProxy,
    requiredValidation,
    userIDValidation,
    Validation,
    lengthMaxValidation,
    lengthMinValidation,
    checkTimeZoneValidation,
    pluginAuthIDValidation,
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
        // eslint-disable-next-line camelcase
        user_id: '',
        password1: '',
        password2: '',
        name: '',
        email: '',
        mobile: '',
        group: '',
        language: 'ko',
        timezone: 'UTC',
        tags: {},
        // eslint-disable-next-line camelcase
        is_local_auth: computed(() => {
        // return parent.$store.state.atuh.is_local_user
            console.debug('local auth');
            return true;
        }),
        ...props.item,
    });
    const languageSelectItems = [
        { type: 'item', label: '한국어', name: 'ko' },
        { type: 'item', label: 'english', name: 'en' },
    ];
    const timezoneSelectItems = [
        { type: 'item', label: 'UTC', name: 'UTC' },
        { type: 'item', label: 'Asia/Seoul', name: 'Asia/Seoul' },
    ];


    const pwdCheckValidation = new Validation((value, data) => data.password1 === value, 'please enter same value again');
    const defaultValidation = {
        timezone: [checkTimeZoneValidation()],
        // eslint-disable-next-line camelcase
    };

    const addUserValidations = { ...defaultValidation };
    const updateUserValidations = { ...defaultValidation };
    const userIdVds = [requiredValidation(), userIDValidation(context.parent)];

    if (!formState.is_local_auth) { // plugin auth type
        // eslint-disable-next-line camelcase
        addUserValidations.user_id = [...userIdVds, pluginAuthIDValidation(context.parent)];
    } else {
        // eslint-disable-next-line camelcase
        addUserValidations.user_id = [...userIdVds];
        addUserValidations.password1 = [requiredValidation(), lengthMinValidation(5), lengthMaxValidation(12)];
        addUserValidations.password2 = [requiredValidation(), pwdCheckValidation];

        updateUserValidations.password1 = [lengthMinValidation(5), lengthMaxValidation(12)];
        updateUserValidations.password2 = [
            new Validation((value, data) => data.password1 === value, 'please enter same value again'),
        ];
    }

    const validateAPI = formValidation(formState, props.updateMode ? updateUserValidations : addUserValidations);

    const checkUserID = async () => {
        const result = await validateAPI.fieldValidation('user_id');
        return result;
    };
    const confirm = async () => {
        const result = await validateAPI.allValidation();
        if (result) {
            const data = {};
            if (formState.is_local_auth) {
                if (result) {
                    if (props.updateMode) {
                        if (formState.password1) {
                            data.password = formState.password1;
                        }
                    } else {
                        data.password = formState.password1;
                    }
                }
            }
            ['user_id', 'name', 'email', 'mobile', 'group', 'language', 'timezone', 'tags'].forEach((key) => {
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
                // eslint-disable-next-line camelcase
                user_id: '',
                password1: '',
                password2: '',
                name: '',
                email: '',
                mobile: '',
                group: '',
                language: 'korean',
                timezone: 'Asia/Seoul',
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
    .p-table-check-modal-sub-title {
        margin-bottom: 2rem;
    }

    .p-text-input {
        max-width: 19rem;
    }

    .p-select-dropdown {
        max-width: 19rem;
        width: 100%;
    }

    .tag-input {
        padding-top: 0.5rem;
        background-color: $primary4;
    }

    .p-divider {
        margin-bottom: 1.5rem;
        margin-top: .5rem;
    }

    .p-field-group {
        width: 100%;
    }

    .user-id-check-btn {
        margin-left: 0.5rem;
        min-height: 2rem;

    }

</style>
