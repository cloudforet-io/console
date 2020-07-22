<template>
    <p-button-modal
        :header-title="headerTitle"
        :centered="true"
        :scrollable="true"
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
                                            class="block appearance-none w-full mb-1 text-base px-2 leading-normal bg-white text-grey-darker border border-grey rounded-sm"
                                            :class="{
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
                                    class="block appearance-none w-full mb-1 text-base px-2 leading-normal bg-white text-grey-darker border border-grey rounded-sm"
                                    :class="{
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
                                    class="block appearance-none w-full mb-1 text-base px-2 leading-normal bg-white text-grey-darker border border-grey rounded-sm"
                                    :class="{
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
                            <p-text-input v-model="formState.name" class="block appearance-none w-full mb-1 text-base px-2 leading-normal bg-white text-grey-darker border border-grey rounded-sm" />
                        </PFieldGroup>
                    </p-col>
                    <p-col :col="6">
                        <PFieldGroup label="E-mail">
                            <p-text-input v-model="formState.email" class="block appearance-none w-full mb-1 text-base px-2 leading-normal bg-white text-grey-darker border border-grey rounded-sm" />
                        </PFieldGroup>
                    </p-col>
                </p-row>
                <p-row>
                    <p-col :col="6">
                        <PFieldGroup label="Mobile">
                            <p-text-input v-model="formState.mobile" class="block appearance-none w-full mb-1 text-base px-2 leading-normal bg-white text-grey-darker border border-grey rounded-sm" />
                        </PFieldGroup>
                    </p-col>
                    <p-col :col="6">
                        <PFieldGroup label="Group">
                            <p-text-input v-model="formState.group" class="block appearance-none w-full mb-1 text-base px-2 leading-normal bg-white text-grey-darker border border-grey rounded-sm" />
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
import PButtonModal from '@/components/organisms/modals/button-modal/PButtonModal.vue';
import PFieldGroup from '@/components/molecules/forms/field-group/FieldGroup.vue';
import PTextInput from '@/components/atoms/inputs/PTextInput.vue';
import { setup as contentModalSetup } from '@/components/organisms/modals/content-modal/PContentModal.vue';
import {
    formValidation,
    makeProxy,
    requiredValidation,
    userIDValidation,
    Validation,
    lengthMaxValidation,
    lengthMinValidation,
    checkTimeZoneValidation, noEmptySpaceValidation,
} from '@/lib/compostion-util';
import PDictInputGroup from '@/components/organisms/forms/dict-input-group/PDictInputGroup_deprecated.vue';
import PHr from '@/components/atoms/hr/PHr.vue';
import PRow from '@/components/atoms/grid/row/Row.vue';
import PCol from '@/components/atoms/grid/col/Col.vue';
import PSelectDropdown from '@/components/organisms/dropdown/select-dropdown/PSelectDropdown.vue';
import PButton from '@/components/atoms/buttons/PButton.vue';

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
        language: 'en',
        timezone: 'UTC',
        tags: {},
        isLastCheck: false,
        // eslint-disable-next-line camelcase
        is_local_auth: computed(() => context.parent.$ls.domain.state.isLocalType),
        ...props.item,
    });
    const languageSelectItems = [
        { type: 'item', label: 'English', name: 'en' },
        {
            type: 'item', label: '한국어', name: 'ko',
        },
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
    const userIdVds = [requiredValidation(), noEmptySpaceValidation(), userIDValidation(context.parent)];

    const pluginAuthIDValidation = parent => new Validation(async (value) => {
        let result = false;

        // eslint-disable-next-line camelcase
        await parent.$http.post('/identity/user/find', { search: { user_id: value }, domain_id: parent.$ls.domain.state.domainId }).then((res) => {
            if (res.data.total_count >= 1) {
                result = true;
                if (!formState.isLastCheck && res.data.total_count === 1) {
                    const data = res.data.results[0];
                    if (!formState.name) { formState.name = data.name; }
                    if (!formState.email) { formState.email = data.email; }
                    if (!formState.mobile) { formState.mobile = data.mobile; }
                    if (!formState.group) { formState.group = data.group; }
                }
            }
        }).catch((error) => { console.error(error); });
        return result;
    }, "ID doesn't exists!");

    if (!formState.is_local_auth) { // plugin auth type
        // eslint-disable-next-line camelcase
        addUserValidations.user_id = [...userIdVds, pluginAuthIDValidation(context.parent)];
    } else {
        // eslint-disable-next-line camelcase
        addUserValidations.user_id = [...userIdVds];
        addUserValidations.password1 = [requiredValidation(), noEmptySpaceValidation(), lengthMinValidation(5), lengthMaxValidation(12)];
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
        formState.isLastCheck = true;
        const result = await validateAPI.allValidation();
        formState.isLastCheck = false;

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

<style lang="postcss" scoped>
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
        @apply bg-primary4;
        padding-top: 0.5rem;
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
