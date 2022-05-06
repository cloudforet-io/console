<template>
    <p-button-modal
        :header-title="$t('PROJECT.DETAIL.MODAL_UPDATE_MEMBER_TITLE')"
        :centered="true"
        size="md"
        :fade="true"
        :backdrop="true"
        :visible.sync="proxyVisible"
        :disabled="!validationState.isAllValid"
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
                               :invalid="!validationState.isRoleValid"
                >
                    <template #default="{invalid}">
                        <p-search-dropdown
                            :menu="roleItems"
                            :selected.sync="formState.roleItems"
                            type="radioButton"
                            use-fixed-menu-style
                            :invalid="invalid"
                        />
                    </template>
                </p-field-group>
                <p-field-group
                    :label="$t('PROJECT.DETAIL.MEMBER.LABEL_LABEL')"
                    :help-text="$t('PROJECT.DETAIL.MEMBER.LABEL_HELP_TEXT')"
                    :invalid="!validationState.isLabelValid"
                    :invalid-text="validationState.labelInvalidText"
                >
                    <div>
                        <!-- TODO: need tag input -->
                        {{ formState.labels }}
                    </div>
                </p-field-group>
            </div>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs,
} from '@vue/composition-api';

import {
    PButtonModal, PFieldGroup, PSearchDropdown,
} from '@spaceone/design-system';
import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';
import { i18n } from '@/translations';


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
        item: {
            type: Object,
            default: () => ({
                properties: {},
            }),
        },
        selectedMember: {
            type: Object,
            default: () => ({
                properties: {},
            }),
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
    setup(props, { emit, root }) {
        const state = reactive({
            loading: false,
            proxyVisible: useProxyValue('visible', props, emit),
            roleItems: [] as MenuItem[],
            labelText: '',
            userId: '',
        });
        const formState = reactive({
            roleItems: [] as MenuItem[],
            labels: [] as string[],
        });
        const validationState = reactive({
            isRoleValid: computed(() => !!formState.roleItems.length),
            isLabelValid: computed(() => !validationState.labelInvalidText),
            labelInvalidText: computed(() => {
                if (formState.labels.includes(state.labelText)) {
                    return i18n.t('PROJECT.DETAIL.MEMBER.ALREADY_EXISTING');
                }
                if (formState.labels.length > 5) {
                    return i18n.t('PROJECT.DETAIL.MEMBER.LABEL_HELP_TEXT');
                }
                return '';
            }),
            isAllValid: computed(() => validationState.isRoleValid && validationState.isLabelValid),
        });

        /* Api */
        const listRole = async () => {
            const res = await SpaceConnector.client.identity.role.list({
                role_type: 'PROJECT',
            });
            state.roleItems = res.results.map(d => ({
                type: 'item',
                label: d.name,
                name: d.role_id,
            }));
        };

        /* Event */
        const handleConfirm = async () => {
            if (!validationState.isAllValid) return;
            try {
                const params: any = {
                    role_id: formState.roleItems[0].name,
                    user_id: state.userId,
                    labels: formState.labels,
                };
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
                if (props.isProjectGroup) ErrorHandler.handleRequestError(e, i18n.t('PROJECT.DETAIL.ALT_E_UPDATE_GROUP_MEMBER'));
                else ErrorHandler.handleRequestError(e, i18n.t('PROJECT.DETAIL.ALT_E_UPDATE_MEMBER'));
            } finally {
                emit('confirm');
                state.proxyVisible = false;
            }
        };

        /* Init */
        const initForm = () => {
            state.userId = props.selectedMember.user_id;
            const roleId = props.selectedMember.role_info?.role_id;
            formState.roleItems = state.roleItems.filter(d => d.name === roleId);
            formState.labels = props.selectedMember.labels;
        };

        (async () => {
            await listRole();
            await initForm();
        })();

        return {
            ...toRefs(state),
            formState,
            validationState,
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
