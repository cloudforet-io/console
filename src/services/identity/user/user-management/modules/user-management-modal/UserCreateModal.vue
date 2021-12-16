<template>
    <p-button-modal class="user-form-modal"
                    :header-title="headerTitle"
                    :scrollable="true"
                    size="md"
                    :fade="true"
                    :backdrop="true"
                    :visible.sync="visible"
                    @confirm="confirm"
                    @cancel="handleClose"
                    @close="handleClose"
    >
        <template #body>
            <p-box-tab v-model="formState.activeTab" :tabs="formState.tabs" style-type="gray"
                       class="auth-type-tab"
            >
                <p-field-group :label="$t('IDENTITY.USER.FORM.USER_ID')"
                               :required="true"
                               :invalid="validationState.isUserIdValid === false"
                               :invalid-text="validationState.userIdInvalidText"
                               :valid="validationState.isUserIdValid"
                               :valid-text="validationState.userIdValidText"
                >
                    <template #default="{invalid}">
                        <div v-if="formState.activeTab === 'external' && supportFind">
                            <p-search-dropdown
                                v-model="searchText"
                                :class="{invalid}"
                                type="radioButton"
                                :menu="externalItems"
                                :selected.sync="selectedItems"
                                :loading="loading"
                                disable-handler
                                :exact-mode="false"
                                use-fixed-menu-style
                                @select-menu="onSelectExternalUser"
                                @delete-tag="onDeleteSelectedExternalUser"
                                @search="onSearchExternalUser"
                            >
                                <template #menu-help-text>
                                    <div class="help-text">
                                        <span v-if="externalItems.length > 100">{{ $t('IDENTITY.USER.FORM.TOO_MANY_RESULTS') }}</span>
                                    </div>
                                </template>
                                <template #menu-no-data-format>
                                    <div class="external-user-no-data">
                                        <div v-if="!loading">
                                            <p class="title">
                                                <p-i name="ic_search" color="inherit" />
                                                {{ $t('IDENTITY.USER.FORM.NO_RESULTS_FOUND') }}
                                            </p>
                                            <p class="help-text">
                                                {{ $t('IDENTITY.USER.FORM.NO_RESULTS_FOUND_HELP_TEXT') }}
                                            </p>
                                        </div>
                                    </div>
                                </template>
                            </p-search-dropdown>
                        </div>
                        <div v-else class="id-input-form">
                            <p-text-input v-model="formState.user_id"
                                          v-focus
                                          :placeholder="$t('IDENTITY.USER.FORM.NAME_PLACEHOLDER')"
                                          :invalid="invalid"
                                          class="text-input"
                            />
                            <p-button style-type="outline primary-dark"
                                      class="user-id-check-button"
                                      @click="checkUserID"
                            >
                                {{ $t('IDENTITY.USER.FORM.CHECK_USER_ID') }}
                            </p-button>
                        </div>
                    </template>
                </p-field-group>
                <p-field-group :label="$t('IDENTITY.USER.FORM.NAME')" class="input-form">
                    <p-text-input v-model="formState.name" class="text-input" autocomplete="username" />
                </p-field-group>
                <p-field-group :label="$t('IDENTITY.USER.FORM.EMAIL')"
                               :invalid="validationState.isEmailValid === false"
                               :invalid-text="validationState.emailInvalidText"
                               class="input-form"
                >
                    <template #default="{invalid}">
                        <p-text-input v-model="formState.email" :invalid="invalid" class="text-input" />
                    </template>
                </p-field-group>
                <p-field-group :label="$t('IDENTITY.USER.FORM.ASSIGN_DOMAIN_ROLE')" class="input-form">
                    <p-select-dropdown v-model="formState.domainRole"
                                       :items="formState.domainRoleItem"
                                       :disabled="formState.domainRoleItem.length < 2 || isSameId"
                                       use-fixed-menu-style
                                       class="dropdown"
                    />
                </p-field-group>
                <form v-if="formState.activeTab === 'local'"
                      class="form"
                >
                    <p-field-group
                        :label="$t('COMMON.PROFILE.PASSWORD')"
                        :required="true"
                        :invalid="validationState.isPasswordValid === false"
                        :invalid-text="validationState.passwordInvalidText"
                        class="input-form"
                    >
                        <template #default="{invalid}">
                            <p-text-input v-model="formState.password" type="password"
                                          autocomplete="current-password"
                                          class="text-input"
                                          :invalid="invalid"
                            />
                        </template>
                    </p-field-group>
                    <p-field-group
                        :label="$t('COMMON.PROFILE.PASSWORD_CHECK')"
                        :required="true"
                        :invalid="validationState.isPasswordCheckValid === false"
                        :invalid-text="validationState.passwordCheckInvalidText"
                        class="input-form"
                    >
                        <template #default="{invalid}">
                            <p-text-input v-model="formState.passwordCheck" type="password"
                                          class="text-input"
                                          autocomplete="new-password"
                                          :invalid="invalid"
                            />
                        </template>
                    </p-field-group>
                </form>
            </p-box-tab>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import { TranslateResult } from 'vue-i18n';

