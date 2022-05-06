<template>
    <!-- song-lang -->
    <p-button-modal
        class="project-member-add-modal"
        header-title="Invite Member"
        :fade="true"
        :backdrop="true"
        :visible.sync="proxyVisible"
        :disabled="!isAllValid"
        @confirm="handleConfirm"
    >
        <template #body>
            <p-box-tab v-if="authType && authType !== 'GOOGLE_OAUTH2'" v-model="activeTab" :tabs="tabs" />
            <div class="form-wrapper">
                <p class="title">
                    {{ $t('PROJECT.DETAIL.MEMBER.MEMBER') }} ({{ formState.users.length }})
                </p>
                <!-- song-lang -->
                <p-field-group label="Member" required>
                    <template #default="{invalid}">
                        <p-search-dropdown
                            v-show="activeTab === FORM_MODE.INTERNAL_USER"
                            :menu="internalItems"
                            :selected.sync="formState.userItems"
                            multi-selectable
                            use-fixed-menu-style
                        />
                        <!-- keycloak의 경우 auto-complete-input 사용 -->
                        <!--                        <p-search-dropdown-->
                        <!--                            v-show="activeTab !== FORM_MODE.INTERNAL_USER"-->
                        <!--                            v-model="searchText"-->
                        <!--                            :loading="loading"-->
                        <!--                            :menu="externalItems"-->
                        <!--                            :selected.sync="formState.userItems"-->
                        <!--                            disable-handler-->
                        <!--                            :exact-mode="false"-->
                        <!--                            multi-selectable-->
                        <!--                            use-fixed-menu-style-->
                        <!--                            @search="handleSearchExternalUser"-->
                        <!--                            @focus="handleFocusExternalUserSearch"-->
                        <!--                            @keydown.enter="handleKeydownEnter"-->
                        <!--                        >-->
                        <!--                            <template v-if="externalItems.length > 100" #menu-help-text>-->
                        <!--                                <div class="help-text">-->
                        <!--                                    {{ $t('PROJECT.DETAIL.MEMBER.TOO_MANY_RESULTS') }}-->
                        <!--                                </div>-->
                        <!--                            </template>-->
                        <!--                        </p-search-dropdown>-->
                    </template>
                </p-field-group>
                <!-- song-lang -->
                <p-field-group label="Role" required
                               help-text="Set a role for selected member"
                >
                    <p-search-dropdown
                        :menu="roleItems"
                        :selected.sync="formState.roles"
                        type="radioButton"
                        use-fixed-menu-style
                    />
                </p-field-group>
                <p-field-group
                    :label="$t('PROJECT.DETAIL.MEMBER.LABEL_LABEL')"
                    :help-text="$t('PROJECT.DETAIL.MEMBER.LABEL_HELP_TEXT')"
                    :invalid="!isLabelValid"
                    :invalid-text="labelInvalidText"
                >
                    <div>
                        tag text input
                    </div>
                </p-field-group>
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
    PButtonModal, PFieldGroup, PBoxTab, PSearchDropdown,
} from '@spaceone/design-system';
import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { i18n } from '@/translations';
import { store } from '@/store';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';


const FORM_MODE = Object.freeze({
    INTERNAL_USER: 'INTERNAL_USER',
    KEYCLOAK: 'KEYCLOAK',
    GOOGLE_OAUTH2: 'GOOGLE_OAUTH2',
});

