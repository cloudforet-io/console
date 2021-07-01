<template>
    <p-button-modal
        :header-title="$t('PROJECT.DETAIL.MODAL_UPDATE_MEMBER_TITLE')"
        :centered="true"
        size="md"
        :fade="true"
        :backdrop="true"
        :visible.sync="proxyVisible"
        @confirm="confirm($event)"
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
                <p-field-group
                    :label="$t('PROJECT.DETAIL.PROJECT_ROLE')"
                    :required="true"
                    :invalid="validationState.isProjectRoleValid === false"
                    :invalid-text="validationState.projectRoleCheckInvalidText"
                    class="dropdown"
                >
                    <template #default="{invalid}">
                        <p-select-dropdown v-model="projectRole"
                                           :items="projectRoleList"
                                           :disabled="projectRoleList.length < 1"
                                           use-fixed-menu-style
                        >
                            {{ $t('PROJECT.DETAIL.MODAL_VALIDATION_SELECT_ROLE') }}
                        </p-select-dropdown>
                    </template>
                </p-field-group>
                <div class="label-text-wrapper">
                    <span class="label-text">
                        {{ $t('PROJECT.DETAIL.PROJECT_MEMBER_LABEL') }}
                    </span>
                    <span class="label-help-msg">
                        Up to 5 Labels
                    </span>
                </div>
                <div class="label-input-wrapper">
                    <p-text-input v-model="memberLabel" block
                                  :placeholder="'Ex. Developer'"
                                  @keyup.enter="addMemberLabel"
                    />
                    <p-button class="icon-button" style-type="gray900"
                              @click="addMemberLabel"
                    >
                        <p-i name="ic_plus" width="1.5rem" height="1.5rem"
                             color="inherit"
                        />
                    </p-button>
                </div>
                <p class="tag-wrapper">
                    <p-tag v-for="(tag, idx) in labelTagTools.tags" :key="`label-tag-${tag}`"
                           class="tag"
                           @delete="labelTagTools.deleteTag(idx)"
                    >
                        {{ tag }}
                    </p-tag>
                </p>
            </div>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import {
    makeProxy,
} from '@/lib/compostion-util';

import {
    ComponentRenderProxy, computed,
    getCurrentInstance,
    reactive, ref, Ref, toRefs,
} from '@vue/composition-api';

import {
    PButtonModal, PTag, PSearchTable, PSelectDropdown, PFieldGroup, PTextInput, PButton, PI,
} from '@spaceone/design-system';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { isEqual } from 'lodash';
import { SpaceConnector } from '@/lib/space-connector';
import VueI18n from 'vue-i18n';

import TranslateResult = VueI18n.TranslateResult;

const tagList = (proxyTags?: Ref<string[]>|null, checkDuplicate = true) => {
    const tags: Ref<any[]> = proxyTags || ref([]);
    if (!tags.value) tags.value = [];

    /**
     * @param idx {Number}
     */
    const deleteTag = (idx: number) => {
        const updatedTags = [...tags.value];
        updatedTags.splice(idx, 1);
        tags.value = updatedTags;
    };

    const deleteAllTags = () => {
        tags.value = [];
    };

    const validation = value => tags.value.every(tag => !isEqual(tag, value));

    /**
     * @param value {String}
     */
    const addTag = (value) => {
        const val = (typeof value === 'string') ? value.trim() : value;
        if (!val || val === '') return;
        if (checkDuplicate && !validation(val)) return;
        const updatedTags = [...tags.value];
        updatedTags.push(val);
        tags.value = updatedTags;
    };

    return reactive({
        tags,
        deleteTag,
        addTag,
        deleteAllTags,
    });
};

export default {
    name: 'ProjectMemberUpdateModal',
    components: {
        PButtonModal,
        PTag,
        PSelectDropdown,
        PFieldGroup,
        PTextInput,
        PButton,
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
    },
    setup(props, { emit, root }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const state = reactive({
            loading: false,
            projectRole: '',
            projectRoleList: [] as any[],
            memberLabel: '',
            userId: '',
        });
        const validationState = reactive({
            isProjectRoleValid: undefined as undefined | boolean,
            projectRoleCheckInvalidText: '' as TranslateResult | string,
            isLabelValid: undefined as undefined | boolean,
            labelInvalidText: '' as TranslateResult | string,
        });
        const formState = reactive({
            labelTagTools: tagList(null),
        });
        const proxyVisible = makeProxy('visible', props, emit);
        const projectId = root.$route.params.id;

        const getRoleList = async () => {
            const res = await SpaceConnector.client.identity.role.list({
                // eslint-disable-next-line camelcase
                role_type: 'PROJECT',
            });
            state.projectRoleList = res.results.map(d => ({
                type: 'item',
                label: d.name,
                name: d.role_id,
            }));
        };

        const checkProjectRole = async () => {
            if (state.projectRole === '') {
                validationState.isProjectRoleValid = false;
                validationState.projectRoleCheckInvalidText = vm.$t('PROJECT.DETAIL.MODAL_VALIDATION_SELECT_ROLE');
            } else {
                validationState.isProjectRoleValid = true;
                validationState.projectRoleCheckInvalidText = '';
            }
        };

        const addMemberLabel = () => {
            formState.labelTagTools.addTag(state.memberLabel);
            state.memberLabel = '';
        };

        const checkLabel = async () => {
            if (formState.labelTagTools.tags.length > 5) {
                validationState.isLabelValid = false;
                validationState.labelInvalidText = 'Up to 5 labels';
            } else {
                validationState.isLabelValid = true;
                validationState.labelInvalidText = '';
            }
        };

        const editProjectMember = async (labels) => {
            await SpaceConnector.client.identity.project.member.modify({
                project_id: projectId,
                role_id: state.projectRole,
                user_id: state.userId,
                labels,
            });
            showSuccessMessage(vm.$t('PROJECT.DETAIL.ALT_S_ADD_MEMBER'), '', root);
        };

        const editProjectGroupMember = async (labels) => {
            await SpaceConnector.client.identity.projectGroup.member.modify({
                project_group_id: props.projectGroupId,
                role_id: state.projectRole,
                user_id: state.userId,
                labels,
            });
            showSuccessMessage('Successfully modified project group member', '', root);
        };

        const confirm = async () => {
            const labels = formState.labelTagTools.tags;

            await checkProjectRole();
            await checkLabel();

            if (validationState.isProjectRoleValid && validationState.isLabelValid) {
                try {
                    if (props.isProjectGroup) await editProjectGroupMember(labels);
                    else await editProjectMember(labels);
                } catch (e) {
                    showErrorMessage(vm.$t('PROJECT.DETAIL.ALT_E_ADD_MEMBER'), e, root);
                } finally {
                    emit('confirm');
                    proxyVisible.value = false;
                }
            }
        };

        const setCurrentProjectRole = async () => {
            if (props.selectedMember.role_info?.name === state.projectRoleList[0].label) {
                state.projectRole = state.projectRoleList[0].name;
            } else {
                state.projectRole = '';
            }
        };

        const setCurrentUserIdAndLabel = async () => {
            state.userId = props.selectedMember.user_id;
            if (props.selectedMember.labels) formState.labelTagTools.tags = props.selectedMember.labels;
        };


        (async () => {
            await getRoleList();
            await Promise.all([setCurrentProjectRole(), setCurrentUserIdAndLabel()]);
        })();

        return {
            ...toRefs(state),
            ...toRefs(formState),
            validationState,
            confirm,
            addMemberLabel,
            proxyVisible,
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
