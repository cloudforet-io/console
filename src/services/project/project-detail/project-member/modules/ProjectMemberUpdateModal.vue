<template>
    <p-button-modal
        :header-title="$t('PROJECT.DETAIL.MODAL_UPDATE_MEMBER_TITLE')"
        :centered="true"
        size="md"
        :fade="true"
        :backdrop="true"
        :visible.sync="proxyVisible"
        :disabled="!isAllValid || isLabelDuplicated"
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
                <p-field-group :label="$t('PROJECT.DETAIL.MEMBER.ROLE')"
                               required
                               :invalid="invalidState.selectedRoleItems"
                               :invalid-text="invalidTexts.selectedRoleItems"
                >
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
                    <template #label-extra>
                        <span v-if="showRoleWarning"
                              class="role-warning-text"
                        >{{ $t('PROJECT.DETAIL.MEMBER.ROLE_WARNING') }}</span>
                    </template>
                </p-field-group>
                <p-field-group
                    :label="$t('PROJECT.DETAIL.MEMBER.LABEL_LABEL')"
                    :help-text="$t('PROJECT.DETAIL.MEMBER.LABEL_HELP_TEXT')"
                    :invalid="invalidState.labels || isLabelDuplicated"
                    :invalid-text="invalidTexts.labels || $t('PROJECT.DETAIL.MEMBER.DUPLICATED_VALUE')"
                >
                    <template #default="{invalid}">
                        <p-text-input :selected="labels"
                                      :invalid="invalid"
                                      multi-input
                                      appearance-type="stack"
                                      block
                                      @update="handleUpdateLabel"
                        />
                    </template>
                </p-field-group>
            </div>
        </template>
    </p-button-modal>
</template>

<script lang="ts">

import { reactive, ref, toRefs } from 'vue';
import type { PropType, SetupContext } from 'vue';

import {
    PButtonModal, PFieldGroup, PFilterableDropdown, PTextInput,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import type { MenuItem as InputItem } from '@spaceone/design-system/types/inputs/input/text-input/type';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { i18n } from '@/translations';

import { PAGE_PERMISSION_TYPE } from '@/lib/access-control/config';
import { getPagePermissionMapFromRaw } from '@/lib/access-control/page-permission-helper';
import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';
import { useProxyValue } from '@/common/composables/proxy-state';

import type { MemberItem } from '@/services/project/project-detail/project-member/type';

export default {
    name: 'ProjectMemberUpdateModal',
    components: {
        PButtonModal,
        PFieldGroup,
        PFilterableDropdown,
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
    setup(props, { emit }: SetupContext) {
        const state = reactive({
            loading: false,
            proxyVisible: useProxyValue('visible', props, emit),
            roleItems: [] as MenuItem[],
            labelText: '',
            userId: '',
            showRoleWarning: false,
        });
        const isLabelDuplicated = ref<boolean>(false);
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
                state.roleItems = results.map((d) => ({
                    type: 'item',
                    label: d.name,
                    name: d.role_id,
                    pagePermissions: d.page_permissions,
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
                    labels: labels.value.map((d) => d.name),
                };
                if (props.isProjectGroup) {
                    params.project_group_id = props.projectGroupId;
                    await SpaceConnector.client.identity.projectGroup.member.add(params);
                    showSuccessMessage(i18n.t('PROJECT.DETAIL.ALT_S_UPDATE_GROUP_MEMBER'), '');
                } else {
                    params.project_id = props.projectId;
                    await SpaceConnector.client.identity.project.member.add(params);
                    showSuccessMessage(i18n.t('PROJECT.DETAIL.ALT_S_UPDATE_MEMBER'), '');
                }
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('PROJECT.DETAIL.ALT_E_UPDATE_MEMBER'));
            }
        };
        const updateMember = async () => {
            const params: any = {
                user_id: state.userId,
                labels: labels.value.map((d) => d.name),
            };
            try {
                if (props.isProjectGroup) {
                    params.project_group_id = props.projectGroupId;
                    await SpaceConnector.client.identity.projectGroup.member.modify(params);
                    showSuccessMessage(i18n.t('PROJECT.DETAIL.ALT_S_UPDATE_GROUP_MEMBER'), '');
                } else {
                    params.project_id = props.projectId;
                    await SpaceConnector.client.identity.project.member.modify(params);
                    showSuccessMessage(i18n.t('PROJECT.DETAIL.ALT_S_UPDATE_MEMBER'), '');
                }
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('PROJECT.DETAIL.ALT_E_UPDATE_MEMBER'));
            }
        };

        /* Event */
        const handleUpdateLabel = (inputLabels: InputItem[], isValid: boolean) => {
            isLabelDuplicated.value = !isValid;
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
        const handleSelectRoleItems = (roleItems) => {
            if (!roleItems.length) return;
            const roleItem: any = state.roleItems.find((d) => d?.name === roleItems[0]?.name);
            const pagePermissionMap = getPagePermissionMapFromRaw(roleItem.pagePermissions);
            setForm('selectedRoleItems', [roleItem]);
            state.showRoleWarning = !pagePermissionMap.project || pagePermissionMap.project === PAGE_PERMISSION_TYPE.VIEW;
        };

        /* Init */
        const initForm = () => {
            state.userId = props.selectedMember.resource_id;
            const roleId = props.selectedMember.role_info?.role_id;
            setForm('selectedRoleItems', state.roleItems.filter((d) => d.name === roleId));
            setForm('labels', props.selectedMember?.labels?.map((label) => ({ name: label, label })) || []);
        };

        (async () => {
            await listRole();
            await initForm();
        })();

        return {
            ...toRefs(state),
            //
            labels,
            isLabelDuplicated,
            selectedRoleItems,
            invalidState,
            invalidTexts,
            setForm,
            isAllValid,
            //
            handleConfirm,
            handleUpdateLabel,
            handleSelectRoleItems,
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

.p-dropdown-menu-btn {
    @apply bg-white;
    max-width: 14rem;
}

.role-warning-text {
    @apply text-red-500;
    font-size: 0.75rem;
    padding-left: 0.5rem;
}
</style>
