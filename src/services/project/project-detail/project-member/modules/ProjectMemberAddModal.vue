<template>
    <p-button-modal
        class="project-member-add-modal"
        :header-title="$t('PROJECT.DETAIL.MEMBER.MODAL_INVITE_MEMBER_TITLE')"
        :fade="true"
        :backdrop="true"
        :visible.sync="proxyVisible"
        :disabled="!isAllValid"
        @confirm="handleConfirm"
    >
        <template #body>
            <p-box-tab v-if="authType && authType !== 'GOOGLE_OAUTH2'"
                       v-model="activeTab"
                       :tabs="tabs"
            />
            <div class="form-wrapper">
                <p class="title">
                    {{ $t('PROJECT.DETAIL.MEMBER.MEMBER') }} ({{
                        activeTab === AUTH_TYPE.INTERNAL_USER ? selectedInternalUserItems.length : selectedExternalUserItems.length
                    }})
                </p>
                <p-field-group v-show="activeTab === AUTH_TYPE.INTERNAL_USER"
                               :label="$t('PROJECT.DETAIL.MEMBER.MEMBER')"
                               required
                               :invalid="invalidState.selectedInternalUserItems"
                               :invalid-text="invalidTexts.selectedInternalUserItems"
                >
                    <template #default="{invalid}">
                        <p-filterable-dropdown
                            :menu="internalUserItems"
                            :selected="selectedInternalUserItems"
                            multi-selectable
                            appearance-type="stack"
                            show-select-marker
                            use-fixed-menu-style
                            :invalid="invalid"
                            @update:selected="setForm('selectedInternalUserItems', $event)"
                        />
                    </template>
                </p-field-group>
                <p-field-group v-show="activeTab !== AUTH_TYPE.INTERNAL_USER"
                               :label="$t('PROJECT.DETAIL.MEMBER.MEMBER')"
                               required
                               :invalid="invalidState.selectedExternalUserItems"
                               :invalid-text="invalidTexts.selectedExternalUserItems"
                >
                    <template #default="{invalid}">
                        <p-text-input :menu="externalUserItems"
                                      :value="searchText"
                                      :loading="loading"
                                      :selected="selectedExternalUserItems"
                                      :exact-mode="false"
                                      :invalid="invalid"
                                      multi-input
                                      disable-handler
                                      use-fixed-menu-style
                                      use-auto-complete
                                      block
                                      @input="handleSearchExternalUser"
                                      @update:selected="handleUpdateExternalUser"
                        />
                    </template>
                </p-field-group>
                <p-field-group :label="$t('PROJECT.DETAIL.MEMBER.ROLE')"
                               required
                               :help-text="$t('PROJECT.DETAIL.MEMBER.ROLE_HELP_TEXT')"
                               :invalid="invalidState.selectedRoleItems"
                               :invalid-text="invalidTexts.selectedRoleItems"
                >
                    <template #label-extra>
                        <p-tooltip class="help-icon"
                                   :contents="$t('PROJECT.DETAIL.MEMBER.ROLE_TOOLTIP')"
                                   position="bottom"
                        >
                            <p-i name="ic_help"
                                 width="0.875rem"
                                 height="0.875rem"
                                 color="inherit"
                            />
                        </p-tooltip>
                        <span v-if="showRoleWarning"
                              class="role-warning-text"
                        >{{ $t('PROJECT.DETAIL.MEMBER.ROLE_WARNING') }}</span>
                    </template>
                    <template #default="{invalid}">
                        <p-filterable-dropdown
                            :menu="roleItems"
                            :selected="selectedRoleItems"
                            show-select-marker
                            use-fixed-menu-style
                            :invalid="invalid"
                            @update:selected="handleSelectRoleItems"
                        />
                    </template>
                </p-field-group>
                <p-field-group
                    :label="$t('PROJECT.DETAIL.MEMBER.LABEL_LABEL')"
                    :help-text="$t('PROJECT.DETAIL.MEMBER.LABEL_HELP_TEXT')"
                    :invalid="invalidState.labels"
                    :invalid-text="invalidTexts.labels"
                >
                    <template #default="{invalid}">
                        <p-text-input :selected="labels"
                                      :invalid="invalid"
                                      multi-input
                                      block
                                      @update:selected="handleUpdateLabel"
                        />
                    </template>
                </p-field-group>
            </div>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import type { SetupContext } from 'vue';
