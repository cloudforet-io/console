<template>
    <p-button-modal
        :header-title="$t('PROJECT.DETAIL.MODAL_UPDATE_MEMBER_TITLE')"
        :centered="true"
        size="md"
        :fade="true"
        :backdrop="true"
        :visible.sync="proxyVisible"
        :disabled="!isAllValid"
        @confirm="handleConfirm"
    >
        <template #body>
            <div class="field-group-wrapper">
                <p class="user-id-wrapper">
                    <span class="user-id-label">
                        {{ $t('IDENTITY.USER.MAIN.USER_ID') }}
                    </span>
                    <span class="user-id-content">
                        {{ userId }}
                    </span>
                </p>
                <p-field-group label="Role"
                               required
                               :invalid="invalidState.selectedRoleItems"
                               :invalid-text="invalidTexts.selectedRoleItems"
                >
                    <template #default="{invalid}">
                        <p-search-dropdown
                            :menu="roleItems"
                            :selected="selectedRoleItems"
                            type="radioButton"
                            use-fixed-menu-style
                            :invalid="invalid"
                            @update:selected="setForm('selectedRoleItems', $event)"
                        />
                    </template>
                </p-field-group>
                <p-field-group
                    :label="$t('PROJECT.DETAIL.MEMBER.LABEL_LABEL')"
                    :help-text="$t('PROJECT.DETAIL.MEMBER.LABEL_HELP_TEXT')"
                    :invalid="invalidState.labels"
                    :invalid-text="invalidTexts.labels"
                >
                    <div>
                        <!-- TODO: need tag input -->
                        {{ labels }}
                    </div>
                </p-field-group>
            </div>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import {
    PropType, reactive, toRefs,
} from '@vue/composition-api';

import {
    PButtonModal, PFieldGroup, PSearchDropdown,
} from '@spaceone/design-system';
import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { useProxyValue } from '@/common/composables/proxy-state';
import { useFormValidator } from '@/common/composables/form-validator';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { MemberItem } from '@/services/project/project-detail/project-member/type';
import { i18n } from '@/translations';


interface Props {
    visible: boolean;
    selectedMember: MemberItem;
    isProjectGroup: boolean;
    projectGroupId?: string;
    projectId?: string;
}

