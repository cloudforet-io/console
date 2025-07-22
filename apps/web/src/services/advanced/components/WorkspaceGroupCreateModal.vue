<script setup lang="ts">
import type Vue from 'vue';
import {
    computed, nextTick, reactive, ref, watch,
} from 'vue';

import { useMutation } from '@tanstack/vue-query';

import {
    PButtonModal, PFieldGroup, PTextInput, PSelectDropdown, PTooltip,
} from '@cloudforet/mirinae';

import { useWorkspaceGroupApi } from '@/api-clients/identity/workspace-group/composables/use-workspace-group-api';
import type { WorkspaceGroupCreateParameters } from '@/api-clients/identity/workspace-group/schema/api-verbs/create';
import { useWorkspaceApi } from '@/api-clients/identity/workspace/composables/use-workspace-api';
import type { WorkspaceModel } from '@/api-clients/identity/workspace/schema/model';
import { useAllReferenceDataModel } from '@/query/resource-query/reference-data-model';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import { useSelectDropDownList } from '@/services/advanced/composables/use-select-drop-down-list';
import { useWorkspaceGroupNameListQuery } from '@/services/advanced/composables/use-workspace-group-name-list-query';
import { WORKSPACE_GROUP_MODAL_TYPE } from '@/services/advanced/constants/workspace-group-constant';
import { useWorkspaceGroupPageStore } from '@/services/advanced/store/workspace-group-page-store';

import { useWorkspaceGroupChangeWorkspaceGroupMutation } from '../composables/querys/use-workspace-group-change-workspace-group-mutation';



const workspaceGroupPageStore = useWorkspaceGroupPageStore();
const workspaceGroupPageState = workspaceGroupPageStore.state;

const emit = defineEmits<{(e: 'confirm'): void,
}>();

const state = reactive({
    loading: false,
    menuIds: computed<string[]>(() => menuList.value.map((item) => item.name)),
    isSelectDropdownVisible: false,
    isEllipsisMap: {} as Record<string, boolean>,
});
const referenceMap = useAllReferenceDataModel();
const { workspaceAPI } = useWorkspaceApi();
const { workspaceGroupAPI } = useWorkspaceGroupApi();
const { data: workspaceGroupNameList } = useWorkspaceGroupNameListQuery();
const {
    forms: { groupName }, invalidState, invalidTexts, setForm,
} = useFormValidator({ groupName: '' }, {
    groupName: (value: string) => {
        if (state.loading) {
            return true;
        }
        if (!value.length) {
            return false;
        }
        if (workspaceGroupNameList.value?.includes(value.trim())) {
            return i18n.t('IAM.WORKSPACE_GROUP.MODAL.CREATE_NAME_INVALID_DUPLICATED');
        }

        return true;
    },
});
const {
    loading, searchText, menuList, selectedItems, handleClickShowMore, reset: resetWorkspaceMenuList,
} = useSelectDropDownList<WorkspaceModel>({
    pageSize: 10,
    transformer: (_workspace) => ({
        name: _workspace.workspace_id,
        label: _workspace.name,
        tags: _workspace.tags,
        is_dormant: _workspace.is_dormant,
        workspace_group_id: _workspace.workspace_group_id,
        disabled: !!_workspace.workspace_group_id,
    }),
    fetcher: (apiQueryHelper) => workspaceAPI.list({
        query: apiQueryHelper.data,
    }),
});

const { mutateAsync: createWorkspaceGroupMutation } = useMutation({
    mutationFn: (params: WorkspaceGroupCreateParameters) => workspaceGroupAPI.create(params),
    onError: (e) => {
        ErrorHandler.handleError(e, true);
    },
});

const { changeWorkspaceGroupMutation } = useWorkspaceGroupChangeWorkspaceGroupMutation();


const handleConfirm = async () => {
    state.loading = true;
    const { workspace_group_id } = await createWorkspaceGroupMutation({
        name: groupName.value,
    });
    await Promise.allSettled(selectedItems.value.map((item) => changeWorkspaceGroupMutation({
        workspace_group_id,
        workspace_id: item.name,
    })));
    await resetWorkspaceMenuList();
    state.loading = false;
    showSuccessMessage(i18n.t('IAM.WORKSPACE_GROUP.MODAL.ALT_S_CREATE_WORKSPACE'), '');
    workspaceGroupPageStore.closeModal();
    emit('confirm');
    workspaceGroupPageStore.updateModalSettings({
        type: WORKSPACE_GROUP_MODAL_TYPE.ADD_USERS,
        title: i18n.t('IAM.WORKSPACE_GROUP.MODAL.ADD_USERS_TITLE', { name: groupName.value }),
        visible: WORKSPACE_GROUP_MODAL_TYPE.ADD_USERS,
        additionalData: { workspaceGroupId: workspace_group_id, openBy: WORKSPACE_GROUP_MODAL_TYPE.CREATE },
    });
};

