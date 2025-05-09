<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import { cloneDeep } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButton, PDataTable, PHeading, PHeadingLayout,
} from '@cloudforet/mirinae';


import type { Tags, TimeStamp } from '@/api-clients/_common/schema/model';
import type { UserUpdateParameters } from '@/api-clients/identity/user/schema/api-verbs/update';
import type { UserModel } from '@/api-clients/identity/user/schema/model';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import TagsOverlay from '@/common/modules/tags/tags-panel/modules/TagsOverlay.vue';

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

const state = reactive({
    items: [] as TableItem[],
    selectedUser: computed(() => userPageStore.getters.selectedUsers[0]),
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
const handleTagUpdate = async (newTags:Tags) => {
    try {
        tableState.loading = true;
        await SpaceConnector.clientV2.identity.user.update<UserUpdateParameters, UserModel>({
            user_id: state.selectedUser.user_id || '',
            tags: newTags,
        });
        showSuccessMessage(i18n.t('COMMON.TAGS.ALT_S_UPDATE'), '');
        tableState.tagEditPageVisible = false;
        state.items = convertUserTagsToKeyValueArray(newTags);
        userPageStore.$patch((_state) => {
            const cloneUsers = cloneDeep(_state.state.users);
            cloneUsers[state.selectedIdx].tags = newTags;
            _state.state.users = cloneUsers;

            const cloneSelectedUser = cloneDeep(_state.state.selectedUser);
            cloneSelectedUser.tags = newTags;
            _state.state.selectedUser = cloneSelectedUser;
        });
        tableState.tags = newTags;
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('COMMON.TAGS.ALT_E_UPDATE'));
    } finally {
        tableState.loading = false;
    }
};

/* Watcher */
watch([() => props.activeTab, () => state.selectedUser], async () => {
    state.items = convertUserTagsToKeyValueArray(state.selectedUser.tags || {});
    tableState.tags = state.selectedUser.tags || {};
}, { immediate: true });
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
                          :tags="tableState.tags"
                          :resource-id="state.selectedUser.user_id"
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
.user-management-tab-tag {
    @apply flex flex-col;
}
</style>