export default {
    name: 'ProjectMemberUpdateModal',
    components: {
        PButtonModal,
        PFieldGroup,
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
        selectedMember: {
            type: Object,
            default: () => ({}) as PropType<MemberItem>,
        },
        isProjectGroup: {
            type: Boolean,
            default: false,
        },
        projectGroupId: {
            type: String,
            default: '',
        },
        projectId: {
            type: String,
            default: undefined,
        },
    },
    setup(props: Props, { emit, root }) {
        const state = reactive({
            loading: false,
            proxyVisible: useProxyValue('visible', props, emit),
            roleItems: [] as MenuItem[],
            labelText: '',
            userId: '',
        });
        const {
            forms: { labels, selectedRoleItems },
            invalidState,
            invalidTexts,
            setForm, isAllValid,
        } = useFormValidator({
            labels: [] as string[],
            selectedRoleItems: [] as MenuItem[],
        }, {
            selectedRoleItems: (val: MenuItem[]) => {
                if (!val.length) return 'Required Field'; // song-lang
                return true;
            },
            labels: (val: string[]) => {
                if (val.includes(state.labelText)) return i18n.t('PROJECT.DETAIL.MEMBER.ALREADY_EXISTING');
                if (val.length > 5) return i18n.t('PROJECT.DETAIL.MEMBER.LABEL_HELP_TEXT');
                return true;
            },
        });

        /* Api */
        const listRole = async () => {
            try {
                const { results } = await SpaceConnector.client.identity.role.list({
                    role_type: 'PROJECT',
                });
                state.roleItems = results.map(d => ({
                    type: 'item',
                    label: d.name,
                    name: d.role_id,
                }));
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        };
        const deleteMember = async () => {
            try {
                if (props.isProjectGroup) {
                    await SpaceConnector.client.identity.projectGroup.member.remove({
                        project_group_id: props.projectGroupId,
                        users: [state.userId],
                    });
                } else {
                    await SpaceConnector.client.identity.project.member.remove({
                        project_id: props.projectId,
                        users: [state.userId],
                    });
                }
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        };
        const createMember = async () => {
            try {
                const params: any = {
                    role_id: selectedRoleItems.value[0].name,
                    users: [state.userId],
                    labels: labels.value,
                };
                if (props.isProjectGroup) {
                    params.project_group_id = props.projectGroupId;
                    await SpaceConnector.client.identity.projectGroup.member.add(params);
                    showSuccessMessage(i18n.t('PROJECT.DETAIL.ALT_S_UPDATE_GROUP_MEMBER'), '', root);
                } else {
                    params.project_id = props.projectId;
                    await SpaceConnector.client.identity.project.member.add(params);
                    showSuccessMessage(i18n.t('PROJECT.DETAIL.ALT_S_UPDATE_MEMBER'), '', root);
                }
            } catch (e) {
                // song-lang
                ErrorHandler.handleRequestError(e, i18n.t('Failed to Update Member'));
            }
        };
        const updateMember = async () => {
            const params: any = {
                user_id: state.userId,
                labels: labels.value,
            };
            try {
                if (props.isProjectGroup) {
                    params.project_group_id = props.projectGroupId;
                    await SpaceConnector.client.identity.projectGroup.member.modify(params);
                    showSuccessMessage(i18n.t('PROJECT.DETAIL.ALT_S_UPDATE_GROUP_MEMBER'), '', root);
                } else {
                    params.project_id = props.projectId;
                    await SpaceConnector.client.identity.project.member.modify(params);
                    showSuccessMessage(i18n.t('PROJECT.DETAIL.ALT_S_UPDATE_MEMBER'), '', root);
                }
            } catch (e) {
                // song-lang
                ErrorHandler.handleRequestError(e, i18n.t('Failed to Update Member'));
            }
        };

        /* Event */
        const handleConfirm = async () => {
            if (!isAllValid) return;

            const originRoleId = props.selectedMember.role_info?.role_id;
            const newRoleId = selectedRoleItems.value[0].name;
            if (originRoleId !== newRoleId) {
                await deleteMember();
                await createMember();
            } else {
                await updateMember();
            }
            emit('confirm');
            state.proxyVisible = false;
        };

        /* Init */
        const initForm = () => {
            state.userId = props.selectedMember.resource_id;
            const roleId = props.selectedMember.role_info?.role_id;
            setForm('selectedRoleItems', state.roleItems.filter(d => d.name === roleId));
            setForm('labels', props.selectedMember?.labels || []);
        };

        (async () => {
            await listRole();
            await initForm();
        })();

        return {
            ...toRefs(state),
            //
            labels,
            selectedRoleItems,
            invalidState,
            invalidTexts,
            setForm,
            isAllValid,
            //
            handleConfirm,
        };
    },
};
</script>

<style lang="postcss" scoped>
.user-id-wrapper {
    margin-bottom: 1rem;
    .user-id-label {
        font-size: 0.875rem;
        line-height: 140%;
        font-weight: bold;
        margin-right: 1rem;
    }
    .user-id-content {
        font-size: 0.875rem;
        line-height: 150%;
    }
}
.label-text-wrapper {
    .label-text {
        @apply text-gray-900;
        font-size: 0.875rem;
        margin-right: 0.5rem;
        line-height: 140%;
        font-weight: bold;
    }
    .label-help-msg {
        @apply text-gray-500;
        font-size: 0.75rem;
        line-height: 150%;
    }
    margin-bottom: 0.25rem;
}

.label-input-wrapper {
    display: flex;
    margin-bottom: 1rem;
}

.icon-button::v-deep {
    @apply p-0 inline-flex justify-center items-center;
    min-width: 2rem;
    max-width: 2rem;
    min-height: 2rem;
    max-height: 2rem;
    margin-left: 0.5rem;
    align-self: center;
}

.tag-wrapper {
    min-height: 3.625rem;
}
>>> .modal-content .modal-body-container {
    overflow: auto;
}

.p-dropdown-menu-btn {
    @apply bg-white;
    max-width: 14rem;
}
.p-text-input {
    width: 25rem;
}
</style>
