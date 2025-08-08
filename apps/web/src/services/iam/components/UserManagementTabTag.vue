<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import { useMutation, useQueryClient } from '@tanstack/vue-query';

import {
    PButton, PHeading, PHeadingLayout, PDataTable,
} from '@cloudforet/mirinae';


import type { Tags, TimeStamp } from '@/api-clients/_common/schema/model';
import { useUserApi } from '@/api-clients/identity/user/composables/use-user-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import TagsOverlay from '@/common/modules/tags/tags-panel/modules/TagsOverlay.vue';

import { useUserListQuery } from '@/services/iam/composables/use-user-list-query';
import { useUserPageStore } from '@/services/iam/store/user-page-store';


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

const userPageStore = useUserPageStore();
const userPageState = userPageStore.state;

const selectedUserIds = computed<string[]>(() => userPageState.selectedUserIds);
const { workspaceUserListData: selectedWorkspaceUsers, userListData: selectedUsers } = useUserListQuery(selectedUserIds);

const { key: userListQueryKey } = useServiceQueryKey('identity', 'user', 'list');
const { key: userGetQueryKey } = useServiceQueryKey('identity', 'user', 'get', {
    contextKey: userPageState.selectedUserIds[0],
});

const { userAPI } = useUserApi();
const queryClient = useQueryClient();

const isAdminMode = computed(() => userPageState.isAdminMode);

const state = reactive({
    items: [] as TableItem[],
    selectedUser: computed(() => (isAdminMode.value ? selectedUsers.value?.[0] : selectedWorkspaceUsers.value?.[0])),
    selectedIdx: computed(() => userPageStore.state.selectedIndices[0]),
    sortBy: 'key',
    sortDesc: true,
});
const tableState = reactive({
    fields: computed(() => [
        { name: 'key', label: i18n.t('COMMON.TAGS.KEY') as string },
        { name: 'value', label: i18n.t('COMMON.TAGS.VALUE') as string },
    ]),
    loading: false,
    tags: {},
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

const { mutateAsync: updateUser, isPending: updateUserTagsLoading } = useMutation({
    mutationFn: userAPI.update,
    onSuccess: async (data) => {
        showSuccessMessage(i18n.t('COMMON.TAGS.ALT_S_UPDATE'), '');
        tableState.tagEditPageVisible = false;
        state.items = convertUserTagsToKeyValueArray(data.tags);
        tableState.tags = data.tags;
        await queryClient.invalidateQueries({ queryKey: userListQueryKey.value });
        await queryClient.invalidateQueries({ queryKey: userGetQueryKey.value });
    },
    onError: (e) => {
        ErrorHandler.handleRequestError(e, i18n.t('COMMON.TAGS.ALT_E_UPDATE'));
    },
});
const handleTagUpdate = async (newTags:Tags) => {
    await updateUser({
        user_id: state.selectedUser?.user_id || '',
        tags: newTags,
    });
};

/* Watcher */
watch([() => props.activeTab, () => state.selectedUser], async () => {
    state.items = convertUserTagsToKeyValueArray(state.selectedUser?.tags || {});
    tableState.tags = state.selectedUser?.tags || {};
}, { deep: true, immediate: true });
</script>

<template>
    <div class="user-management-tab-tag">
        <p-heading-layout class="pt-8 px-4 pb-6">
            <template #heading>
                <p-heading heading-type="sub"
                           :use-total-count="true"
                           :total-count="state.items.length"
                           :title="$t('IAM.USER.MAIN.TAG')"
                />
            </template>
            <template v-if="props.hasReadWriteAccess && userPageState.isAdminMode"
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
                          :tags="state.selectedUser?.tags"
                          :resource-id="state.selectedUser?.user_id"
                          resource-type="identity.User"
                          resource-key="user_id"
                          :loading="updateUserTagsLoading"
                          @close="handleCloseTag"
                          @confirm="handleTagUpdate"
            />
        </transition>
    </div>
</template>

<style scoped lang="postcss">
.user-management-tab-tag {
    @apply flex flex-col;
}
</style>
