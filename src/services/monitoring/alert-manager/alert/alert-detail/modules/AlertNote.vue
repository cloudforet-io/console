<template>
    <p-pane-layout class="alert-detail-note">
        <p-panel-top>
            {{ $t('MONITORING.ALERT.DETAIL.NOTE.NOTE') }}
        </p-panel-top>
        <article class="note-wrapper">
            <p-collapsible-list :items="noteList" toggle-position="contents" :line-clamp="2">
                <template #title="{data, title, index}">
                    <div class="title-wrapper">
                        <p>
                            <span class="author">{{ title }}</span>
                            <span class="date">{{ iso8601Formatter(noteList[index].created_at, timezone) }}</span>
                        </p>
                        <p-select-dropdown type="icon-button" button-icon="ic_more" :items="menuItems"
                                           :menu-position="'left'"
                                           @select="handleSelect(data.note_id)"
                        />
                    </div>
                </template>
                <template #default="{data}">
                    <span class="note-content">{{ data.note }}</span>
                </template>
            </p-collapsible-list>
        </article>
        <article class="add-note-wrapper">
            <p-textarea :value="noteInput" @input="changeNoteInput" />
            <p-button style-type="gray-border" size="md" class="add-btn"
                      :disabled="(noteInput.trim()).length === 0"
                      @click="createNote"
            >
                {{ $t('MONITORING.ALERT.DETAIL.NOTE.ADD_NOTE') }}
            </p-button>
        </article>
        <delete-modal :header-title="checkDeleteState.headerTitle"
                      :visible.sync="checkDeleteState.visible"
                      :disabled="checkDeleteState.loading"
                      @confirm="deleteNote"
        />
    </p-pane-layout>
</template>

<script lang="ts">
import {
    PButton, PCollapsibleList, PPaneLayout, PPanelTop, PTextarea, PSelectDropdown,
} from '@spaceone/design-system';
import { computed, reactive, toRefs } from '@vue/composition-api';
import { TimeStamp } from '@/models';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import { iso8601Formatter } from '@spaceone/console-core-lib';
import { store } from '@/store';
import { i18n } from '@/translations';
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

export default {
    name: 'AlertNote',
    components: {
        PPaneLayout,
        PPanelTop,
        PTextarea,
        PButton,
        PCollapsibleList,
        PSelectDropdown,
        DeleteModal,
    },
    props: {
        id: {
            type: String,
            default: undefined,
        },
    },
    setup(props) {
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


        const changeNoteInput = (e) => {
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
                state.noteList = res.results.map(d => ({
                    title: d.created_by,
                    data: {
                        note: d.note,
                        note_id: d.note_id,
                    },
                    ...d,
                }));
            } catch (e) {
                ErrorHandler.handleError(e);
                state.noteList = [];
            } finally {
                state.loading = false;
            }
        };

        const createNote = async () => {
            try {
                await SpaceConnector.client.monitoring.note.create({
                    alert_id: props.id,
                    user_id: state.userId,
                    note: state.noteInput,
                });
            } catch (e) {
                ErrorHandler.handleError(e);
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

        const deleteNote = async () => {
            checkDeleteState.loading = true;
            try {
                await SpaceConnector.client.monitoring.note.delete({
                    note_id: state.selectedNoteIdForDelete,
                });
            } catch (e) {
                ErrorHandler.handleError(e);
            } finally {
                checkDeleteState.loading = false;
                checkDeleteState.visible = false;
                await listNote();
            }
        };

        (async () => {
            await listNote();
        })();


        return {
            ...toRefs(state),
            checkDeleteState,
            changeNoteInput,
            iso8601Formatter,
            createNote,
            handleSelect,
            deleteNote,
            openDeleteModal,
        };
    },
};


</script>

<style lang="postcss" scoped>
.alert-detail-note {
    padding-bottom: 2.5rem;
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
</style>