import {
    reactive, toRefs, computed, watch,
} from '@vue/composition-api';

import {
    PButtonModal, PSelectDropdown, PFieldGroup, PButton, PTextInput, PBoxTab, PSearchDropdown, PI,
} from '@spaceone/design-system';

import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { store } from '@/store';
import {
    checkDuplicateID,
    checkEmailFormat, checkEmptyValue, checkMinLength,
    checkOauth, checkOneLowerCase, checkOneNumber, checkOneUpperCase,
    checkRequiredField, checkSamePassword, Validation,
} from '@/services/identity/user/lib/user-form-validations';
import { debounce } from 'lodash';
import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';
import { i18n } from '@/translations';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { MODAL_TYPE } from '@/services/identity/user/store/type';


interface AuthType {
    user_type: string;
    backend: string;
}

const authTypeMap: Record<string, AuthType> = {
    external: {
        user_type: 'USER',
        backend: 'EXTERNAL',
    },
    local: {
        user_type: 'USER',
        backend: 'LOCAL',
    },
    apiOnly: {
        user_type: 'API_USER',
        backend: 'LOCAL',
    },
};

export default {
    name: 'UserCreateModal',
    components: {
        PButtonModal,
        PFieldGroup,
        PTextInput,
        PSelectDropdown,
        PButton,
        PBoxTab,
        PSearchDropdown,
        PI,
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
        item: {
            type: Object,
            default: undefined,
        },
        isAdmin: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            visible: computed({
                get() { return store.getters['service/user/isCreateModalVisible']; },
                set(val) { store.commit('service/user/setVisibleCreateModal', val); },
            }),
            isSameId: false,
            // external user
            loading: false,
            supportFind: computed(() => !!store.state.domain.authOptions?.support_find),
            users: computed(() => store.state.resource.user.items),
            searchText: '',
            externalItems: [] as MenuItem[],
            selectedItems: [] as MenuItem[],
        });
        const formState = reactive({
            tabs: [
                { name: 'local', label: 'Local' },
                { name: 'apiOnly', label: 'API Only' },
            ],
            activeTab: '',
            user_id: '',
            name: '',
            email: '',
            domainRole: '',
            domainRoleItem: computed(() => [
                { type: 'item', label: i18n.t('IDENTITY.USER.FORM.NOT_SELECT_ROLE'), name: '' },
                ...formState.domainRoleList,
            ]),
            domainRoleList: [] as any[],
            password: '',
            passwordCheck: '',
        });
        const validationState = reactive({
            isUserIdValid: undefined as undefined | boolean,
            userIdInvalidText: '' as TranslateResult | string,
            userIdValidText: computed(() => i18n.t('IDENTITY.USER.FORM.NAME_VALID')),
            //
            isEmailValid: undefined as undefined | boolean,
            emailInvalidText: '' as TranslateResult | string,
            //
            isPasswordValid: undefined as undefined | boolean,
            passwordInvalidText: '' as TranslateResult | string,
            isPasswordCheckValid: undefined as undefined | boolean,
            passwordCheckInvalidText: '' as TranslateResult | string,
        });

        /* util */
        const setFormState = () => {
            formState.user_id = '';
            formState.name = '';
            formState.email = '';
            formState.domainRole = '';
            formState.password = '';
            formState.passwordCheck = '';
        };
        const setValidationState = () => {
            validationState.isUserIdValid = undefined;
            validationState.userIdInvalidText = '';
            validationState.isEmailValid = undefined;
            validationState.emailInvalidText = '';
            validationState.isPasswordValid = undefined;
            validationState.passwordInvalidText = '';
            validationState.isPasswordCheckValid = undefined;
            validationState.passwordCheckInvalidText = '';
        };

        const executeSpecificIDValidation = async () => {
            let res: Validation = { isValid: true, invalidText: '' };
            if (formState.activeTab === 'local') res = await checkEmailFormat(formState.user_id);
            else if (formState.activeTab === 'external') res = await checkOauth(formState.user_id);
            return res;
        };

        const checkUserID = async () => {
            const validation: Validation[] = await Promise.all([
                checkRequiredField(formState.user_id),
                checkDuplicateID(formState.user_id),
                checkEmptyValue(formState.user_id),
                executeSpecificIDValidation()]);
            const invalidObj = validation.find(item => item.invalidText.length > 0);
            if (!invalidObj) {
                validationState.isUserIdValid = true;
                validationState.userIdInvalidText = '';
            } else {
                validationState.isUserIdValid = invalidObj.isValid;
                validationState.userIdInvalidText = invalidObj.invalidText;
            }
        };

        const checkPassword = async (password) => {
            // password1
            const passwordValidation: Validation[] = await Promise.all([
                checkEmptyValue(password),
                checkMinLength(password, 8),
                checkOneLowerCase(password),
                checkOneUpperCase(password),
                checkOneNumber(password),
            ]);
            const passwordInvalidObj = passwordValidation.find(item => item.invalidText.length > 0);
            if (!passwordInvalidObj) {
                validationState.isPasswordValid = true;
                validationState.passwordInvalidText = '';
            } else {
                validationState.isPasswordValid = passwordInvalidObj.isValid;
                validationState.passwordInvalidText = passwordInvalidObj.invalidText;
            }

            // password2
            const passwordCheckValidation: Validation[] = await Promise.all([
                checkRequiredField(formState.passwordCheck),
                checkSamePassword(formState.passwordCheck, password),
            ]);
            const passwordCheckInvalidObj = passwordCheckValidation.find(item => item.invalidText.length > 0);
            if (!passwordCheckInvalidObj) {
                validationState.isPasswordCheckValid = true;
                validationState.passwordCheckInvalidText = '';
            } else {
                validationState.isPasswordCheckValid = passwordCheckInvalidObj.isValid;
                validationState.passwordCheckInvalidText = passwordCheckInvalidObj.invalidText;
            }
        };

        const confirm = async () => {
            await checkUserID();
            if (!validationState.isUserIdValid) return;
            if (formState.activeTab === 'local') {
                await checkPassword(formState.password);
                if (!(validationState.isPasswordValid && validationState.isPasswordCheckValid)) return;
            }
            const data = {
                user_id: formState.user_id,
                name: formState.name,
                email: formState.email,
                backend: authTypeMap[formState.activeTab]?.backend,
                user_type: authTypeMap[formState.activeTab]?.user_type,
                password: formState.password || '',
            };
            if (formState.domainRoleList.length > 0) {
                emit('confirm', data, formState.domainRole);
            } else {
                emit('confirm', data, null);
            }
            state.visible = false;
        };

        const handleClose = () => {
            state.visible = false;
        };

        const initAuthTypeList = async () => {
            if (store.state.domain.extendedAuthType !== undefined) {
                formState.tabs = [
                    { name: 'external', label: store.getters['domain/extendedAuthTypeLabel'] },
                    ...formState.tabs,
                ];
                formState.activeTab = 'external';
            } else {
                formState.activeTab = 'local';
            }
        };

        const getRoleList = async () => {
            const { results } = await SpaceConnector.client.identity.role.list({
                role_type: 'DOMAIN',
            });
            formState.domainRoleList = results.map(d => ({
                type: 'item',
                label: d.name,
                name: d.role_id,
            }));
        };

        const setExternalMenuItems = (users) => {
            state.externalItems = [];
            users.forEach((user) => {
                const singleItem = {
                    name: user.user_id,
                    label: user.name ? `${user.user_id} (${user.name})` : user.user_id,
                    disabled: false,
                };
                if (state.users[user.user_id]) {
                    singleItem.label = `(${i18n.t('IDENTITY.USER.FORM.ALREADY_EXISTS')}) ${singleItem.label}`;
                    singleItem.disabled = true;
                }
                state.externalItems.push(singleItem);
            });
        };
        const listExternalUser = debounce(async () => {
            try {
                state.loading = true;
                const { results } = await SpaceConnector.client.identity.user.find({
                    search: {
                        keyword: state.searchText,
                    },
                });
                await setExternalMenuItems(results);
            } catch (e) {
                ErrorHandler.handleError(e);
                state.externalItems = [];
            } finally {
                state.loading = false;
            }
        }, 300);
        const getExternalUser = async (userId: string) => {
            try {
                const { results } = await SpaceConnector.client.identity.user.find({
                    search: {
                        user_id: userId,
                    },
                });
                if (results.length) {
                    const selectedExternalUser = results[0];
                    formState.user_id = selectedExternalUser.user_id;

                    if (state.users[userId]) {
                        formState.name = '';
                        formState.email = '';
                    } else {
                        formState.name = selectedExternalUser.name;
                        formState.email = selectedExternalUser.email;
                    }
                }
            } catch (e) {
                ErrorHandler.handleError(e);
                formState.user_id = userId;
                formState.name = '';
                formState.email = '';
            }
        };
        const onSelectExternalUser = async (userItem) => {
            await getExternalUser(userItem.name);
            await checkUserID();
        };
        const onSearchExternalUser = async (userId: string) => {
            const trimmedUserId = userId.trim();
            if (trimmedUserId) {
                state.selectedItems = [{ name: trimmedUserId, label: trimmedUserId }];
                await getExternalUser(trimmedUserId);
                await checkUserID();
            }
        };
        const onDeleteSelectedExternalUser = () => {
            setFormState();
            setValidationState();
        };

        (async () => {
            await Promise.all([initAuthTypeList(), getRoleList()]);
        })();

        watch(() => formState.activeTab, (after) => {
            if (after) {
                setFormState();
                setValidationState();
                state.selectedItems = [];
            }
        }, { immediate: true });
        watch(() => state.searchText, (searchText) => {
            if (!searchText.trim().length) {
                state.externalItems = [];
            } else {
                listExternalUser();
            }
        });

        return {
            ...toRefs(state),
            formState,
            validationState,
            confirm,
            handleClose,
            checkUserID,
            onSelectExternalUser,
            onDeleteSelectedExternalUser,
            onSearchExternalUser,
            MODAL_TYPE,
        };
    },
};
</script>

