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
import {
    PropType, reactive, toRefs,
} from '@vue/composition-api';

import {
    PButtonModal, PFieldGroup, PSearchDropdown, PTextInput,
} from '@spaceone/design-system';
import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { useProxyValue } from '@/common/composables/proxy-state';
import { useFormValidator } from '@/common/composables/form-validator';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { MemberItem } from '@/services/project/project-detail/project-member/type';
import { i18n } from '@/translations';
import { SelectedItem as InputItem } from '@spaceone/design-system/dist/src/inputs/input/type';


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
            labels: [] as InputItem[],
            selectedRoleItems: [] as MenuItem[],
        }, {
            selectedRoleItems: (val: MenuItem[]) => {
                if (!val.length) return i18n.t('PROJECT.DETAIL.MEMBER.MODAL_VALIDATION_REQUIRED');
                return true;
            },
            labels: (val: InputItem[]) => {
                const invalidItems = val.filter(d => d.invalid);
                if (invalidItems.length) return invalidItems[invalidItems.length - 1]?.invalidText || '';
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
                    labels: labels.value.map(d => d.value),
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
                ErrorHandler.handleRequestError(e, i18n.t('PROJECT.DETAIL.ALT_E_UPDATE_MEMBER'));
            }
        };
        const updateMember = async () => {
            const params: any = {
                user_id: state.userId,
                labels: labels.value.map(d => d.value),
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
                ErrorHandler.handleRequestError(e, i18n.t('PROJECT.DETAIL.ALT_E_UPDATE_MEMBER'));
            }
        };

        /* Event */
        const handleUpdateLabel = (inputLabels: InputItem[]) => {
            const _labels = [...inputLabels];
            _labels.forEach((label) => {
                label.invalid = label.duplicated;
                label.invalidText = i18n.t('PROJECT.DETAIL.MEMBER.DUPLICATED_VALUE');
            });
            setForm('labels', inputLabels);
        };
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
            setForm('labels', props.selectedMember?.labels?.map(label => ({ value: label, label })) || []);
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
            handleUpdateLabel,
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