import {
    reactive, toRefs, computed, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PButtonModal, PFieldGroup, PBoxTab, PFilterableDropdown, PTooltip, PI, PTextInput,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import type { SelectedItem as InputItem } from '@spaceone/design-system/types/inputs/input/type';
import { debounce } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { store } from '@/store';
import { i18n } from '@/translations';

import type { UserReferenceMap } from '@/store/modules/reference/user/type';

import { PAGE_PERMISSION_TYPE } from '@/lib/access-control/config';
import { getPagePermissionMapFromRaw } from '@/lib/access-control/page-permission-helper';
import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';
import { useProxyValue } from '@/common/composables/proxy-state';

import { checkEmailFormat } from '@/services/administration/iam/user/lib/user-form-validations';
import type { MemberItem } from '@/services/project/project-detail/project-member/type';
import { AUTH_TYPE } from '@/services/project/project-detail/project-member/type';

export default {
    name: 'ProjectMemberAddModal',
    components: {
        PButtonModal,
        PFieldGroup,
        PBoxTab,
        PFilterableDropdown,
        PTooltip,
        PI,
        PTextInput,
    },
    directives: {
        focus: {
            inserted(el) {
                el.focus();
            },
        },
    },
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
        isProjectGroup: {
            type: Boolean,
            default: false,
        },
        projectId: {
            type: String,
            default: undefined,
        },
        projectGroupId: {
            type: String,
            default: undefined,
        },
    },
    setup(props, { emit }: SetupContext) {
        const state = reactive({
            loading: false,
            proxyVisible: useProxyValue('visible', props, emit),
            authType: computed(() => store.state.domain.extendedAuthType),
            users: computed<UserReferenceMap>(() => store.getters['reference/userItems']),
            members: [] as MemberItem[],
            //
            tabs: computed(() => {
                const tabs = [
                    {
                        name: AUTH_TYPE.INTERNAL_USER,
                        label: i18n.t('PROJECT.DETAIL.MEMBER.ADD_FROM', { user_type: i18n.t('PROJECT.DETAIL.MEMBER.INTERNAL_USER') }),
                    },
                ];
                if (state.authType === AUTH_TYPE.KEYCLOAK) {
                    tabs.push({
                        name: AUTH_TYPE.KEYCLOAK,
                        label: i18n.t('PROJECT.DETAIL.MEMBER.ADD_FROM', { user_type: i18n.t('PROJECT.DETAIL.MEMBER.KEYCLOAK') }),
                    });
                }
                return tabs;
            }),
            activeTab: AUTH_TYPE.INTERNAL_USER,
            roleItems: [] as MenuItem[],
            internalUserItems: [] as MenuItem[],
            externalUserItems: [] as MenuItem[],
            invalidUserList: [] as string[],
            existingMemberList: [] as string[],
            searchText: '',
            labelText: '',
            showRoleWarning: false,
        });
        const {
            forms: {
                labels, selectedRoleItems, selectedInternalUserItems, selectedExternalUserItems,
            },
            invalidState,
            invalidTexts,
            setForm, isAllValid,
            initForm,
        } = useFormValidator({
            labels: [] as InputItem[],
            selectedRoleItems: [] as MenuItem[],
            selectedInternalUserItems: [] as MenuItem[],
            selectedExternalUserItems: [] as InputItem[],
        }, {
            selectedInternalUserItems: (val: MenuItem[]) => {
                if (!val.length) return i18n.t('PROJECT.DETAIL.MEMBER.MODAL_VALIDATION_REQUIRED');
                return true;
            },
            selectedExternalUserItems: (val: InputItem[]) => {
                const invalidItems = val.filter((d) => d.invalid);
                if (invalidItems.length) return invalidItems[invalidItems.length - 1]?.invalidText || '';
                return true;
            },
            selectedRoleItems: (val: MenuItem[]) => {
                if (!val.length) return i18n.t('PROJECT.DETAIL.MEMBER.MODAL_VALIDATION_REQUIRED');
                return true;
            },
            labels: (val: InputItem[]) => {
                const invalidItems = val.filter((d) => d.invalid);
                if (invalidItems.length) return invalidItems[invalidItems.length - 1]?.invalidText || '';
                if (val.length > 5) return i18n.t('PROJECT.DETAIL.MEMBER.LABEL_HELP_TEXT');
                return true;
            },
        });

        /* Util */
        const _setInternalMenuItems = () => {
            state.internalUserItems = [];
            const memberIdList: string[] = state.members.map((d) => d.resource_id);
            Object.keys(state.users).forEach((userId) => {
                const userName = state.users[userId]?.name;
                const singleItem = {
                    name: userId,
                    label: userName ? `${userId} (${userName})` : userId,
                    disabled: false,
                };
                if (memberIdList.includes(userId)) {
                    singleItem.disabled = true;
                }
                state.internalUserItems.push(singleItem);
            });
        };
        const _getExternalMenuItems = (users): MenuItem[] => {
            const externalUserItems: MenuItem[] = [];
            const memberIdList = state.members.map((d) => d.resource_id);
            users.forEach((user) => {
                const singleItem = {
                    name: user.user_id,
                    label: user.name ? `${user.user_id} (${user.name})` : user.user_id,
                    disabled: false,
                };
                if (memberIdList.includes(user.user_id)) {
                    singleItem.disabled = true;
                }
                externalUserItems.push(singleItem);
            });
            return externalUserItems;
        };
        const findExternalUser = async (userId: string): Promise<boolean> => {
            try {
                const res = await SpaceConnector.client.identity.user.find({ search: { user_id: userId } });
                return res.results.length;
            } catch (e) {
                return false;
            }
        };
        const _getInvalidText = async (userItem: InputItem): Promise<undefined | string | TranslateResult> => {
            /* 1. check duplicated */
            if (userItem.duplicated) {
                return i18n.t('PROJECT.DETAIL.MEMBER.DUPLICATED_VALUE');
            }

            /* 2. check email validation */
            const emailFormValidation = checkEmailFormat(userItem.value);
            if (!emailFormValidation.isValid) {
                return emailFormValidation.invalidText;
            }

            /* 3. check member list */
            const memberIdList: string[] = state.members.map((d) => d.resource_id);
            if (memberIdList.includes(userItem.value)) {
                return i18n.t('PROJECT.DETAIL.MEMBER.ALREADY_EXISTING');
            }

            const isExternalUserExist = await findExternalUser(userItem.value);
            if (!isExternalUserExist) {
                return i18n.t('PROJECT.DETAIL.MEMBER.INVALID');
            }
            return undefined;
        };

        /* Api */
        const listRoles = async () => {
            const { results } = await SpaceConnector.client.identity.role.list({
                role_type: 'PROJECT',
            });
            state.roleItems = results.map((d) => ({
                type: 'item',
                label: d.name,
                name: d.role_id,
                pagePermissions: d.page_permissions,
            }));
        };
        const addMember = async () => {
            try {
                const params: any = {
                    role_id: selectedRoleItems.value[0].name,
                    users: state.activeTab === AUTH_TYPE.INTERNAL_USER ? selectedInternalUserItems.value.map((d) => d.name) : selectedExternalUserItems.value.map((d) => d.value),
                    labels: labels.value.map((d) => d.value),
                    is_external_user: state.activeTab !== AUTH_TYPE.INTERNAL_USER,
                };
                if (props.isProjectGroup) {
                    params.project_group_id = props.projectGroupId;
                    await SpaceConnector.client.identity.projectGroup.member.add(params);
                } else {
                    params.project_id = props.projectId;
                    await SpaceConnector.client.identity.project.member.add(params);
                }
                showSuccessMessage(i18n.t('PROJECT.DETAIL.MEMBER.ALS_S_ADD_MEMBER'), '');
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('PROJECT.DETAIL.MEMBER.ALT_E_ADD_MEMBER'));
            }
        };
        const listMember = async () => {
            try {
                let res;
                if (props.isProjectGroup) {
                    res = await SpaceConnector.client.identity.projectGroup.member.list({
                        project_group_id: props.projectGroupId,
                    });
                } else {
                    res = await SpaceConnector.client.identity.project.member.list({
                        project_id: props.projectId,
                    });
                }
                state.members = res.results;
            } catch (e) {
                ErrorHandler.handleError(e);
                state.members = [];
            }
        };
        const listExternalUser = debounce(async () => {
            if (!state.searchText.length) return;
            try {
                state.loading = true;
                const { results } = await SpaceConnector.client.identity.user.find({
                    search: {
                        keyword: state.searchText,
                    },
                });
                state.externalUserItems = _getExternalMenuItems(results);
            } catch (e) {
                ErrorHandler.handleError(e);
                state.externalUserItems = [];
            } finally {
                state.loading = false;
            }
        }, 300);

        /* Event */
        const handleDeleteLabel = (index) => {
            const _labels = [...labels.value];
            _labels.splice(index, 1);
            setForm('labels', _labels);
        };
        const handleConfirm = async () => {
            await addMember();
            emit('confirm');
            state.proxyVisible = false;
        };
        const handleSearchExternalUser = (text) => {
            state.searchText = text;
            if (text.trim().length) listExternalUser();
        };
        const handleUpdateLabel = (inputLabels: InputItem[]) => {
            const _labels = [...inputLabels];
            _labels.forEach((label) => {
                label.invalid = label.duplicated;
                label.invalidText = i18n.t('PROJECT.DETAIL.MEMBER.DUPLICATED_VALUE');
            });
            setForm('labels', inputLabels);
        };
        const handleUpdateExternalUser = async (inputUserItems: InputItem[]) => {
            if (inputUserItems.length === selectedExternalUserItems.value.length) return;

            // when input deleted
            if (inputUserItems.length < selectedExternalUserItems.value.length) {
                const _inputUserItems: InputItem[] = [...inputUserItems];
                await Promise.all(_inputUserItems.map(async (userItem) => {
                    const _invalidText = await _getInvalidText(userItem);
                    userItem.invalid = !!_invalidText;
                    userItem.invalidText = _invalidText;
                }));
                setForm('selectedExternalUserItems', _inputUserItems);
                return;
            }

            // when input added
            const _addedUserItem = inputUserItems[inputUserItems.length - 1];
            const _invalidText = await _getInvalidText(_addedUserItem);
            _addedUserItem.invalid = !!_invalidText;
            _addedUserItem.invalidText = _invalidText;
            setForm('selectedExternalUserItems', [...selectedExternalUserItems.value, _addedUserItem]);
        };
        const handleSelectRoleItems = (roleItems) => {
            if (!roleItems.length) return;
            const roleItem: any = state.roleItems.find((d) => d?.name === roleItems[0]?.name);
            const pagePermissionMap = getPagePermissionMapFromRaw(roleItem.pagePermissions);
            setForm('selectedRoleItems', [roleItem]);
            state.showRoleWarning = !pagePermissionMap.project || pagePermissionMap.project === PAGE_PERMISSION_TYPE.VIEW;
        };

        /* Init */
        (async () => {
            await Promise.allSettled([
                listMember(),
                listRoles(),
                // LOAD REFERENCE STORE
                store.dispatch('reference/user/load'),
            ]);
            await _setInternalMenuItems();
        })();

        /* Watcher */
        watch(() => state.activeTab, () => {
            initForm();
            state.externalUserItems = [];
        });

        return {
            ...toRefs(state),
            selectedInternalUserItems,
            selectedExternalUserItems,
            selectedRoleItems,
            labels,
            invalidState,
            invalidTexts,
            setForm,
            isAllValid,
            //
            AUTH_TYPE,
            handleConfirm,
            handleDeleteLabel,
            handleSearchExternalUser,
            handleUpdateLabel,
            handleUpdateExternalUser,
            handleSelectRoleItems,
        };
    },
};
</script>

<style lang="postcss" scoped>
.project-member-add-modal {
    /* custom design-system component - p-box-tab */
    :deep(.p-box-tab) {
        .tab-pane {
            padding: 0;
        }
    }
    .form-wrapper {
        height: 30rem;

        .title {
            @apply text-gray-900;
            font-size: 1.375rem;
            line-height: 1.25;
            padding-bottom: 1rem;
        }

        .help-icon {
            @apply text-gray-400;
        }
        .role-warning-text {
            @apply text-red-500;
            font-size: 0.75rem;
            padding-left: 0.5rem;
        }
    }
}
</style>
