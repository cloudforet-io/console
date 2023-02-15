<template>
    <p-pane-layout class="cloud-service-history-detail-note">
        <p-heading heading-type="sub"
                   use-total-count
                   :total-count="totalCount"
                   :title="$t('INVENTORY.CLOUD_SERVICE.HISTORY.DETAIL.NOTE')"
        />
        <article class="note-wrapper">
            <p-collapsible-list :items="noteList"
                                toggle-position="contents"
                                :line-clamp="2"
            >
                <template #title="{data, title, index}">
                    <div class="title-wrapper">
                        <p>
                            <span class="author">{{ title }}</span>
                            <span class="date">{{ iso8601Formatter(noteList[index].created_at, timezone) }}</span>
                        </p>
                        <p-select-dropdown style-type="icon-button"
                                           button-icon="ic_more"
                                           :items="menuItems"
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
        <article class="add-note-wrapper">
            <p-textarea :value="noteInput"
                        @input="handleChangeNoteInput"
            />
            <p-button style-type="tertiary"
                      class="add-btn"
                      :disabled="(noteInput.trim()).length === 0 || manageDisabled"
                      @click="handleCreateNote"
            >
                {{ $t('INVENTORY.CLOUD_SERVICE.HISTORY.DETAIL.NOTE_TAB.ADD_NOTE') }}
            </p-button>
        </article>
        <delete-modal :header-title="checkDeleteState.headerTitle"
                      :visible.sync="checkDeleteState.visible"
                      :disabled="checkDeleteState.loading"
                      @confirm="handleDeleteNote"
        />
    </p-pane-layout>
</template>

<script lang="ts">

import {
    computed, reactive, toRefs, watch,
} from 'vue';

import {
    PButton, PCollapsibleList, PPaneLayout, PHeading, PTextarea, PSelectDropdown, PTextBeautifier,
} from '@spaceone/design-system';

import { iso8601Formatter } from '@cloudforet/core-lib';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { store } from '@/store';
import { i18n } from '@/translations';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';

import type { NoteModel } from '@/services/asset-inventory/cloud-service/cloud-service-detail/type';

export default {
    name: 'CloudServiceHistoryDetailNote',
    components: {
        PPaneLayout,
        PHeading,
        PTextarea,
        PButton,
        PCollapsibleList,
        PSelectDropdown,
        PTextBeautifier,
        DeleteModal,
    },
    props: {
        recordId: {
            type: String,
            default: undefined,
        },
        manageDisabled: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            id: '',
            noteInput: '',
            noteList: [] as NoteModel[],
            loading: true,
            timezone: computed(() => store.state.user.timezone),
            userId: computed(() => store.state.user.userId),
            menuItems: computed(() => [
                {
                    label: i18n.t('INVENTORY.CLOUD_SERVICE.HISTORY.DETAIL.NOTE_TAB.DELETE'), name: 'delete',
                },
            ]),
            selectedNoteIdForDelete: '',
            totalCount: 0,
        });

        const handleChangeNoteInput = (e) => {
            state.noteInput = e.target?.value;
        };
        const apiQuery = new ApiQueryHelper();
        const listNote = async () => {
            try {
                state.loading = true;
                apiQuery.setFilters([{ k: 'record_id', v: props.recordId, o: '=' }]).setSort('created_at');
                const res = await SpaceConnector.client.inventory.note.list({
                    query: apiQuery.data,
                });
                state.noteList = res.results.map((d) => ({
                    title: d.created_by,
                    data: {
                        note: d.note,
                        note_id: d.note_id,
                    },
                    ...d,
                }));
                state.totalCount = res.total_count;
            } catch (e) {
                ErrorHandler.handleError(e);
                state.noteList = [];
            } finally {
                state.loading = false;
            }
        };

        const handleCreateNote = async () => {
            try {
                await SpaceConnector.client.inventory.note.create({
                    record_id: props.recordId,
                    user_id: state.userId,
                    note: state.noteInput,
                });
            } catch (e) {
                ErrorHandler.handleRequestError(e, 'Failed to Create Note');
            } finally {
                state.noteInput = '';
                await listNote();
                emit('refresh-note-count');
            }
        };

        const checkDeleteState = reactive({
            headerTitle: computed(() => i18n.t('INVENTORY.CLOUD_SERVICE.HISTORY.DETAIL.NOTE_TAB.DELETE_HELP_TEXT')),
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
                await SpaceConnector.client.inventory.note.delete({
                    note_id: state.selectedNoteIdForDelete,
                });
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.CLOUD_SERVICE.HISTORY.DETAIL.NOTE_TAB.ALT_E_DELETE_NOTE'));
            } finally {
                checkDeleteState.loading = false;
                checkDeleteState.visible = false;
                await listNote();
                emit('refresh-note-count');
            }
        };

        watch(() => props.recordId, (recordId) => {
            state.id = recordId;
        });

        watch(() => state.id, () => {
            listNote();
        });

        (async () => {
            await listNote();
        })();

        return {
            ...toRefs(state),
            checkDeleteState,
            iso8601Formatter,
            handleChangeNoteInput,
            handleCreateNote,
            handleSelect,
            handleDeleteNote,
            openDeleteModal,
        };
    },
};

</script>

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
