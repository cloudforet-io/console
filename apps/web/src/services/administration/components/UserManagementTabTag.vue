<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import { PButton, PDataTable, PHeading } from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { Tags, TimeStamp } from '@/schema/_common/model';
import type { UserUpdateParameters } from '@/schema/identity/user/api-verbs/update';
import type { UserModel } from '@/schema/identity/user/model';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import TagsOverlay from '@/common/modules/tags/tags-panel/modules/TagsOverlay.vue';

import { useUserPageStore } from '@/services/administration/store/user-page-store';

interface TableItem {
    project_id?: string;
    name?: string;
    date?: TimeStamp;
    key?: string;
    value?: string;
}
interface Props {
    activeTab: string;
}

const props = withDefaults(defineProps<Props>(), {
    activeTab: '',
});

const userPageStore = useUserPageStore();
const userPageState = userPageStore.$state;

const state = reactive({
    items: [] as TableItem[],
    selectedUser: computed(() => userPageStore.selectedUsers[0]),
    selectedIdx: computed(() => userPageStore.selectedIndices[0]),
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
const handleTagUpdate = async (newTags) => {
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
            _state.users[state.selectedIdx].tags = newTags;
        });
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('COMMON.TAGS.ALT_E_UPDATE'));
    } finally {
        tableState.loading = false;
    }
};

/* Watcher */
watch([() => props.activeTab, () => state.selectedUser.user_id], async () => {
    state.items = convertUserTagsToKeyValueArray(state.selectedUser.tags || {});
    tableState.tags = state.selectedUser.tags || {};
}, { immediate: true });
</script>

<template>
    <div class="user-management-tab-tag">
        <p-heading heading-type="sub"
                   :use-total-count="true"
                   :total-count="state.items.length"
                   :title="$t('IAM.USER.MAIN.TAG')"
        >
            <template v-if="userPageState.isAdminMode"
                      #extra
            >
                <p-button style-type="tertiary"
                          icon-left="ic_edit"
                          @click="handleEditTag"
                >
                    {{ $t('COMMON.TAGS.EDIT') }}
                </p-button>
            </template>
        </p-heading>
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
                          @update="handleTagUpdate"
            />
        </transition>
    </div>
</template>

<style scoped lang="postcss">
.user-management-tab-tag {
    @apply flex flex-col;
}
</style>
