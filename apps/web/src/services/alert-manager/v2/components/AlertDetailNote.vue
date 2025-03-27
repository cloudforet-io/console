<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButton, PCollapsibleList, PPaneLayout, PHeading, PTextarea, PSelectDropdown, PTextBeautifier, PHeadingLayout,
} from '@cloudforet/mirinae';
import { iso8601Formatter } from '@cloudforet/utils';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { AlertModel } from '@/schema/alert-manager/alert/model';
import type { NoteCreateParameters } from '@/schema/alert-manager/note/api-verbs/create';
import type { NoteDeleteParameters } from '@/schema/alert-manager/note/api-verbs/delete';
import type { NoteListParameters } from '@/schema/alert-manager/note/api-verbs/list';
import type { NoteModel } from '@/schema/alert-manager/note/model';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { usePageEditableStatus } from '@/common/composables/page-editable-status';

import { useAlertDetailPageStore } from '@/services/alert-manager/v2/stores/alert-detail-page-store';

const alertDetailPageStore = useAlertDetailPageStore();
const alertDetailPageState = alertDetailPageStore.state;
const alertDetailPageGetters = alertDetailPageStore.getters;

const { hasReadWriteAccess } = usePageEditableStatus();

const storeState = reactive({
    timezone: computed<string>(() => alertDetailPageGetters.timezone),
    alertInfo: computed<AlertModel>(() => alertDetailPageState.alertInfo),
});
const state = reactive({
    noteList: [] as NoteModel[],
    menuItems: [
        {
            label: 'Delete', name: 'delete',
        },
    ],
    noteInput: '',
    selectedNoteId: '',
});

const handleChangeNoteInput = (e) => {
    state.noteInput = e.target?.value;
};
const handleSelect = (noteId) => {
    state.selectedNoteId = noteId;
    handleDeleteModal();
};

const handleCreateNote = async () => {
    try {
        await SpaceConnector.clientV2.alertManager.note.create<NoteCreateParameters, NoteModel>({
            alert_id: storeState.alertInfo.alert_id,
            note: state.noteInput,
        });
        showSuccessMessage(i18n.t('ALERT_MANAGER.ALERTS.ALT_S_NOTE_CREATE'), '');
        await fetchNoteList();
    } catch (e: any) {
        ErrorHandler.handleError(e, true);
    } finally {
        state.noteInput = '';
    }
};
const handleDeleteModal = async () => {
    try {
        await SpaceConnector.clientV2.alertManager.note.delete<NoteDeleteParameters, NoteModel>({
            note_id: state.selectedNoteId,
        });
        showSuccessMessage(i18n.t('ALERT_MANAGER.ALERTS.ALT_S_NOTE_DELETE'), '');
        await fetchNoteList();
    } catch (e: any) {
        ErrorHandler.handleError(e, true);
    } finally {
        state.selectedNoteId = '';
    }
};
const fetchNoteList = async () => {
    try {
        const { results } = await SpaceConnector.clientV2.alertManager.note.list<NoteListParameters, ListResponse<NoteModel>>({
            alert_id: storeState.alertInfo.alert_id,
            query: {
                sort: [{ key: 'created_at', desc: true }],
            },
        });
        state.noteList = (results || []).map((d) => ({
            title: d.created_by,
            data: {
                note: d.note,
                note_id: d.note_id,
            },
            ...d,
        }));
    } catch (e: any) {
        ErrorHandler.handleError(e);
        state.noteList = [];
        throw e;
    }
};

watch(() => storeState.alertInfo.alert_id, async (id) => {
    if (!id) return;
    await fetchNoteList();
}, { immediate: true });
</script>

<template>
    <p-pane-layout class="alert-detail-note py-6 pb-10">
        <p-heading-layout class="pb-6 px-4">
            <template #heading>
                <p-heading heading-type="sub"
                           :title="$t('ALERT_MANAGER.ALERTS.NOTE')"
                />
            </template>
        </p-heading-layout>
        <article class="flex flex-col mt-2">
            <article class="pb-2 px-4">
                <p-textarea :value="state.noteInput"
                            @input="handleChangeNoteInput"
                />
                <p-button v-if="hasReadWriteAccess"
                          style-type="tertiary"
                          class="add-btn mt-2"
                          :disabled="(state.noteInput.trim()).length === 0"
                          @click="handleCreateNote"
                >
                    {{ $t('ALERT_MANAGER.ALERTS.ADD_NOTE') }}
                </p-button>
            </article>
            <p-collapsible-list :items="state.noteList"
                                toggle-position="contents"
                                :line-clamp="2"
                                class="collapsible-list"
            >
                <template #no-styled-title="{data, title, index}">
                    <div class="flex items-center justify-between w-full text-label-md">
                        <p>
                            <span class="text-blue-900 font-bold mr-0.5">{{ title }}</span>
                            <span class="text-gray-400 text-label-sm">{{ iso8601Formatter(state.noteList[index].created_at, storeState.timezone, 'MM/DD HH:mm') }}</span>
                        </p>
                        <p-select-dropdown style-type="icon-button"
                                           button-icon="ic_ellipsis-horizontal"
                                           :menu="state.menuItems"
                                           menu-position="right"
                                           use-fixed-menu-style
                                           @select="handleSelect(data.note_id)"
                        />
                    </div>
                </template>
                <template #default="{data}">
                    <p-text-beautifier class="whitespace-pre-line text-label-md text-gray-700"
                                       :value="data.note"
                    />
                </template>
            </p-collapsible-list>
        </article>
    </p-pane-layout>
</template>

<style lang="postcss" scoped>
.alert-detail-note {
    .collapsible-list {
        @apply overflow-y-auto;
        max-height: 27.5rem;
    }
}

</style>
