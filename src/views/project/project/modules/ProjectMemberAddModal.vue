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
                        {{ $t('PROJECT.DETAIL.MEMBER.ADD_MEMBER_MEMBER_HELP_TEXT_1') }}
                    </p>
                    <p class="comment">
                        {{ $t('PROJECT.DETAIL.MEMBER.ADD_MEMBER_MEMBER_HELP_TEXT_2') }}
                    </p>
                    <p-search-dropdown
                        v-show="activeTab === FORM_MODE.INTERNAL_USER"
                        type="checkbox"
                        :menu="internalItems"
                        :selected.sync="formState.users"
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
                        :selected.sync="formState.users"
                        :show-selected-list="true"
                        :show-tag-box="false"
                        :show-select-all="true"
                        disable-handler
                        :exact-mode="false"
                        :disable-icon="!!searchPrefix"
                        :visible-menu.sync="visibleMenu"
                        :is-focused.sync="isFocused"
                        use-fixed-menu-style
                        :class="{ 'hide-context-menu': !searchPrefix.length }"
                        @search="onSearchExternalUser"
                        @keydown.delete="onDeleteSearchPrefix"
                    >
                        <template #search-left>
                            <p-tag v-if="searchPrefix.length"
                                   class="search-prefix-tag"
                                   :deletable="false"
                                   :class="{active: isFocused}"
                            >
                                <span>{{ searchPrefix }}</span>
                            </p-tag>
                        </template>
                        <template #menu-no-data-format>
                            <div class="external-user-no-data">
                                <div v-if="searchPrefix.length && !loading">
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
                                          @click="onClickDeleteAll"
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
                                <span v-else-if="activeTab !== FORM_MODE.INTERNAL_USER" class="text">
                                    {{ externalUserMap.find(d => d.name === item).label }}
                                </span>
                                <p-icon-button class="delete-button"
                                               name="ic_delete"
                                               @click="onClickDelete(index)"
                                />
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
                        {{ $t('PROJECT.DETAIL.MEMBER.ADD_MEMBER_BASE_INFO_HELP_TEXT') }}
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
import {
    makeProxy,
} from '@spaceone/console-core-lib';

import {
    reactive, toRefs, computed, watch,
} from '@vue/composition-api';

import {
    PButtonModal, PFieldGroup, PTextInput, PButton, PBoxTab, PSearchDropdown, PDataTable, PIconButton, PRadio, PTag, PI,
} from '@spaceone/design-system';
import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { i18n } from '@/translations';
import { store } from '@/store';


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
        PTextInput,
        PButton,
        PBoxTab,
        PSearchDropdown,
        PDataTable,
        PIconButton,
        PRadio,
        PTag,
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
            users: [],
            labels: [] as string[],
        });
        const state = reactive({
            loading: false,
            projectId: computed(() => root.$route.params.id),
            authType: computed(() => store.state.domain.extendedAuthType),
            users: computed(() => store.state.resource.user.items),
            externalUsers: [],
            members: [] as any,
            //
            tabs: computed(() => {
                const tabs = [
                    {
                        name: FORM_MODE.INTERNAL_USER,
                        label: i18n.t('PROJECT.DETAIL.MEMBER.ADD_FROM_INTERNAL_USER'),
                    },
                ];
                if (state.authType === 'GOOGLE_OAUTH2') {
                    // tabs.push({
                    //     name: FORM_MODE.GOOGLE_OAUTH2,
                    //     label: i18n.t('PROJECT.DETAIL.MEMBER.ADD_FROM_GOOGLE_OAUTH2'),
                    // });
                } else if (state.authType === 'KEYCLOAK') {
                    tabs.push({
                        name: FORM_MODE.KEYCLOAK,
                        label: i18n.t('PROJECT.DETAIL.MEMBER.ADD_FROM_KEYCLOAK'),
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
            externalUserMap: [], // to match name and label of external users
            searchPrefix: '',
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
            isAllValid: computed(() => formState.users.length > 0),
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
                state.externalUserMap.push(singleItem);
            });
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
                showErrorMessage(i18n.t('PROJECT.DETAIL.MEMBER.ALT_E_ADD_MEMBER'), e, root);
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
        const listExternalUser = async () => {
            try {
                state.loading = true;
                const res = await SpaceConnector.client.identity.user.find({
                    search: {
                        keyword: state.searchPrefix,
                    },
                });
                await setExternalMenuItems(res.results);
            } catch (e) {
                state.externalItems = [];
                console.error(e);
            } finally {
                state.loading = false;
                state.visibleMenu = true;
                state.isFocused = true;
            }
        };

        /* event */
        const onClickDeleteAll = () => {
            formState.users = [];
        };
        const onClickDelete = (index) => {
            formState.users.splice(index, 1);
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
                state.searchPrefix = text;
                listExternalUser();
            } else {
                state.searchText = text;
            }
        };
        const onDeleteSearchPrefix = () => {
            if (!state.searchText && state.searchPrefix.length) {
                state.searchPrefix = '';
                listExternalUser();
            }
        };

        (async () => {
            await getRoleList();
        })();
        (async () => {
            await listMember();
            await setInternalMenuItems();
        })();

        watch(() => state.activeTab, () => {
            formState.users = [];
            state.externalItems = [];
            state.searchPrefix = '';
        });

        return {
            ...toRefs(state),
            formState,
            FORM_MODE,
            addMember,
            onClickDeleteAll,
            onClickDelete,
            onAddLabel,
            onDeleteLabel,
            onSearchExternalUser,
            onDeleteSearchPrefix,
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
        }
        .text {
            font-size: 0.875rem;
            line-height: 1.5;
        }
        .comment {
            @apply text-gray-500;
            font-size: 0.75rem;
            line-height: 1.5;
        }
        .member-wrapper {
            @apply col-span-6;

            .p-search-dropdown::v-deep {
                margin: 1rem 0;

                &.hide-context-menu {
                    .p-context-menu {
                        display: none;
                    }
                }
                .search-prefix-tag {
                    &.active {
                        @apply bg-blue-300;
                    }
                    .text {
                        @apply truncate;
                        max-width: 6.75rem;
                    }
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
                .search-help-text {
                    position: absolute;
                    left: 0.5rem;
                    top: 0.25rem;
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
                        display: flex;
                        align-items: center;
                        white-space: initial;
                        max-width: 17rem;
                        margin: 0.5rem 0;
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
