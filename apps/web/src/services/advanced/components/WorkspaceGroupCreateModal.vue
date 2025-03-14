<script setup lang="ts">
import type Vue from 'vue';
import {
    computed, nextTick, reactive, ref, watch,
} from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButtonModal, PFieldGroup, PTextInput, PSelectDropdown, PTooltip,
} from '@cloudforet/mirinae';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { WorkspaceGroupCreateParameters } from '@/api-clients/identity/workspace-group/schema/api-verbs/create';
import type { WorkspaceGroupModel } from '@/api-clients/identity/workspace-group/schema/model';
import type { WorkspaceChangeWorkspaceGroupParameters } from '@/api-clients/identity/workspace/schema/api-verbs/change-workspace-group';
import type { WorkspaceListParameters } from '@/api-clients/identity/workspace/schema/api-verbs/list';
import type { WorkspaceModel } from '@/api-clients/identity/workspace/schema/model';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { WorkspaceGroupReferenceMap } from '@/store/reference/workspace-group-reference-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import { useSelectDropDownList } from '@/services/advanced/composables/use-select-drop-down-list';
import { WORKSPACE_GROUP_MODAL_TYPE } from '@/services/advanced/constants/workspace-group-constant';
import { useWorkspaceGroupPageStore } from '@/services/advanced/store/workspace-group-page-store';



const workspaceGroupPageStore = useWorkspaceGroupPageStore();
const workspaceGroupPageState = workspaceGroupPageStore.state;

const allReferenceStore = useAllReferenceStore();

const emit = defineEmits<{(e: 'confirm'): void,
}>();

const state = reactive({
    workspaceGroups: computed<WorkspaceGroupReferenceMap>(() => allReferenceStore.getters.workspace_group),
    workspaceGroupNames: computed(() => Object.values(state.workspaceGroups).map((item:any) => item.name)),
    loading: false,
    menuIds: computed<string[]>(() => menuList.value.map((item) => item.name)),
    isSelectDropdownVisible: false,
    isEllipsisMap: {} as Record<string, boolean>,
});

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
        if (state.workspaceGroupNames.includes(value.trim())) {
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
    fetcher: (apiQueryHelper) => SpaceConnector.clientV2.identity.workspace.list<WorkspaceListParameters, ListResponse<WorkspaceModel>>({
        query: apiQueryHelper.data,
    }),
});

const createWorkspaceGroup = async (): Promise<string | undefined> => {
    state.loading = true;

    try {
        const { workspace_group_id } = await SpaceConnector.clientV2.identity.workspaceGroup.create<WorkspaceGroupCreateParameters, WorkspaceGroupModel>({
            name: groupName.value,
        });

        if (!selectedItems.value.length) {
            return workspace_group_id;
        }


        await Promise.allSettled(selectedItems.value.map((item) => SpaceConnector.clientV2.identity.workspace.changeWorkspaceGroup<WorkspaceChangeWorkspaceGroupParameters, WorkspaceModel>({
            workspace_group_id,
            workspace_id: item.name,
        })));
        await resetWorkspaceMenuList();

        return workspace_group_id;
    } catch (e) {
        ErrorHandler.handleError(e);
        return undefined;
    } finally {
        state.loading = false;
    }
};

const handleConfirm = async () => {
    const workspaceGroupId = await createWorkspaceGroup();
    showSuccessMessage(i18n.t('IAM.WORKSPACE_GROUP.MODAL.ALT_S_CREATE_WORKSPACE'), '');
    workspaceGroupPageStore.closeModal();
    emit('confirm');

    workspaceGroupPageStore.updateModalSettings({
        type: WORKSPACE_GROUP_MODAL_TYPE.ADD_USERS,
        title: i18n.t('IAM.WORKSPACE_GROUP.MODAL.ADD_USERS_TITLE', { name: groupName.value }),
        visible: WORKSPACE_GROUP_MODAL_TYPE.ADD_USERS,
        additionalData: { workspaceGroupId },
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
                                            <span>{{ state.workspaceGroups[item.workspace_group_id]?.label }}</span>
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
