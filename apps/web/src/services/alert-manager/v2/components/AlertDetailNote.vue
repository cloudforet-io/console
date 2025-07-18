<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRoute } from 'vue-router/composables';

import { useMutation, useQueryClient } from '@tanstack/vue-query';

import {
    PButton, PCollapsibleList, PPaneLayout, PHeading, PTextarea, PSelectDropdown, PTextBeautifier, PHeadingLayout,
} from '@cloudforet/mirinae';
import { iso8601Formatter } from '@cloudforet/utils';

import { useNoteApi } from '@/api-clients/alert-manager/note/composables/use-note-api';
import type { NoteCreateParameters } from '@/api-clients/alert-manager/note/schema/api-verbs/create';
import type { NoteDeleteParameters } from '@/api-clients/alert-manager/note/schema/api-verbs/delete';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';
import { i18n } from '@/translations';

import { useUserStore } from '@/store/user/user-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { usePageEditableStatus } from '@/common/composables/page-editable-status';

import { useAlertGetQuery } from '@/services/alert-manager/v2/composables/use-alert-get-query';


const userStore = useUserStore();
const userState = userStore.state;

const route = useRoute();

const { hasReadWriteAccess } = usePageEditableStatus();

const queryClient = useQueryClient();
const { noteAPI } = useNoteApi();
const { alertData } = useAlertGetQuery(route.params.alertId as string);
const { key: noteListQueryKey, params: noteListQueryParams } = useServiceQueryKey('alert-manager', 'note', 'list', {
    params: computed(() => ({
        alert_id: alertData.value?.alert_id || '',
        query: {
            sort: [{ key: 'created_at', desc: true }],
        },
    })),
});

const storeState = reactive({
    timezone: computed<string>(() => userState.timezone || 'UTC'),
});
const state = reactive({
    noteList: computed(() => (noteListData.value?.results || []).map((d) => ({
        title: d.created_by,
        data: {
            note: d.note,
            note_id: d.note_id,
        },
        ...d,
    }))),
    menuItems: [
        {
            label: 'Delete', name: 'delete',
        },
    ],
    noteInput: '',
    selectedNoteId: '',
    method: 'create' as 'create' | 'delete',
});

const { mutate: noteMutation } = useMutation({
    mutationFn: (params: NoteCreateParameters | NoteDeleteParameters) => {
        if (state.method === 'create') {
            return noteAPI.create(params as NoteCreateParameters);
        }
        return noteAPI.delete(params as NoteDeleteParameters);
    },
    onSuccess: () => {
        if (state.method === 'create') {
            showSuccessMessage(i18n.t('ALERT_MANAGER.ALERTS.ALT_S_NOTE_CREATE'), '');
        } else {
            showSuccessMessage(i18n.t('ALERT_MANAGER.ALERTS.ALT_S_NOTE_DELETE'), '');
        }
        queryClient.invalidateQueries({ queryKey: noteListQueryKey.value });
    },
    onError: (e) => {
        ErrorHandler.handleError(e, true);
    },
    onSettled: () => {
        state.noteInput = '';
        state.selectedNoteId = '';
    },
});

const { data: noteListData } = useScopedQuery({
    queryKey: noteListQueryKey,
    queryFn: async () => noteAPI.list(noteListQueryParams.value),
    enabled: computed(() => !!alertData.value?.alert_id),
    gcTime: 1000 * 60 * 2,
    staleTime: 1000 * 60 * 2,
}, ['WORKSPACE']);

const handleChangeNoteInput = (e) => {
    state.noteInput = e.target?.value;
};
const handleSelect = (noteId) => {
    state.selectedNoteId = noteId;
    handleDeleteModal();
};

const handleCreateNote = () => {
    state.method = 'create';
    noteMutation({
        alert_id: alertData.value?.alert_id || '',
        note: state.noteInput,
    });
};
const handleDeleteModal = () => {
    state.method = 'delete';
    noteMutation({
        note_id: state.selectedNoteId,
    });
};
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