<style lang="postcss">
.user-form-modal {
    .auth-type-tab {
        margin-bottom: 1.5rem;
    }

    .p-search-dropdown {
        width: 25rem;

        &.invalid {
            .p-search {
                @apply border-alert;
            }
        }
        .help-text {
            @apply text-gray-400;
            font-size: 0.75rem;
            line-height: 1.3;
            padding: 0.25rem 0.5rem;
        }
        .external-user-no-data {
            text-align: center;
            padding: 1.75rem 0;
            margin: auto;

            .title {
                @apply text-primary2;
                font-size: 1.125rem;
                font-weight: bold;
                line-height: 1.55;
                opacity: 0.7;
                padding-bottom: 0.625rem;
            }
            .help-text {
                @apply text-gray-400;
                font-size: 0.875rem;
            }
        }
        .p-context-menu {
            .p-search-dropdown__item-label {
                @apply truncate;
                width: 100%;
            }
        }
    }
    .id-input-form {
        max-width: 32rem;
        display: flex;
        .text-input {
            width: 25rem;
        }
    }
    .input-form {
        max-width: 25rem;
        .text-input {
            width: 25rem;
        }
        .p-select-dropdown {
            max-width: 14rem;
        }
    }
    .user-id-check-button {
        margin-left: 0.5rem;
        min-height: 2rem;
    }
}
</style>
