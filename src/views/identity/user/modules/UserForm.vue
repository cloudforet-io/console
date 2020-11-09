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
            <div class="user-input-wrapper">
                <div class="top-part">
                    <p-field-group :label="$t('COMMON.USER_ID')"
                                   :required="true"
                                   :invalid-text="invalidMsg.user_id"
                                   :invalid="invalidState.user_id"
                                   :valid-text="$t('IDENTITY.USER.FORM.NAME_VALID')"
                                   :valid="validState.user_id"
                    >
                        <template #default="{invalid}">
                            <div>
                                <p-text-input v-model="formState.user_id"
                                              v-focus
                                              :placeholder="$t('IDENTITY.USER.FORM.NAME_PLACEHOLDER')"
                                              :disabled="updateMode"
                                              :class="{'is-invalid': invalid}"
                                />
                                <p-button style-type="primary-dark" :disabled="updateMode" class="user-id-check-button"
                                          @click="checkUserID"
                                >
                                    {{ $t('IDENTITY.USER.FORM.CHECK_USER_ID') }}
                                </p-button>
                            </div>
                        </template>
                    </p-field-group>
                </div>
                <p-hr class="p-divider" />
                <div class="bottom-part">
                    <div class="bottom-left-part">
                        <p-field-group v-if="formState.is_local_auth"
                                       label="Password"
                                       :invalid-text="invalidMsg.password1"
                                       :invalid="invalidState.password1"
                                       :required="true"
                                       :help-text="$t('IDENTITY.USER.FORM.PASSWORD_INVALID')"
                        >
                            <template v-slot:default="{invalid}">
                                <p-text-input v-model="formState.password1"
                                              type="password"
                                              class="block"
                                              :class="{'is-invalid':invalid}"
                                />
                            </template>
                        </p-field-group>

                        <p-field-group :label="$t('IDENTITY.USER.FORM.NAME')">
                            <p-text-input v-model="formState.name" class="block" />
                        </p-field-group>

                        <p-field-group :label="$t('IDENTITY.USER.FORM.MOBILE')">
                            <p-text-input v-model="formState.mobile" class="block" />
                        </p-field-group>

                        <p-field-group :label="$t('IDENTITY.USER.FORM.LANGUAGE')">
                            <p-select-dropdown v-model="formState.language" :items="languageSelectItems" />
                        </p-field-group>

                        <p-field-group :label="$t('IDENTITY.USER.FORM.TIMEZONE')">
                            <p-select-dropdown v-model="formState.timezone" :items="timezoneSelectItems" />
                        </p-field-group>
                    </div>
                    <div class="bottom-right-part">
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

                        <p-field-group :label="$t('IDENTITY.USER.FORM.EMAIL')">
                            <p-text-input v-model="formState.email" class="block" />
                        </p-field-group>

                        <p-field-group :label="$t('IDENTITY.USER.FORM.GROUP')">
                            <p-text-input v-model="formState.group" class="block" />
                        </p-field-group>

                        <p-field-group :label="$t('IDENTITY.USER.FORM.TAGS')">
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

<script lang="ts">
/* eslint-disable camelcase */
import {
    reactive, computed, toRefs, getCurrentInstance, ComponentRenderProxy,
} from '@vue/composition-api';

import PButtonModal from '@/components/organisms/modals/button-modal/PButtonModal.vue';
import PDictInputGroup from '@/components/organisms/forms/dict-input-group/PDictInputGroup.vue';
import PSelectDropdown from '@/components/organisms/dropdown/select-dropdown/PSelectDropdown.vue';
import PFieldGroup from '@/components/molecules/forms/field-group/PFieldGroup.vue';
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
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            proxyVisible: makeProxy('visible', props, context.emit),
            modal: null,
            allBodyClass: computed(() => {
                const res = props.bodyClass ? [...props.bodyClass] : [];
                if (props.size) res.push(props.size);
                if (props.scrollable) res.push('scrollable');
                return res;
            }),
        });
        // const formState = reactive()
        const { domain } = useStore();
        const dictRef: any = null;
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

        const pwdCheckValidation = new Validation((value, data) => data.password1 === value, vm.$t('IDENTITY.USER.FORM.PASSWORD_CHECK_INVALID'));
        const defaultValidation = {
            timezone: [checkTimeZoneValidation(vm.$t('IDENTITY.USER.FORM.TIMEZONE_INVALID'))],
        } as any;

        const addUserValidations = { ...defaultValidation };
        const updateUserValidations = { ...defaultValidation };
        const userIdVds = [
            requiredValidation(vm.$t('IDENTITY.USER.FORM.REQUIRED_FIELD')),
            noEmptySpaceValidation(vm.$t('IDENTITY.USER.FORM.EMPTY_SPACE_INVALID')),
            userIDValidation(context.parent, vm.$t('IDENTITY.USER.FORM.USER_ID_INVALID')),
        ];

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
        }, vm.$t('IDENTITY.USER.FORM.USER_ID_NOT_EXIST'));

        if (!formState.is_local_auth) { // plugin auth type
            addUserValidations.user_id = [...userIdVds, pluginAuthIDValidation()];
        } else {
            addUserValidations.user_id = [...userIdVds];
            addUserValidations.password1 = [
                requiredValidation(vm.$t('IDENTITY.USER.FORM.REQUIRED_FIELD')),
                noEmptySpaceValidation(vm.$t('IDENTITY.USER.FORM.EMPTY_SPACE_INVALID')),
                lengthMinValidation(5, vm.$t('IDENTITY.USER.FORM.MIN_LENGTH_INVALID', { min: 5 })),
                lengthMaxValidation(12, vm.$t('IDENTITY.USER.FORM.MAX_LENGTH_INVALID', { max: 12 })),
            ];
            addUserValidations.password2 = [
                requiredValidation(vm.$t('IDENTITY.USER.FORM.REQUIRED_FIELD')),
                pwdCheckValidation,
            ];

            updateUserValidations.password1 = [
                lengthMinValidation(5, vm.$t('IDENTITY.USER.FORM.MIN_LENGTH_INVALID', { min: 5 })),
                lengthMaxValidation(12, vm.$t('IDENTITY.USER.FORM.MAX_LENGTH_INVALID', { max: 12 })),
            ];
            updateUserValidations.password2 = [
                new Validation((value, data) => data.password1 === value, vm.$t('IDENTITY.USER.FORM.PASSWORD_CHECK_INVALID')),
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
                const data = {} as any;
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
                dictRef.allValidation();
                data.tags = dictRef.getDict();
                context.emit('confirm', data);
            }
        };

        return {
            ...toRefs(state),
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
    .user-input-wrapper {
        .top-part {
            padding-bottom: 0.25rem;
        }
        .bottom-part {
            .bottom-left-part {
                display: inline-grid;
                width: 50%;
            }
            .bottom-right-part {
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