const handleModalClose = () => {
    workspaceGroupPageStore.closeModal();
};

const ellipsis = ref<Vue | null>(null);

watch([() => state.menuIds, () => state.isSelectDropdownVisible], async (menuIds, isSelectDropdownVisible) => {
    if (isSelectDropdownVisible) {
        await nextTick();
        menuIds[0].forEach((id) => {
            const labelTextEl = (ellipsis.value?.$el?.querySelector(`#w-${id}`)?.querySelector('.label-text') as HTMLElement);
            const clientWidth = labelTextEl?.clientWidth;
            const scrollWidth = labelTextEl?.scrollWidth;
            state.isEllipsisMap = {
                ...state.isEllipsisMap,
                [`w-${id}`]: scrollWidth > clientWidth,
            };
        });
    }
}, { immediate: true });
</script>

<template>
    <p-button-modal class="workspace-group-create-modal"
                    :header-title="workspaceGroupPageState.modal.title"
                    :visible="workspaceGroupPageState.modal.visible === WORKSPACE_GROUP_MODAL_TYPE.CREATE"
                    :loading="state.loading"
                    size="sm"
                    :disabled="(groupName === '' || invalidState.groupName)"
                    @confirm="handleConfirm"
                    @cancel="handleModalClose"
                    @close="handleModalClose"
    >
        <template #body>
            <div class="form-wrapper">
                <p-field-group
                    required
                    :label="$t('IAM.WORKSPACE_GROUP.MODAL.CREATE_GROUP_NAME')"
                    :invalid="invalidState.groupName"
                    :invalid-text="invalidTexts.groupName"
                >
                    <p-text-input :value="groupName"
                                  :placeholder="$t('IAM.WORKSPACE_GROUP.MODAL.CREATE_GROUP_NAME_PLACEHOLDER')"
                                  block
                                  @update:value="setForm('groupName', $event)"
                    />
                </p-field-group>
                <p-field-group
                    :label="$t('IAM.WORKSPACE_GROUP.MODAL.WORKSPACE_SELECT_DROP_DOWN_TITLE')"
                >
                    <template #default>
                        <div class="dropdown-wrapper">
                            <p-select-dropdown
                                ref="ellipsis"
                                :loading="loading"
                                :search-text.sync="searchText"
                                appearance-type="badge"
                                is-filterable
                                multi-selectable
                                show-delete-all-button
                                use-fixed-menu-style
                                show-select-marker
                                disable-handler
                                is-fixed-width
                                :visible-menu.sync="state.isSelectDropdownVisible"
                                :menu="menuList"
                                :selected.sync="selectedItems"
                                :placeholder="$t('IAM.WORKSPACE_GROUP.MODAL.CREATE_DROP_DOWN_PLACEHOLDER')"
                                class="workspace-select-dropdown"
                                @click-show-more="handleClickShowMore"
                            >
                                <template #menu-item--format="{ item }">
                                    <div class="menu-item-wrapper"
                                         :class="{'is-dormant': item?.is_dormant}"
                                    >
                                        <div :id="`w-${item.name}`"
                                             class="label"
                                        >
                                            <workspace-logo-icon :text="item?.label || ''"
                                                                 :theme="item?.tags?.theme"
                                                                 size="xs"
                                            />
                                            <p-tooltip v-if="state.isEllipsisMap[`w-${item.name}`]"
                                                       position="bottom"
                                                       :contents="item.label"
                                                       :class="{'label-text': true, 'group-exist': !item?.workspace_group_id}"
                                            >
                                                <span>{{ item.label }}</span>
                                            </p-tooltip>
                                            <span v-else
                                                  :class="{'label-text': true, 'group-exist': !item?.workspace_group_id}"
                                            >{{ item.label }}</span>
                                            <span>{{ referenceMap.workspaceGroup[item.workspace_group_id]?.label || item.workspace_group_id }}</span>
                                        </div>
                                    </div>
                                </template>
                            </p-select-dropdown>
                        </div>
                    </template>
                </p-field-group>
            </div>
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.workspace-select-dropdown {
    .menu-item-wrapper {
        @apply flex justify-between;
        max-width: 100%;

        .label {
            @apply flex items-center gap-2;
        }
        .label-text {
            @apply truncate;
            max-width: 13.125rem;
        }
        .label-text.group-exist {
            max-width: 36.875rem;
        }
        &.is-dormant {
            .label-text {
                max-width: 31.25rem;
            }
        }
    }
}
</style>
