<template>
    <p-button-modal
        class="project-member-add-modal"
        :header-title="$t('PROJECT.DETAIL.MEMBER.ADD_MEMBER')"
        :fade="true"
        :backdrop="true"
        :visible.sync="proxyVisible"
        :disabled="!isAllValid"
        @confirm="addMember"
    >
        <template #body>
            <p-box-tab v-if="authType && authType !== 'GOOGLE_OAUTH2'" v-model="activeTab" :tabs="tabs" />
            <div class="form-wrapper">
                <div class="member-wrapper">
                    <p class="title">
                        <span>{{ $t('PROJECT.DETAIL.MEMBER.MEMBER') }}</span>
                        <span> ({{ formState.users.length }})</span>
                    </p>
                    <p class="text">
                        {{ $t('PROJECT.DETAIL.MEMBER.MEMBER_HELP_TEXT') }}
                    </p>
                    <p-search-dropdown
                        v-show="activeTab === FORM_MODE.INTERNAL_USER"
                        type="checkbox"
                        :menu="internalItems"
                        :selected.sync="formState.userItems"
                        :show-selected-list="true"
                        :show-tag-box="false"
                        :show-select-all="true"
                        use-fixed-menu-style
                    />
                    <p-search-dropdown
                        v-show="activeTab !== FORM_MODE.INTERNAL_USER"
                        v-model="searchText"
                        type="checkbox"
                        :loading="loading"
                        :menu="externalItems"
                        :selected.sync="formState.userItems"
                        :show-selected-list="true"
                        :show-tag-box="false"
                        :show-select-all="true"
                        disable-handler
                        :exact-mode="false"
                        use-fixed-menu-style
                        @search="onSearchExternalUser"
                        @focus="onFocusExternalUserSearch"
                        @keydown.enter="onKeydownEnter"
                    >
                        <template v-if="externalItems.length > 100" #menu-help-text>
                            <div class="help-text">
                                {{ $t('PROJECT.DETAIL.MEMBER.TOO_MANY_RESULTS') }}
                            </div>
                        </template>
                        <template #menu-no-data-format>
                            <div class="external-user-no-data">
                                <div v-if="!loading">
                                    <p class="title">
                                        <p-i name="ic_search" color="inherit" />
                                        {{ $t('PROJECT.DETAIL.MEMBER.NO_RESULTS_FOUND') }}
                                    </p>
                                    <p class="help-text">
                                        {{ $t('PROJECT.DETAIL.MEMBER.NO_RESULTS_FOUND_HELP_TEXT') }}
                                    </p>
                                </div>
                            </div>
                        </template>
                    </p-search-dropdown>
                    <p-data-table
                        :fields="fields"
                        :items="formState.users"
                    >
                        <template #th-delete>
                            <div class="delete-button-wrapper">
                                <p-button style-type="primary-dark"
                                          :outline="true"
                                          size="sm"
                                          :disabled="!formState.users.length"
                                          @click="onClickDeleteAllUsers"
                                >
                                    {{ $t('PROJECT.DETAIL.MEMBER.DELETE_ALL') }}
                                </p-button>
                            </div>
                        </template>
                        <template #col-user_id-format="{ item, index }">
                            <div class="td-wrapper">
                                <span v-if="activeTab === FORM_MODE.INTERNAL_USER" class="text">
                                    {{ internalItems.find(d => d.name === item).label }}
                                </span>
                                <span v-else>
                                    <template v-if="invalidUserList.includes(item)">
                                        <p-badge outline style-type="alert">
                                            {{ $t('PROJECT.DETAIL.MEMBER.INVALID') }}
                                        </p-badge>
                                        <span class="invalid text">{{ item }}</span>
                                    </template>
                                    <template v-else-if="existingUserList.includes(item)">
                                        <p-badge outline style-type="alert">
                                            {{ $t('PROJECT.DETAIL.MEMBER.EXISTING') }}
                                        </p-badge>
                                        <span class="invalid text">{{ item }}</span>
                                    </template>
                                    <span v-else class="text">{{ externalItemsLabelMap[item] }}</span>
                                </span>
                                <p-icon-button class="delete-button" name="ic_delete" @click="onClickDeleteUser(index)" />
                            </div>
                        </template>
                        <template #no-data-format>
                            {{ $t('PROJECT.DETAIL.MEMBER.NO_MEMBER') }}
                        </template>
                    </p-data-table>
                </div>
                <div class="base-info-wrapper">
                    <p class="title">
                        {{ $t('PROJECT.DETAIL.MEMBER.BASE_INFORMATION') }}
                    </p>
                    <p class="text">
                        {{ $t('PROJECT.DETAIL.MEMBER.BASE_INFO_HELP_TEXT') }}
                    </p>

                    <div class="field-group-wrapper">
                        <p-field-group
                            :label="$t('PROJECT.DETAIL.MEMBER.PROJECT_ROLE_LABEL')"
                            required
                        >
                            <p-radio v-for="(role, rIdx) in projectRoles" :key="`role-${rIdx}`"
                                     v-model="formState.projectRole"
                                     :value="role.name"
                            >
                                {{ role.label }}
                            </p-radio>
                        </p-field-group>
                        <p-field-group
                            :label="$t('PROJECT.DETAIL.MEMBER.LABEL_LABEL')"
                            :help-text="$t('PROJECT.DETAIL.MEMBER.LABEL_HELP_TEXT')"
                            :invalid="!isLabelValid"
                            :invalid-text="labelInvalidText"
                        >
                            <div class="label-input-wrapper">
                                <p-text-input v-model="labelText"
                                              :placeholder="$t('PROJECT.DETAIL.MEMBER.LABEL_PLACEHOLDER')"
                                              :invalid="!isLabelValid"
                                              block
                                              @keyup.enter="onAddLabel"
                                />
                                <p-button style-type="gray900"
                                          :outline="true"
                                          :disabled="!labelText.trim().length || formState.labels.length >= 5 || !isLabelValid"
                                          @click="onAddLabel"
                                >
                                    {{ $t('PROJECT.DETAIL.MEMBER.ADD') }}
                                </p-button>
                            </div>
                        </p-field-group>
                        <p class="tag-wrapper">
                            <p-tag v-for="(label, lIdx) in formState.labels" :key="`label-tag-${lIdx}`"
                                   @delete="onDeleteLabel(lIdx)"
                            >
                                {{ label }}
                            </p-tag>
                        </p>
                    </div>
                </div>
            </div>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import { debounce } from 'lodash';

