<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import { useMutation } from '@tanstack/vue-query';
import { clone } from 'lodash';

import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PButton, PCollapsibleList, PPaneLayout, PHeading, PTextarea, PSelectDropdown, PTextBeautifier,
} from '@cloudforet/mirinae';
import { iso8601Formatter } from '@cloudforet/utils';

import { useInventoryNoteApi } from '@/api-clients/inventory/note/composables/use-inventory-note-api';
import type { NoteCreateParameters } from '@/api-clients/inventory/note/schema/api-verbs/create';
import type { NoteDeleteParameters } from '@/api-clients/inventory/note/schema/api-verbs/delete';
import type { NoteListParameters } from '@/api-clients/inventory/note/schema/api-verbs/list';
import type { NoteModel } from '@/api-clients/inventory/note/schema/model';
import { i18n } from '@/translations';

import { useAuthorizationStore } from '@/store/authorization/authorization-store';
import { useUserStore } from '@/store/user/user-store';

import type { MenuId } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { useCloudServiceNoteListQuery } from '@/services/asset-inventory/composables/use-cloud-service-note-list-query';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';


interface Props {
    recordId: string;
    manageDisabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    recordId: undefined,
    manageDisabled: false,
});

const emit = defineEmits<{(e: 'refresh-note-count'): void}>();

const route = useRoute();

const userStore = useUserStore();
const authorizationStore = useAuthorizationStore();
const state = reactive({
    id: '',
    noteInput: '',
    noteList: computed<NoteModel[]>(() => noteListData.value?.results ?? []),
    timezone: computed<string|undefined>(() => userStore.state.timezone),
    menuItems: computed(() => [
        {
            label: i18n.t('INVENTORY.CLOUD_SERVICE.HISTORY.DETAIL.NOTE_TAB.DELETE'), name: 'delete',
        },
    ]),
    selectedNoteIdForDelete: '',
    selectedMenuId: computed(() => {
        const reversedMatched = clone(route.matched).reverse();
        const closestRoute = reversedMatched.find((d) => d.meta?.menuId !== undefined);
        const targetMenuId: MenuId = closestRoute?.meta?.menuId || MENU_ID.WORKSPACE_HOME;
        if (route.name === COST_EXPLORER_ROUTE.LANDING._NAME) {
            return '';
        }
        return targetMenuId;
    }),
    hasReadWriteAccess: computed<boolean|undefined>(() => authorizationStore.getters.pageAccessPermissionMap[state.selectedMenuId]?.write),
});

/* API */
const apiQuery = new ApiQueryHelper();
const { noteAPI } = useInventoryNoteApi();
const { data: noteListData, invalidate } = useCloudServiceNoteListQuery({
    params: computed<NoteListParameters>(() => {
        apiQuery.setFilters([{ k: 'record_id', v: props.recordId, o: '=' }]).setSort('created_at');
        return {
            query: apiQuery.data,
        };
    }),
    enabled: computed(() => !!props.recordId),
});

const { mutate: createNote } = useMutation({
    mutationFn: (params: NoteCreateParameters) => noteAPI.create(params),
    onSuccess: () => {
        state.noteInput = '';
        invalidate();
        emit('refresh-note-count');
    },
    onError: (error) => {
        ErrorHandler.handleRequestError(error, 'Failed to Create Note');
    },
});

const { mutate: deleteNote, isPending: isDeleteNoteLoading } = useMutation({
    mutationFn: (params: NoteDeleteParameters) => noteAPI.delete(params),
    onSuccess: () => {
        invalidate();
    },
    onError: (error) => {
        ErrorHandler.handleRequestError(error, i18n.t('INVENTORY.CLOUD_SERVICE.HISTORY.DETAIL.NOTE_TAB.ALT_E_DELETE_NOTE'));
    },
    onSettled: () => {
        checkDeleteState.visible = false;
        emit('refresh-note-count');
    },
});



/* Event */
const handleChangeNoteInput = (e) => {
    state.noteInput = e.target?.value;
};

const handleCreateNote = async () => {
    createNote({
        record_id: props.recordId,
        note: state.noteInput,
    });
};

const checkDeleteState = reactive({
    headerTitle: computed(() => i18n.t('INVENTORY.CLOUD_SERVICE.HISTORY.DETAIL.NOTE_TAB.DELETE_HELP_TEXT')),
    visible: false,
    // loading: false,
});

const openDeleteModal = () => {
    checkDeleteState.visible = true;
};

const handleSelect = (noteId) => {
    state.selectedNoteIdForDelete = noteId;
    openDeleteModal();
};

const handleDeleteNote = async () => {
    deleteNote({
        note_id: state.selectedNoteIdForDelete,
    });
};

</script>

<template>
    <p-pane-layout class="cloud-service-history-detail-note">
        <p-heading class="pt-8 px-4 pb-4"
                   heading-type="sub"
                   use-total-count
                   :total-count="noteListData?.total_count ?? 0"
                   :title="$t('INVENTORY.CLOUD_SERVICE.HISTORY.DETAIL.NOTE')"
        />
        <article class="note-wrapper">
            <p-collapsible-list :items="state.noteList"
                                toggle-position="contents"
                                :line-clamp="2"
            >
                <template #title="{index}">
                    <div class="title-wrapper">
                        <p>
                            <span class="author">{{ state.noteList[index].created_by }}</span>
                            <span class="date">{{ iso8601Formatter(state.noteList[index].created_at, state.timezone) }}</span>
                        </p>
                        <p-select-dropdown v-if="state.hasReadWriteAccess"
                                           style-type="icon-button"
                                           button-icon="ic_ellipsis-horizontal"
                                           :menu="state.menuItems"
                                           menu-position="right"
                                           :disabled="props.manageDisabled"
                                           @select="handleSelect(state.noteList[index].note_id)"
                        />
                    </div>
                </template>
                <template #default="{index}">
                    <p-text-beautifier class="note-content"
                                       :value="state.noteList[index].note ?? ''"
                    />
                </template>
            </p-collapsible-list>
        </article>
        <article v-if="state.hasReadWriteAccess"
                 class="add-note-wrapper"
        >
            <p-textarea :value="state.noteInput"
                        @input="handleChangeNoteInput"
            />
            <p-button style-type="tertiary"
                      class="add-btn"
                      :disabled="(state.noteInput.trim()).length === 0 || props.manageDisabled"
                      @click="handleCreateNote"
            >
                {{ $t('INVENTORY.CLOUD_SERVICE.HISTORY.DETAIL.NOTE_TAB.ADD_NOTE') }}
            </p-button>
        </article>
        <delete-modal :header-title="checkDeleteState.headerTitle"
                      :visible.sync="checkDeleteState.visible"
                      :disabled="isDeleteNoteLoading"
                      @confirm="handleDeleteNote"
        />
    </p-pane-layout>
</template>

<style lang="postcss" scoped>
.cloud-service-history-detail-note {
    height: 100%;
    border: none;
    overflow: auto;
}
.note-wrapper {
    @apply flex flex-col;
    margin-top: 0.5rem;
    .title-wrapper {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    .note-content {
        white-space: pre-line;
    }
    .author {
        @apply text-blue-900 font-bold;
        font-size: 0.875rem;
        line-height: 150%;
        margin-right: 0.25rem;
    }
    .date {
        @apply text-gray-400;
        font-size: 0.75rem;
        line-height: 150%;
    }
}
.add-note-wrapper {
    @apply px-4 pt-2;
}
.add-btn {
    width: 6.125rem;
    margin-top: 0.5rem;
}

@screen tablet {
    .cloud-service-history-detail-note {
        height: 30rem;
    }
}
</style>
