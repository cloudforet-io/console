<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PButton, PCollapsibleList, PPaneLayout, PHeading, PTextarea, PSelectDropdown, PTextBeautifier, PHeadingLayout,
} from '@cloudforet/mirinae';
import { iso8601Formatter } from '@cloudforet/utils';

import type { NoteModel } from '@/schema/monitoring/note/model';

import { useUserStore } from '@/store/user/user-store';

const userStore = useUserStore();

const storeState = reactive({
    timezone: computed<string>(() => userStore.state.timezone ?? 'UTC'),
});
const state = reactive({
    noteInput: '',
    noteList: [] as NoteModel[],
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
const handleCreateNote = async () => {
    console.log('TODO: handleCreateNote');
};

const fetchNoteList = async () => {
    console.log('TODO: fetchNoteList');
};
const handleDeleteModal = () => {
    console.log('TODO: handleDeleteModal');
};

const handleSelect = (noteId) => {
    state.selectedNoteIdForDelete = noteId;
    handleDeleteModal();
};

(async () => {
    await fetchNoteList();
})();
</script>

<template>
    <p-pane-layout class="alert-detail-note py-6 px-4 pb-10">
        <p-heading-layout class="pb-6">
            <template #heading>
                <p-heading heading-type="sub"
                           :title="$t('ALERT_MANAGER.ALERTS.NOTE')"
                />
            </template>
        </p-heading-layout>
        <article class="flex flex-col mt-2">
            <article class="pt-2 px-4 pb-4">
                <p-textarea :value="state.noteInput"
                            @input="handleChangeNoteInput"
                />
                <p-button style-type="tertiary"
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
                            <span class="text-gray-400 text-label-sm">{{ iso8601Formatter(state.noteList[index].created_at, storeState.timezone) }}</span>
                        </p>
                        <p-select-dropdown style-type="icon-button"
                                           button-icon="ic_chevron-down"
                                           :menu="state.menuItems"
                                           menu-position="right"
                                           use-fixed-menu-style
                                           @select="handleSelect(data.note_id)"
                        />
                    </div>
                </template>
                <template #default="{data}">
                    <p-text-beautifier class="whitespace-pre-line"
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
