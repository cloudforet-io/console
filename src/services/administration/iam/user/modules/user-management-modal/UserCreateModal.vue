<template>
    <p-button-modal class="user-form-modal"
                    :header-title="headerTitle"
                    size="md"
                    :fade="true"
                    :backdrop="true"
                    :visible="userPageState.visibleCreateModal"
                    @confirm="confirm"
                    @cancel="handleClose"
                    @close="handleClose"
    >
        <template #body>
            <p-box-tab v-model="formState.activeTab"
                       :tabs="formState.tabs"
                       style-type="gray"
                       class="auth-type-tab"
            >
                <p-field-group :label="$t('IDENTITY.USER.FORM.USER_ID')"
                               :required="true"
                               :invalid="validationState.isUserIdValid === false"
                               :invalid-text="validationState.userIdInvalidText"
                               :valid="validationState.isUserIdValid"
                               :valid-text="validationState.userIdValidText"
                >
                    <template v-if="formState.activeTab === 'external' && supportFind && externalItems.length > 100"
                              #help
                    >
                        <div class="external-items-help-text">
                            <span>{{ $t('IDENTITY.USER.FORM.TOO_MANY_RESULTS') }}</span>
                        </div>
                    </template>
                    <template #default="{invalid}">
                        <div v-if="formState.activeTab === 'external' && supportFind">
                            <p-filterable-dropdown
                                :search-text.sync="searchText"
                                :class="{invalid}"
                                show-select-marker
                                :menu="externalItems"
                                :selected.sync="selectedItems"
                                :loading="loading"
                                disable-handler
                                :exact-mode="false"
                                use-fixed-menu-style
                                @select="onSelectExternalUser"
                                @delete-tag="onDeleteSelectedExternalUser"
                            />
                        </div>
                        <div v-else
                             class="id-input-form"
                        >
                            <p-text-input v-model="formState.user_id"
                                          v-focus
                                          :placeholder="$t('IDENTITY.USER.FORM.NAME_PLACEHOLDER')"
                                          :invalid="invalid"
                                          class="text-input"
                            />
                            <p-button style-type="secondary"
                                      class="user-id-check-button"
                                      @click="checkUserID"
                            >
                                {{ $t('IDENTITY.USER.FORM.CHECK_USER_ID') }}
                            </p-button>
                        </div>
                    </template>
                </p-field-group>
                <p-field-group :label="$t('IDENTITY.USER.FORM.NAME')"
                               class="input-form"
                >
                    <p-text-input v-model="formState.name"
                                  class="text-input"
                                  autocomplete="username"
                    />
                </p-field-group>
                <p-field-group :label="$t('IDENTITY.USER.FORM.EMAIL')"
                               :invalid="validationState.isEmailValid === false"
                               :invalid-text="validationState.emailInvalidText"
                               class="input-form"
                >
                    <template #default="{invalid}">
                        <p-text-input v-model="formState.email"
                                      :invalid="invalid"
                                      class="text-input"
                        />
                    </template>
                </p-field-group>
                <p-field-group :label="$t('IDENTITY.USER.FORM.ASSIGN_DOMAIN_ROLE')"
                               class="input-form"
                >
                    <!-- CAUTION: Do not remove key binding at select dropdown. This is for initiating scroll parent to refresh fixed menu style. -->
                    <p-select-dropdown :key="formState.activeTab"
                                       v-model="formState.domainRole"
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
                            <p-text-input v-model="formState.password"
                                          type="password"
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
                            <p-text-input v-model="formState.passwordCheck"
                                          type="password"
                                          class="text-input"
                                          autocomplete="new-password"
                                          :invalid="invalid"
                            />
                        </template>
                    </p-field-group>
                </form>
                <p-divider class="divider" />
                <p-field-group :label="$t('IDENTITY.USER.FORM.TAGS')"
                               class="tags-title"
                >
                    <div class="tag-help-msg">
                        {{ $t('IDENTITY.USER.FORM.TAGS_HELP_TEXT1') }} <br>
                        {{ $t('IDENTITY.USER.FORM.TAGS_HELP_TEXT2') }}
                    </div>
                </p-field-group>

                <tags-input-group :tags="formState.tags"
                                  show-validation
                                  :is-valid.sync="validationState.isTagsValid"
                                  @update-tags="handleUpdateTags"
                />
            </p-box-tab>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import {
    reactive, toRefs, computed, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PButtonModal,
    PSelectDropdown,
    PFieldGroup,
    PButton,
    PTextInput,
    PBoxTab,
    PFilterableDropdown,
    PDivider,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import { debounce } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { store } from '@/store';
import { i18n } from '@/translations';

import type { UserReferenceMap } from '@/store/modules/reference/user/type';

import TagsInputGroup from '@/common/components/forms/tags-input-group/TagsInputGroup.vue';
import type { Tag } from '@/common/components/forms/tags-input-group/type';
import ErrorHandler from '@/common/composables/error/errorHandler';

import type { Validation } from '@/services/administration/iam/user/lib/user-form-validations';
import {
    checkDuplicateID,
    checkEmailFormat, checkEmptyValue, checkMinLength,
    checkOauth, checkOneLowerCase, checkOneNumber, checkOneUpperCase,
    checkRequiredField, checkSamePassword,
} from '@/services/administration/iam/user/lib/user-form-validations';
import { useUserPageStore } from '@/services/administration/store/user-page-store';

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
        PFilterableDropdown,
        PDivider,
        TagsInputGroup,
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
    },
    setup(props, { emit }) {
        const userPageStore = useUserPageStore();
        const userPageState = userPageStore.$state;

        const state = reactive({
            isSameId: false,
            // external user
            loading: false,
            supportFind: computed(() => !!store.state.domain.authOptions?.support_find),
            users: computed<UserReferenceMap>(() => store.getters['reference/userItems']),
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
            tags: {},
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
            //
            isTagsValid: undefined as undefined | boolean,
        });

        /* Validation */
        const setFormState = () => {
            formState.user_id = '';
            formState.name = '';
            formState.email = '';
            formState.domainRole = '';
            formState.password = '';
            formState.passwordCheck = '';
            formState.tags = {};
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
            if (formState.activeTab === 'local') res = checkEmailFormat(formState.user_id);
            else if (formState.activeTab === 'external') res = await checkOauth(formState.user_id);
            return res;
        };

        const checkUserID = async () => {
            const validation: Validation[] = await Promise.all([
                checkRequiredField(formState.user_id),
                checkDuplicateID(formState.user_id),
                checkEmptyValue(formState.user_id),
                executeSpecificIDValidation()]);
            const invalidObj = validation.find((item) => item.invalidText.length > 0);
            if (!invalidObj) {
                validationState.isUserIdValid = true;
                validationState.userIdInvalidText = '';
            } else {
                validationState.isUserIdValid = invalidObj.isValid;
                validationState.userIdInvalidText = invalidObj.invalidText;
            }
        };

        const checkPasswordCheck = async (password) => {
            const passwordCheckValidation: Validation[] = await Promise.all([
                checkRequiredField(formState.passwordCheck),
                checkSamePassword(formState.passwordCheck, password),
            ]);
            const passwordCheckInvalidObj = passwordCheckValidation.find((item) => item.invalidText.length > 0);
            if (!passwordCheckInvalidObj) {
                validationState.isPasswordCheckValid = true;
                validationState.passwordCheckInvalidText = '';
            } else {
                validationState.isPasswordCheckValid = passwordCheckInvalidObj.isValid;
                validationState.passwordCheckInvalidText = passwordCheckInvalidObj.invalidText;
            }
        };
        const checkPassword = async (password) => {
            const passwordValidation: Validation[] = await Promise.all([
                checkEmptyValue(password),
                checkMinLength(password, 8),
                checkOneLowerCase(password),
                checkOneUpperCase(password),
                checkOneNumber(password),
            ]);
            const passwordInvalidObj = passwordValidation.find((item) => item.invalidText.length > 0);
            if (!passwordInvalidObj) {
                validationState.isPasswordValid = true;
                validationState.passwordInvalidText = '';
            } else {
                validationState.isPasswordValid = passwordInvalidObj.isValid;
                validationState.passwordInvalidText = passwordInvalidObj.invalidText;
            }
        };
        const checkPasswordValidation = async (password) => {
            // password
            await checkPassword(password);

            // password check
            await checkPasswordCheck(password);
        };

        /* API */
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
            try {
                const { results } = await SpaceConnector.client.identity.role.list({
                    role_type: 'DOMAIN',
                });
                formState.domainRoleList = results.map((d) => ({
                    type: 'item',
                    label: d.name,
                    name: d.role_id,
                }));
            } catch (e) {
                ErrorHandler.handleError(e);
                formState.domainRoleList = [];
            }
        };

        const confirm = async () => {
            await checkUserID();
            if (!validationState.isUserIdValid || !validationState.isTagsValid) return;
            if (formState.activeTab === 'local') {
                await checkPasswordValidation(formState.password);
                if (!(validationState.isPasswordValid && validationState.isPasswordCheckValid)) return;
            }
            const data = {
                user_id: formState.user_id,
                name: formState.name,
                email: formState.email,
                backend: authTypeMap[formState.activeTab]?.backend,
                user_type: authTypeMap[formState.activeTab]?.user_type,
                password: formState.password || '',
                tags: formState.tags || {},
            };
            if (formState.domainRoleList.length > 0) {
                emit('confirm', data, formState.domainRole);
            } else {
                emit('confirm', data, null);
            }
            userPageStore.$patch({ visibleCreateModal: false });
        };

        const handleClose = () => {
            userPageStore.$patch({ visibleCreateModal: false });
        };
        const handleUpdateTags = (tags?: Tag) => {
            formState.tags = tags;
        };

        /* External Users */
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
        const onDeleteSelectedExternalUser = () => {
            setFormState();
            setValidationState();
        };

        /* init */
        (async () => {
            await Promise.allSettled([
                initAuthTypeList(), getRoleList(),
                // LOAD REFERENCE STORE
                store.dispatch('reference/user/load'),
            ]);
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
        watch(() => formState.password, (after) => {
            checkPassword(after);
        });
        watch(() => formState.passwordCheck, () => {
            checkPasswordCheck(formState.password);
        });

        return {
            ...toRefs(state),
            userPageState,
            formState,
            validationState,
            confirm,
            handleClose,
            checkUserID,
            onSelectExternalUser,
            onDeleteSelectedExternalUser,
            handleUpdateTags,
        };
    },
};
</script>

<style lang="postcss">
.user-form-modal {
    .auth-type-tab {
        margin-bottom: 1.5rem;
        overflow-y: hidden;
    }
    .external-items-help-text {
        @apply text-gray-400;
        font-size: 0.75rem;
        line-height: 1.3;
        padding: 0.25rem 0;
    }
    .p-filterable-dropdown {
        width: 25rem;

        &.invalid {
            .p-search {
                @apply border-alert;
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

    .divider {
        @apply my-6;
    }
    .tag-help-msg {
        font-size: 0.875rem;
        line-height: 150%;
    }
}
</style>