import {
    reactive, toRefs, computed, watch,
} from '@vue/composition-api';

import {
    PButtonModal, PFieldGroup, PTextInput, PButton, PBoxTab, PSearchDropdown, PDataTable, PIconButton, PRadio, PTag, PI, PBadge,
} from '@spaceone/design-system';
import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { makeProxy } from '@/lib/helper/composition-helpers';
import { i18n } from '@/translations';
import { store } from '@/store';


const FORM_MODE = Object.freeze({
    INTERNAL_USER: i18n.t('PROJECT.DETAIL.MEMBER.INTERNAL_USER'),
    KEYCLOAK: i18n.t('PROJECT.DETAIL.MEMBER.KEYCLOAK'),
    GOOGLE_OAUTH2: i18n.t('PROJECT.DETAIL.MEMBER.GOOGLE_OAUTH2'),
});

export default {
    name: 'ProjectMemberAddModal',
    components: {
        PButtonModal,
        PFieldGroup,
        PTextInput,
        PButton,
        PBoxTab,
        PSearchDropdown,
        PDataTable,
        PIconButton,
        PRadio,
        PTag,
        PI,
        PBadge,
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
        item: {
            type: Object,
            default: () => ({
                properties: {},
            }),
        },
        updateMode: {
            type: Boolean,
            default: false,
        },
        isProjectGroup: {
            type: Boolean,
            default: false,
        },
        projectGroupId: {
            type: String,
            default: '',
        },
    },
    setup(props, { emit, root }) {
        const formState = reactive({
            projectRole: undefined,
            labels: [] as string[],
            userItems: [] as MenuItem[],
            users: computed(() => formState.userItems.map(item => item.name)),
        });
        const state = reactive({
            loading: false,
            projectId: computed(() => root.$route.params.id),
            authType: computed(() => store.state.domain.extendedAuthType),
            users: computed(() => store.state.resource.user.items),
            members: [] as any,
            //
            tabs: computed(() => {
                const tabs = [
                    {
                        name: FORM_MODE.INTERNAL_USER,
                        label: i18n.t('PROJECT.DETAIL.MEMBER.ADD_FROM', { user_type: i18n.t('PROJECT.DETAIL.MEMBER.INTERNAL_USER') }),
                    },
                ];
                if (state.authType === 'GOOGLE_OAUTH2') {
                    // tabs.push({
                    //     name: FORM_MODE.GOOGLE_OAUTH2,
                    //     label: i18n.t('PROJECT.DETAIL.MEMBER.ADD_FROM', { user_type: i18n.t('PROJECT.DETAIL.MEMBER.GOOGLE_OAUTH2') }),
                    // });
                } else if (state.authType === 'KEYCLOAK') {
                    tabs.push({
                        name: FORM_MODE.KEYCLOAK,
                        label: i18n.t('PROJECT.DETAIL.MEMBER.ADD_FROM', { user_type: i18n.t('PROJECT.DETAIL.MEMBER.KEYCLOAK') }),
                    });
                }
                return tabs;
            }),
            activeTab: FORM_MODE.INTERNAL_USER,
            fields: computed(() => [
                { name: 'user_id', label: i18n.t('PROJECT.DETAIL.MEMBER.USER_ID'), type: 'item' },
            ]),
            projectRoles: [],
            internalItems: [] as MenuItem[],
            externalItems: [] as MenuItem[],
            externalItemsLabelMap: {},
            invalidUserList: [],
            existingUserList: [],
            searchText: '',
            labelText: '',
            totalCount: 0,
            isFocused: false,
            visibleMenu: false,
            proxyVisible: makeProxy('visible', props, emit),
            isLabelValid: computed(() => !state.labelInvalidText),
            labelInvalidText: computed(() => {
                if (formState.labels.includes(state.labelText)) {
                    return i18n.t('PROJECT.DETAIL.MEMBER.ALREADY_EXISTING');
                }
                return '';
            }),
            isAllValid: computed(() => {
                const isInvalid = !!formState.users.filter(user => state.invalidUserList.includes(user)).length;
                if (isInvalid) return false;
                const isExisting = !!formState.users.filter(user => state.existingUserList.includes(user)).length;
                if (isExisting) return false;
                return formState.users.length > 0;
            }),
        });

        /* util */
        const setInternalMenuItems = () => {
            state.internalItems = [];
            const memberIdList = state.members.map(d => d.resource_id);
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
                state.internalItems.push(singleItem);
            });
        };
        const setExternalMenuItems = (users) => {
            state.externalItems = [];
            const memberIdList = state.members.map(d => d.resource_id);
            users.forEach((user) => {
                const singleItem = {
                    name: user.user_id,
                    label: user.name ? `${user.user_id} (${user.name})` : user.user_id,
                    disabled: false,
                };
                if (memberIdList.includes(user.user_id)) {
                    singleItem.disabled = true;
                }
                state.externalItems.push(singleItem);
                state.externalItemsLabelMap[user.user_id] = user.name ? `${user.user_id} (${user.name})` : user.user_id;
            });
        };
        const validateExternalUser = async (userId) => {
            /* 1. check existing */
            const memberIdList = state.members.map(d => d.resource_id);
            if (memberIdList.includes(userId)) {
                state.existingUserList.push(userId);
                return;
            }
            /* 2. check invalid */
            try {
                const res = await SpaceConnector.client.identity.user.find({ search: { user_id: userId } });
                if (!res.results.length) {
                    state.invalidUserList.push(userId);
                }
            } catch (e) {
                state.invalidUserList.push(userId);
            }
        };

        /* api */
        const getRoleList = async () => {
            const res = await SpaceConnector.client.identity.role.list({
                role_type: 'PROJECT',
            });
            state.projectRoles = res.results.map(d => ({
                type: 'item',
                label: d.name,
                name: d.role_id,
            }));
            formState.projectRole = res.results[0].role_id;
        };
        const addMember = async () => {
            try {
                if (props.isProjectGroup) {
                    await SpaceConnector.client.identity.projectGroup.member.add({
                        project_group_id: props.projectGroupId,
                        role_id: formState.projectRole,
                        users: formState.users,
                        labels: formState.labels,
                        is_external_user: state.activeTab !== FORM_MODE.INTERNAL_USER,
                    });
                } else {
                    await SpaceConnector.client.identity.project.member.add({
                        project_id: state.projectId,
                        role_id: formState.projectRole,
                        users: formState.users,
                        labels: formState.labels,
                        is_external_user: state.activeTab !== FORM_MODE.INTERNAL_USER,
                    });
                }
                showSuccessMessage(i18n.t('PROJECT.DETAIL.MEMBER.ALS_S_ADD_MEMBER'), '', root);
            } catch (e) {
                showErrorMessage(i18n.t('PROJECT.DETAIL.MEMBER.ALT_E_ADD_MEMBER'), e);
            } finally {
                emit('confirm');
                state.proxyVisible = false;
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
                        project_id: state.projectId,
                    });
                }
                state.members = res.results;
            } catch (e) {
                state.members = [];
                console.error(e);
            }
        };
        const listExternalUser = debounce(async () => {
            if (!state.externalItems.length && !state.searchText.length) return;
            try {
                state.loading = true;
                const res = await SpaceConnector.client.identity.user.find({
                    search: {
                        keyword: state.searchText,
                    },
                });
                setExternalMenuItems(res.results);
            } catch (e) {
                state.externalItems = [];
                console.error(e);
            } finally {
                state.loading = false;
            }
        }, 300);

        /* event */
        const onClickDeleteAllUsers = () => {
            formState.userItems = [];
        };
        const onClickDeleteUser = (index) => {
            formState.userItems.splice(index, 1);
        };
        const onDeleteLabel = (index) => {
            formState.labels.splice(index, 1);
        };
        const onAddLabel = async () => {
            let labelText = state.labelText;
            labelText = labelText.trim();

            if (!labelText) return;
            if (!state.isLabelValid) return;
            if (!formState.labels.every(tag => tag !== labelText)) return;
            if (formState.labels.length >= 5) return;

            formState.labels.push(labelText);
            state.labelText = '';
        };
        const onSearchExternalUser = (text) => {
            if (text.length) {
                listExternalUser();
            } else {
                state.searchText = text;
            }
        };
        const onKeydownEnter = () => {
            if (state.searchText.trim().length && !formState.users.includes(state.searchText)) {
                validateExternalUser(state.searchText);
                formState.userItems.push({ name: state.searchText, label: state.searchText });
            }
        };
        const onFocusExternalUserSearch = () => {
            listExternalUser();
        };

        (async () => {
            await getRoleList();
        })();
        (async () => {
            await listMember();
            setInternalMenuItems();
        })();

        watch(() => state.activeTab, () => {
            formState.userItems = [];
            state.externalItems = [];
        });
        watch(() => state.searchText, () => {
            listExternalUser();
        });

        return {
            ...toRefs(state),
            formState,
            FORM_MODE,
            addMember,
            onClickDeleteAllUsers,
            onClickDeleteUser,
            onAddLabel,
            onDeleteLabel,
            onSearchExternalUser,
            onKeydownEnter,
            onFocusExternalUserSearch,
        };
    },
};
</script>

