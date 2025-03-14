<script setup lang="ts">
import type Vue from 'vue';
import {
    computed, nextTick, reactive, ref, watch,
} from 'vue';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButtonModal, PFieldGroup, PSelectDropdown, PTooltip,
} from '@cloudforet/mirinae';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { WorkspaceChangeWorkspaceGroupParameters } from '@/api-clients/identity/workspace/schema/api-verbs/change-workspace-group';
import type { WorkspaceListParameters } from '@/api-clients/identity/workspace/schema/api-verbs/list';
import type { WorkspaceModel } from '@/api-clients/identity/workspace/schema/model';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { WorkspaceGroupReferenceMap } from '@/store/reference/workspace-group-reference-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import { useSelectDropDownList } from '@/services/advanced/composables/use-select-drop-down-list';
import { WORKSPACE_GROUP_MODAL_TYPE } from '@/services/advanced/constants/workspace-group-constant';
import { useWorkspaceGroupPageStore } from '@/services/advanced/store/workspace-group-page-store';

const workspaceGroupPageStore = useWorkspaceGroupPageStore();
const workspaceGroupPageState = workspaceGroupPageStore.state;
const workspaceTabState = workspaceGroupPageStore.workspaceTabState;
const workspaceGroupPageGetters = workspaceGroupPageStore.getters;
const allReferenceStore = useAllReferenceStore();

const state = reactive({
    loading: false,
    workspaceDropdownFilter: computed<ConsoleFilter[]>(() => [
        { k: 'workspace_id', v: workspaceTabState.workspacesInSelectedGroup.map((w) => w.workspace_id) || [], o: '!=' },
    ]),
    workspaceGroups: computed<WorkspaceGroupReferenceMap>(() => allReferenceStore.getters.workspaceGroup),
    menuIds: computed<string[]>(() => menuList.value.map((item) => item.name)),
    isSelectDropdownVisible: false,
    isEllipsisMap: {} as Record<string, boolean>,
});

const workspaceDropdownFilter = computed<ConsoleFilter[]>(() => [
    { k: 'workspace_id', v: workspaceTabState.workspacesInSelectedGroup.map((w) => w.workspace_id) || [], o: '!=' },
]);

const {
    loading, searchText, menuList, selectedItems, handleClickShowMore, reset,
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
    fetcher: (apiQueryHelper) => SpaceConnector.clientV2.identity.workspace.list<WorkspaceListParameters, ListResponse<WorkspaceModel>>({
        query: apiQueryHelper.data,
    }),
    filter: workspaceDropdownFilter,
});

const addWorkspace = async () => {
    state.loading = true;

    try {
        if (!selectedItems.value.length) {
            return;
        }
        // eslint-disable-next-line max-len
        await Promise.allSettled(selectedItems.value.map((item) => SpaceConnector.clientV2.identity.workspace.changeWorkspaceGroup<WorkspaceChangeWorkspaceGroupParameters, WorkspaceModel>({
            workspace_group_id: workspaceGroupPageGetters.selectedWorkspaceGroupId,
            workspace_id: item.name,
        })));
        showSuccessMessage(i18n.t('IAM.WORKSPACE_GROUP.MODAL.ALT_S_ADD_WORKSPACE'), '');

        await workspaceGroupPageStore.fetchWorkspaceGroups({ blockSelectedIndicesReset: true });
        await workspaceGroupPageStore.listWorkspacesInSelectedGroup();
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        state.loading = false;
    }
};
const resetForm = () => {
    selectedItems.value = [];
};
const handleConfirm = async () => {
    await addWorkspace();
    workspaceGroupPageStore.closeModal();
    resetForm();
};

const handleCloseModal = () => {
    resetForm();
    workspaceGroupPageStore.closeModal();
};

watch(() => workspaceGroupPageState.modal, (value) => {
    if (value.visible === WORKSPACE_GROUP_MODAL_TYPE.ADD_WORKSPACES) {
        reset();
    }
});

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
    <p-button-modal class="workspace-group-add-workspaces-modal"
                    :header-title="workspaceGroupPageState.modal.title"
                    :visible="workspaceGroupPageState.modal.visible === WORKSPACE_GROUP_MODAL_TYPE.ADD_WORKSPACES"
                    :loading="state.loading"
                    :disabled="!selectedItems.length"
                    size="sm"
                    @confirm="handleConfirm"
                    @cancel="handleCloseModal"
                    @close="handleCloseModal"
    >
        <template #body>
            <div class="form-wrapper">
                <p class="text-paragraph-lg text-gray-900 mb-4">
                    {{ $t('IAM.WORKSPACE_GROUP.MODAL.ADD_WORKSPACE_DESCRIPTION') }}
                </p>
                <p-field-group required
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
                                            <span class="flex gap-2">
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
                                            </span>
                                            <span class="workspace-group-label">{{ state.workspaceGroups[item.workspace_group_id]?.label }}</span>
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

        .label {
            @apply flex items-center gap-2 justify-between;
            max-width: 25.875rem;

            .label-text {
                @apply truncate;
                max-width: 12.5rem;
            }
            .label-text.group-exist {
                max-width: 36.875rem;
            }

            .workspace-group-label {
                @apply text-gray-500;
            }
        }

        &.is-dormant {
            .label-text {
                max-width: 31.25rem;
            }
        }
    }
}

/* custom design-system component - p-button-modal */
:deep() {
    .modal-content {
        .header {
            .modal-header {
                word-break: break-all;
            }
        }
    }
}
</style>
