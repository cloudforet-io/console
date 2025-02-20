<script setup lang="ts">
import { computed, reactive } from 'vue';


import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PButton, PCollapsibleList, PPaneLayout, PHeading, PTextarea, PSelectDropdown, PTextBeautifier,
} from '@cloudforet/mirinae';
import { iso8601Formatter } from '@cloudforet/utils';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { NoteCreateParameters } from '@/schema/monitoring/note/api-verbs/create';
import type { NoteDeleteParameters } from '@/schema/monitoring/note/api-verbs/delete';
import type { NoteListParameters } from '@/schema/monitoring/note/api-verbs/list';
import type { NoteModel } from '@/schema/monitoring/note/model';
import { i18n } from '@/translations';

import { useUserStore } from '@/store/user/user-store';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';

const props = defineProps<{
    id: string;
    manageDisabled?: boolean;
}>();

const userStore = useUserStore();
const state = reactive({
    noteInput: '',
    noteList: [] as NoteModel[],
    timezone: computed<string|undefined>(() => userStore.state.timezone),
    menuItems: [
        {
            label: 'Delete', name: 'delete',
        },
    ],
    selectedNoteIdForDelete: '',
});

const handleChangeNoteInput = (e) => {
    state.noteInput = e.target?.value;
};
const apiQuery = new ApiQueryHelper();
const listNote = async () => {
    try {
        apiQuery.setFilters([{ k: 'alert_id', v: props.id, o: '=' }]).setSort('created_at', true);
        const res = await SpaceConnector.clientV2.monitoring.note.list<NoteListParameters, ListResponse<NoteModel>>({
            query: apiQuery.data,
        });
        state.noteList = res.results?.map((d) => ({
            title: d.created_by,
            data: {
                note: d.note,
                note_id: d.note_id,
            },
            ...d,
        })) ?? [];
    } catch (e) {
        ErrorHandler.handleError(e);
        state.noteList = [];
    }
};

const handleCreateNote = async () => {
    try {
        await SpaceConnector.clientV2.monitoring.note.create<NoteCreateParameters>({
            alert_id: props.id,
            note: state.noteInput,
        });
    } catch (e) {
        ErrorHandler.handleRequestError(e, 'Failed to Create Note');
    } finally {
        state.noteInput = '';
        await listNote();
    }
};

const checkDeleteState = reactive({
    headerTitle: i18n.t('MONITORING.ALERT.DETAIL.NOTE.DELETE_MODAL_TITLE'),
    visible: false,
    loading: false,
});

const openDeleteModal = () => {
    checkDeleteState.visible = true;
};

const handleSelect = (noteId) => {
    state.selectedNoteIdForDelete = noteId;
    openDeleteModal();
};

const handleDeleteNote = async () => {
    checkDeleteState.loading = true;
    try {
        await SpaceConnector.clientV2.monitoring.note.delete<NoteDeleteParameters>({
            note_id: state.selectedNoteIdForDelete,
        });
    } catch (e) {
        ErrorHandler.handleRequestError(e, 'Failed to Delete Note');
    } finally {
        checkDeleteState.loading = false;
        checkDeleteState.visible = false;
        await listNote();
    }
};

(async () => {
    await listNote();
})();
</script>

<template>
    <p-pane-layout class="alert-detail-note">
        <p-heading class="pt-8 px-4 pb-4"
                   heading-type="sub"
                   :title="$t('MONITORING.ALERT.DETAIL.NOTE.NOTE')"
        />
        <article class="note-wrapper">
            <article class="add-note-wrapper">
                <p-textarea :value="state.noteInput"
                            @input="handleChangeNoteInput"
                />
                <p-button style-type="tertiary"
                          class="add-btn"
                          :disabled="(state.noteInput.trim()).length === 0 || props.manageDisabled"
                          @click="handleCreateNote"
                >
                    {{ $t('MONITORING.ALERT.DETAIL.NOTE.ADD_NOTE') }}
                </p-button>
            </article>
            <p-collapsible-list :items="state.noteList"
                                toggle-position="contents"
                                :line-clamp="2"
            >
                <template #no-styled-title="{data, title, index}">
                    <div class="title-wrapper">
                        <p>
                            <span class="author">{{ title }}</span>
                            <span class="date">{{ iso8601Formatter(state.noteList[index].created_at, state.timezone) }}</span>
                        </p>
                        <p-select-dropdown style-type="icon-button"
                                           button-icon="ic_ellipsis-horizontal"
                                           :menu="state.menuItems"
                                           menu-position="right"
                                           use-fixed-menu-style
                                           :disabled="props.manageDisabled"
                                           @select="handleSelect(data.note_id)"
                        />
                    </div>
                </template>
                <template #default="{data}">
                    <p-text-beautifier class="note-content"
                                       :value="data.note"
                    />
                </template>
            </p-collapsible-list>
        </article>
        <delete-modal :header-title="checkDeleteState.headerTitle"
                      :visible.sync="checkDeleteState.visible"
                      :disabled="checkDeleteState.loading"
                      @confirm="handleDeleteNote"
        />
    </p-pane-layout>
</template>

<style lang="postcss" scoped>
.alert-detail-note {
    padding-bottom: 2.5rem;
}
.note-wrapper {
    @apply flex flex-col;
    margin-top: 0.5rem;
    .p-collapsible-list {
        max-height: 27.5rem;
        overflow-y: auto;
    }

    .title-wrapper {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
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
    @apply px-4 pt-2 pb-4;
}
.add-btn {
    width: 6.125rem;
    margin-top: 0.5rem;
}
</style>