<style lang="postcss" scoped>
.project-member-add-modal {
    .p-box-tab::v-deep {
        .tab-pane {
            padding: 0;
        }
    }
    .form-wrapper {
        @apply grid grid-cols-12;
        height: 30rem;
        gap: 2rem;

        .title {
            font-size: 1.375rem;
            line-height: 1.45;
            padding-bottom: 0.25rem;
        }
        .text {
            font-size: 0.875rem;
            line-height: 1.5;
        }
        .member-wrapper {
            @apply col-span-6;

            .p-search-dropdown::v-deep {
                margin: 1rem 0;

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
                .context-item {
                    &.empty {
                        height: 8rem;
                        align-items: baseline;
                    }
                }
            }
            .p-data-table::v-deep {
                height: 20.75rem;

                .no-data {
                    height: 6rem;
                }
                .td-wrapper {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    .text {
                        @apply truncate;
                        max-width: 17.5rem;
                        display: inline-block;
                        align-items: center;
                        &.invalid {
                            @apply text-alert;
                            max-width: 14rem;
                            padding-left: 0.5rem;
                        }
                    }
                }
                .delete-button-wrapper {
                    height: 100%;
                    text-align: right;
                    padding-top: 0.125rem;
                    padding-right: 1rem;
                }
                .delete-button {
                    float: right;
                }
            }
        }
        .base-info-wrapper {
            @apply col-span-6;

            .field-group-wrapper {
                padding-top: 1.125rem;

                .label-input-wrapper {
                    display: flex;
                    gap: 0.5rem;
                }
            }
        }
    }
}
</style>
