<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButton, PDataTable, PHeading, PHeadingLayout,
} from '@cloudforet/mirinae';


import type { Tags, TimeStamp } from '@/api-clients/_common/schema/model';
import type { WorkspaceUpdateParameters } from '@/api-clients/identity/workspace/schema/api-verbs/update';
import type { WorkspaceModel } from '@/api-clients/identity/workspace/schema/model';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import TagsOverlay from '@/common/modules/tags/tags-panel/modules/TagsOverlay.vue';

import { useWorkspacePageStore } from '@/services/advanced/store/workspace-page-store';

const workspacePageStore = useWorkspacePageStore();
const workspacePageState = workspacePageStore.$state;

interface TableItem {
    project_id?: string;
    name?: string;
    date?: TimeStamp;
    key?: string;
    value?: string;
}

interface Props {
    activeTab: string;
    hasReadWriteAccess?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    activeTab: '',
});


const state = reactive({
    items: [] as TableItem[],
    selectedWorkspace: computed(() => workspacePageStore.selectedWorkspaces[0]),
    selectedIdx: computed(() => workspacePageState.selectedIndices[0]),
    sortBy: 'key',
    sortDesc: true,
});
const tableState = reactive({
    fields: computed(() => [
        { name: 'key', label: i18n.t('COMMON.TAGS.KEY') },
        { name: 'value', label: i18n.t('COMMON.TAGS.VALUE') },
    ]),
    loading: false,
    tags: {} as Tags,
    tagEditPageVisible: false,
});
const convertUserTagsToKeyValueArray = (tags: Tags) => Object.entries(tags).map(([k, v]) => ({
    key: k,
    value: v,
}));

/* Component */
const handleChangeSort = (sortBy, sortDesc) => {
    state.sortBy = sortBy;
    state.sortDesc = sortDesc;
    const multiplier = sortDesc ? -1 : 1;
    state.items = state.items.slice().sort((a, b) => (a[sortBy] > b[sortBy] ? multiplier : -multiplier));
};
const handleEditTag = () => {
    tableState.tagEditPageVisible = true;
};
const handleCloseTag = async () => {
    tableState.tagEditPageVisible = false;
};
const handleTagUpdate = async (newTags:Tags) => {
    try {
        tableState.loading = true;
        await SpaceConnector.clientV2.identity.workspace.update<WorkspaceUpdateParameters, WorkspaceModel>({
            workspace_id: state.selectedWorkspace.workspace_id || '',
            tags: newTags,
        });
        showSuccessMessage(i18n.t('COMMON.TAGS.ALT_S_UPDATE'), '');
        tableState.tagEditPageVisible = false;
        state.items = convertUserTagsToKeyValueArray(newTags);
        workspacePageStore.$patch((_state) => {
            _state.workspaces[state.selectedIdx].tags = newTags;
        });
        tableState.tags = newTags;
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('COMMON.TAGS.ALT_E_UPDATE'));
    } finally {
        tableState.loading = false;
    }
};

watch([() => props.activeTab, () => state.selectedWorkspace], async () => {
    state.items = convertUserTagsToKeyValueArray(state.selectedWorkspace.tags || {});
    tableState.tags = state.selectedWorkspace.tags || {};
}, { immediate: true });
</script>

<template>
    <div class="workspace-tag-management-tab-contents">
        <p-heading-layout class="pt-8 px-4 pb-4">
            <template #heading>
                <p-heading heading-type="sub"
                           :use-total-count="true"
                           :total-count="state.items.length"
                           :title="$t('IAM.USER.MAIN.TAG')"
                />
            </template>
            <template v-if="props.hasReadWriteAccess"
                      #extra
            >
                <p-button style-type="tertiary"
                          icon-left="ic_edit"
                          @click="handleEditTag"
                >
                    {{ $t('COMMON.TAGS.EDIT') }}
                </p-button>
            </template>
        </p-heading-layout>
        <p-data-table :fields="tableState.fields"
                      :items="state.items"
                      col-copy
                      :sort-by="state.sortBy"
                      :sort-desc="state.sortDesc"
                      sortable
                      beautify-text
                      @changeSort="handleChangeSort"
        />
        <transition name="slide-up">
            <tags-overlay v-if="tableState.tagEditPageVisible"
                          :tags="tableState.tags"
                          :resource-id="state.selectedWorkspace?.workspace_id"
                          resource-type="identity.User"
                          resource-key="user_id"
                          :loading="tableState.loading"
                          @close="handleCloseTag"
                          @confirm="handleTagUpdate"
            />
        </transition>
    </div>
</template>

<style scoped lang="postcss">
.workspace-tag-management-tab-contents {
    @apply flex flex-col;
}
</style>