export default {
    name: 'ProjectMemberAddModal',
    components: {
        PButtonModal,
        PFieldGroup,
        PBoxTab,
        PSearchDropdown,
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
        projectId: {
            type: String,
            default: undefined,
        },
        projectGroupId: {
            type: String,
            default: undefined,
        },
    },
    setup(props, { emit, root }) {
        const formState = reactive({
            roles: [],
            labels: [] as string[],
            userItems: [] as MenuItem[],
            users: computed(() => formState.userItems.map(item => item.name)),
        });
        const state = reactive({
            loading: false,
            authType: computed(() => store.state.domain.extendedAuthType),
            users: computed(() => store.state.reference.user.items),
            members: [] as any,
            //
            tabs: computed(() => {
                const tabs = [
                    {
                        name: FORM_MODE.INTERNAL_USER,
                        label: i18n.t('PROJECT.DETAIL.MEMBER.ADD_FROM', { user_type: i18n.t('PROJECT.DETAIL.MEMBER.INTERNAL_USER') }),
                    },
                ];
                if (state.authType === FORM_MODE.KEYCLOAK) {
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
            roleItems: [] as MenuItem[],
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
            proxyVisible: useProxyValue('visible', props, emit),
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
                if (!formState.roles.length) return false;
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
            const { results } = await SpaceConnector.client.identity.role.list({
                role_type: 'PROJECT',
            });
            state.roleItems = results.map(d => ({
                type: 'item',
                label: d.name,
                name: d.role_id,
            }));
        };
        const handleConfirm = async () => {
            try {
                if (props.isProjectGroup) {
                    await SpaceConnector.client.identity.projectGroup.member.add({
                        project_group_id: props.projectGroupId,
                        role_id: formState.roles[0].name,
                        users: formState.users,
                        labels: formState.labels,
                        is_external_user: state.activeTab !== FORM_MODE.INTERNAL_USER,
                    });
                } else {
                    await SpaceConnector.client.identity.project.member.add({
                        project_id: props.projectId,
                        role_id: formState.roles[0].name,
                        users: formState.users,
                        labels: formState.labels,
                        is_external_user: state.activeTab !== FORM_MODE.INTERNAL_USER,
                    });
                }
                showSuccessMessage(i18n.t('PROJECT.DETAIL.MEMBER.ALS_S_ADD_MEMBER'), '', root);
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('PROJECT.DETAIL.MEMBER.ALT_E_ADD_MEMBER'));
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
                ErrorHandler.handleError(e);
                state.externalItems = [];
            } finally {
                state.loading = false;
            }
        }, 300);

        /* event */
        const handleClickDeleteAllUsers = () => {
            formState.userItems = [];
        };
        const handleClickDeleteUser = (index) => {
            formState.userItems.splice(index, 1);
        };
        const handleDeleteLabel = (index) => {
            formState.labels.splice(index, 1);
        };
        const handleAddLabel = async () => {
            let labelText = state.labelText;
            labelText = labelText.trim();

            if (!labelText) return;
            if (!state.isLabelValid) return;
            if (!formState.labels.every(tag => tag !== labelText)) return;
            if (formState.labels.length >= 5) return;

            formState.labels.push(labelText);
            state.labelText = '';
        };
        const handleSearchExternalUser = (text) => {
            if (text.length) {
                listExternalUser();
            } else {
                state.searchText = text;
            }
        };
        const handleKeydownEnter = () => {
            if (state.searchText.trim().length && !formState.users.includes(state.searchText)) {
                validateExternalUser(state.searchText);
                formState.userItems.push({ name: state.searchText, label: state.searchText });
            }
        };
        const handleFocusExternalUserSearch = () => {
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

        // LOAD REFERENCE STORE
        (async () => {
            await store.dispatch('reference/user/load');
        })();

        return {
            ...toRefs(state),
            formState,
            FORM_MODE,
            handleConfirm,
            handleClickDeleteAllUsers,
            handleClickDeleteUser,
            handleAddLabel,
            handleDeleteLabel,
            handleSearchExternalUser,
            handleKeydownEnter,
            handleFocusExternalUserSearch,
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
        height: 30rem;

        .title {
            @apply text-gray-900;
            font-size: 1.375rem;
            line-height: 1.25;
            padding-bottom: 1rem;
        }
        .p-search-dropdown::v-deep {
            .help-text {
                @apply text-gray-400;
                font-size: 0.75rem;
                line-height: 1.3;
                padding: 0.25rem 0.5rem;
            }
            .context-item {
                &.empty {
                    height: 8rem;
                    align-items: baseline;
                }
            }
        }
    }
}
</style>
