<template>
    <p-button-modal class="user-form-modal"
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
            <div class="user-input-lap">
                <div class="top-lap">
                    <p-field-group :label="$t('COMMON.USER_ID')"
                                   :required="true"
                                   :invalid-text="invalidMsg.user_id"
                                   :invalid="invalidState.user_id"
                                   valid-text="you can use this ID"
                                   :valid="validState.user_id"
                    >
                        <template #default="{invalid}">
                            <div>
                                <p-text-input v-model="formState.user_id"
                                              v-focus
                                              placeholder="Insert User ID here"
                                              :disabled="updateMode"
                                              :class="{'is-invalid': invalid}"
                                />
                                <p-button style-type="primary-dark" :disabled="updateMode" class="user-id-check-button"
                                          @click="checkUserID"
                                >
                                    check user id
                                </p-button>
                            </div>
                        </template>
                    </p-field-group>
                </div>
                <p-hr class="p-divider" />
                <div class="bottom-lap">
                    <div class="bottom-left-lap">
                        <p-field-group v-if="formState.is_local_auth"
                                       label="Password"
                                       :invalid-text="invalidMsg.password1"
                                       :invalid="invalidState.password1"
                                       :required="true"
                                       help-text="Your Password must be 5 ~ 12 characters long"
                        >
                            <template v-slot:default="{invalid}">
                                <p-text-input v-model="formState.password1"
                                              type="password"
                                              class="block"
                                              :class="{'is-invalid':invalid}"
                                />
                            </template>
                        </p-field-group>

                        <p-field-group :label="$t('COMMON.NAME')">
                            <p-text-input v-model="formState.name" class="block" />
                        </p-field-group>

                        <p-field-group :label="$t('COMMON.MOBILE')">
                            <p-text-input v-model="formState.mobile" class="block" />
                        </p-field-group>

                        <p-field-group :label="$t('COMMON.LANGUAGE')">
                            <p-select-dropdown v-model="formState.language" :items="languageSelectItems" />
                        </p-field-group>

                        <p-field-group :label="$t('COMMON.TIMEZONE')">
                            <p-select-dropdown v-model="formState.timezone" :items="timezoneSelectItems" />
                        </p-field-group>
                    </div>
                    <div class="bottom-right-lap">
                        <p-field-group v-if="formState.is_local_auth"
                                       label="Password Check"
                                       :invalid-text="invalidMsg.password2"
                                       :invalid="invalidState.password2"
                                       :required="true"
                        >
                            <template v-slot:default="{invalid}">
                                <p-text-input v-model="formState.password2"
                                              type="password"
                                              class="block"
                                              :class="{'is-invalid':invalid}"
                                />
                            </template>
                        </p-field-group>

                        <p-field-group :label="$t('COMMON.EMAIL')">
                            <p-text-input v-model="formState.email" class="block" />
                        </p-field-group>

                        <p-field-group :label="$t('COMMON.GROUP')">
                            <p-text-input v-model="formState.group" class="block" />
                        </p-field-group>

                        <p-field-group :label="$t('WORD.TAGS')">
                            <p-dict-input-group ref="dictRef"
                                                :dict="formState.tags"
                                                show-validation
                                                class="tag-input"
                            />
                        </p-field-group>
                    </div>
                </div>
            </div>
        </template>
    </p-button-modal>
</template>

<script>
/* eslint-disable camelcase */
import { reactive, computed, ref } from '@vue/composition-api';

import PButtonModal from '@/components/organisms/modals/button-modal/PButtonModal.vue';
import { setup as contentModalSetup } from '@/components/organisms/modals/content-modal/PContentModal.vue';
import PDictInputGroup from '@/components/organisms/forms/dict-input-group/PDictInputGroup.vue';
import PSelectDropdown from '@/components/organisms/dropdown/select-dropdown/PSelectDropdown.vue';
import PFieldGroup from '@/components/molecules/forms/field-group/FieldGroup.vue';
import PButton from '@/components/atoms/buttons/PButton.vue';
import PTextInput from '@/components/atoms/inputs/PTextInput.vue';
import PHr from '@/components/atoms/hr/PHr.vue';

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
import { useStore } from '@/store/toolset';

export default {
    name: 'PUserForm',
    components: {
        PButtonModal,
        PFieldGroup,
        PTextInput,
        PDictInputGroup,
        PHr,
        PSelectDropdown,
        PButton,
    },
    directives: {
        focus: {
            inserted(el) {
                el.focus();
            },
        },
    },
    props: {
        headerTitle: {
            type: String,
            required: true,
        },
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
        const state = contentModalSetup(props, context);
        const { domain } = useStore();
        const dictRef = ref(null);
        const formState = reactive({
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
            is_local_auth: computed(() => domain.state.isLocalType),
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
        };

        const addUserValidations = { ...defaultValidation };
        const updateUserValidations = { ...defaultValidation };
        const userIdVds = [requiredValidation(), noEmptySpaceValidation(), userIDValidation(context.parent)];

        const pluginAuthIDValidation = () => new Validation(async (value) => {
            let result = false;
            await context.parent.$http.post('/identity/user/find', { search: { user_id: value }, domain_id: domain.state.domainId }).then((res) => {
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
            addUserValidations.user_id = [...userIdVds, pluginAuthIDValidation(context.parent)];
        } else {
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
                ['user_id', 'name', 'email', 'mobile', 'group', 'language', 'timezone'].forEach((key) => {
                    if (formState[key]) {
                        data[key] = formState[key];
                    }
                });
                dictRef.value.allValidation();
                data.tags = dictRef.value.getDict();
                context.emit('confirm', data);
            }
        };

        return {
            ...state,
            dictRef,
            formState,
            languageSelectItems,
            timezoneSelectItems,
            proxyVisible: makeProxy('visible', props, context.emit),
            confirm,
            ...validateAPI,
            checkUserID,
        };
    },
};
</script>

<style lang="postcss">
.user-form-modal {
    .user-input-lap {
        .top-lap {
            padding-bottom: 0.25rem;
        }
        .bottom-lap {
            .bottom-left-lap {
                display: inline-grid;
                width: 50%;
            }
            .bottom-right-lap {
                display: inline-grid;
                width: 50%;
            }
            .p-field-group {
                width: 100%;
            }
        }
        .p-text-input {
            @apply text-gray-900;
            width: 100%;
            max-width: 19rem;
            appearance: none;
            font-size: 0.875rem;
            line-height: 1.5;
            border-radius: 0.125rem;
            padding-left: 0.5rem;
            padding-right: 0.5rem;
        }
        .p-select-dropdown {
            max-width: 19rem;
            width: 100%;
        }
        .tag-input {
            @apply bg-primary4;
            padding-top: 0.5rem;
            .p-dict-input .input-box {
                width: auto;
            }
        }
        .user-id-check-button {
            margin-left: 0.5rem;
            min-height: 2rem;
        }
        .p-divider {
            margin-bottom: 1.5rem;
            margin-top: .5rem;
        }
    }
}
</style>
