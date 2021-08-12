<template>
    <p-button-modal
        class="project-member-add-modal"
        :header-title="$tc('PROJECT.DETAIL.MEMBER.ADD_MEMBER', items.length)"
        :fade="true"
        :backdrop="true"
        :visible.sync="proxyVisible"
        :disabled="!isAllValid"
        @confirm="confirm"
    >
        <template #body>
            <p-box-tab v-model="activeTab" :tabs="tabs">
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
                            type="checkbox"
                            :menu="items"
                            :selected="formState.users"
                            :show-selected-list="true"
                            :show-tag-box="false"
                            :show-select-all="true"
                            use-fixed-menu-style
                        />
                        <p-data-table
                            :fields="fields"
                            :items="formState.users"
                        >
                            <template #th-delete>
                                <div class="delete-button-wrapper">
                                    <p-button style-type="primary-dark"
                                              :outline="true"
                                              size="sm"
                                              @click="onClickDeleteAll"
                                    >
                                        {{ $t('PROJECT.DETAIL.MEMBER.DELETE_ALL') }}
                                    </p-button>
                                </div>
                            </template>
                            <template #col-user_id-format="{ item }">
                                {{ items.find(d => d.name === item).label }}
                            </template>
                            <template #col-delete-format="{ index }">
                                <p-icon-button class="delete-button"
                                               name="ic_delete"
                                               @click="onClickDelete(index)"
                                />
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
                            >
                                <div class="label-input-wrapper">
                                    <p-text-input v-model="labelText"
                                                  :placeholder="$t('PROJECT.DETAIL.MEMBER.LABEL_PLACEHOLDER')"
                                                  block
                                                  @keyup.enter="onAddLabel"
                                    />
                                    <p-button style-type="gray900"
                                              :outline="true"
                                              :disabled="!labelText.trim().length || formState.labels.length >= 5"
                                              @click="onAddLabel"
                                    >
                                        {{ $t('PROJECT.DETAIL.MEMBER.ADD') }}
                                    </p-button>
                                </div>
                                <p class="tag-wrapper">
                                    <p-tag v-for="(label, lIdx) in formState.labels" :key="`label-tag-${lIdx}`"
                                           @delete="onDeleteLabel(lIdx)"
                                    >
                                        {{ label }}
                                    </p-tag>
                                </p>
                            </p-field-group>
                        </div>
                    </div>
                </div>
            </p-box-tab>
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
    PButtonModal, PFieldGroup, PTextInput, PButton, PBoxTab, PSearchDropdown, PDataTable, PIconButton, PRadio, PTag,
} from '@spaceone/design-system';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { i18n } from '@/translations';
import { store } from '@/store';


const FORM_MODE = Object.freeze({
    INTERNAL_USER: 'INTERNAL_USER',
    KEYCLOAK: 'KEYCLOAK',
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
            projectId: computed(() => root.$route.params.id),
            tabs: computed(() => ([
                {
                    name: FORM_MODE.INTERNAL_USER,
                    label: i18n.t('PROJECT.DETAIL.MEMBER.ADD_FROM_INTERNAL_USER'),
                },
                {
                    name: FORM_MODE.KEYCLOAK,
                    label: i18n.t('PROJECT.DETAIL.MEMBER.ADD_FROM_KEYCLOAK'),
                },
            ])),
            activeTab: FORM_MODE.INTERNAL_USER,
            fields: computed(() => [
                { name: 'user_id', label: i18n.t('PROJECT.DETAIL.MEMBER.USER_ID'), type: 'item' },
                { name: 'delete', label: '', type: 'item' },
            ]),
            users: computed(() => store.state.resource.user.items),
            projectRoles: [],
            items: computed(() => Object.keys(state.users).map((k) => {
                const userName = state.users[k]?.name;
                return {
                    name: k,
                    label: userName ? `${k} (${userName})` : k,
                };
            })),
            labelText: '',
            totalCount: 0,
            proxyVisible: makeProxy('visible', props, emit),
            isAllValid: computed(() => formState.users.length > 0),
        });

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
        const addMemberFromInternalUser = async () => {
            try {
                if (props.isProjectGroup) {
                    await SpaceConnector.client.identity.projectGroup.member.add({
                        project_group_id: props.projectGroupId,
                        role_id: formState.projectRole,
                        users: formState.users,
                        labels: formState.labels,
                    });
                } else {
                    await SpaceConnector.client.identity.project.member.add({
                        project_id: state.projectId,
                        role_id: formState.projectRole,
                        users: formState.users,
                        labels: formState.labels,
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
        const addMemberFromKeycloak = async () => {
            // todo
            console.log('add member from keycloak');
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
            if (!formState.labels.every(tag => tag !== labelText)) return;
            if (formState.labels.length >= 5) return;

            formState.labels.push(labelText);
            state.labelText = '';
        };
        const confirm = async () => {
            if (state.activeTab === FORM_MODE.INTERNAL_USER) {
                await addMemberFromInternalUser();
            } else {
                await addMemberFromKeycloak();
            }
        };

        (async () => {
            await getRoleList();
        })();

        watch(() => state.activeTab, () => {
            formState.users = [];
        });

        return {
            ...toRefs(state),
            formState,
            confirm,
            onClickDeleteAll,
            onClickDelete,
            onAddLabel,
            onDeleteLabel,
        };
    },
};
</script>

<style lang="postcss" scoped>
.project-member-add-modal {
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

            .p-search-dropdown {
                margin: 1rem 0;
            }
            .p-data-table {
                height: 20rem;

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
                    margin-bottom: 1rem;
                }
            }
        }
    }
}
</style>
