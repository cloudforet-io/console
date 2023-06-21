<script lang="ts" setup>
import { iso8601Formatter } from '@cloudforet/core-lib';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PButton, PCollapsibleList, PPaneLayout, PHeading, PTextarea, PSelectDropdown, PTextBeautifier,
} from '@spaceone/design-system';
import { computed, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

import type { TimeStamp } from '@/models';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';

interface NoteModel {
    note_id: string;
    alert_id: string;
    note: string;
    user_id: string;
    project_id: string;
    created_at: TimeStamp;
}

interface Props {
    id: string;
    manageDisabled: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    manageDisabled: false,
});
const store = useStore();
const { t } = useI18n();

const state = reactive({
    noteInput: '',
    noteList: [] as NoteModel[],
    loading: true,
    timezone: computed(() => store.state.user.timezone),
    userId: computed(() => store.state.user.userId),
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
        state.loading = true;
        apiQuery.setFilters([{ k: 'alert_id', v: props.id, o: '=' }]).setSort('created_at');
        const res = await SpaceConnector.client.monitoring.note.list({
            query: apiQuery.data,
        });
        state.noteList = res.results.map((d) => ({
            title: d.created_by,
            data: {
                note: d.note,
                note_id: d.note_id,
            },
            ...d,
        })).reverse();
    } catch (e) {
        ErrorHandler.handleError(e);
        state.noteList = [];
    } finally {
        state.loading = false;
    }
};

const handleCreateNote = async () => {
    try {
        await SpaceConnector.client.monitoring.note.create({
            alert_id: props.id,
            user_id: state.userId,
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
    headerTitle: t('MONITORING.ALERT.DETAIL.NOTE.DELETE_MODAL_TITLE'),
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
        await SpaceConnector.client.monitoring.note.delete({
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
        <p-heading heading-type="sub"
                   :title="t('MONITORING.ALERT.DETAIL.NOTE.NOTE')"
        />
        <article class="note-wrapper">
            <article class="add-note-wrapper">
                <p-textarea :value="state.noteInput"
                            @input="handleChangeNoteInput"
                />
                <p-button style-type="tertiary"
                          class="add-btn"
                          :disabled="(state.noteInput.trim()).length === 0 || manageDisabled"
                          @click="handleCreateNote"
                >
                    {{ t('MONITORING.ALERT.DETAIL.NOTE.ADD_NOTE') }}
                </p-button>
            </article>
            <p-collapsible-list :items="state.noteList"
                                toggle-position="contents"
                                :line-clamp="2"
            >
                <template #title="{data, title, index}">
                    <div class="title-wrapper">
                        <p>
                            <span class="author">{{ title }}</span>
                            <span class="date">{{ iso8601Formatter(state.noteList[index].created_at, state.timezone) }}</span>
                        </p>
                        <p-select-dropdown style-type="icon-button"
                                           button-icon="ic_more"
                                           :items="state.menuItems"
                                           menu-position="right"
                                           :disabled="manageDisabled"
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
        <delete-modal v-model:visible="checkDeleteState.visible"
                      :header-title="checkDeleteState.headerTitle"
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
