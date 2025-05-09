<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import { clone } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PButton, PCollapsibleList, PPaneLayout, PHeading, PTextarea, PSelectDropdown, PTextBeautifier,
} from '@cloudforet/mirinae';
import { iso8601Formatter } from '@cloudforet/utils';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { NoteCreateParameters } from '@/schema/inventory/note/api-verbs/create';
import type { NoteDeleteParameters } from '@/schema/inventory/note/api-verbs/delete';
import type { NoteListParameters } from '@/schema/inventory/note/api-verbs/list';
import type { NoteModel } from '@/schema/inventory/note/model';
import { i18n } from '@/translations';

import { useAuthorizationStore } from '@/store/authorization/authorization-store';
import { useUserStore } from '@/store/user/user-store';

import type { MenuId } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';

interface Props {
    recordId: string;
    manageDisabled: boolean;
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
    noteList: [] as NoteModel[],
    loading: true,
    timezone: computed<string|undefined>(() => userStore.state.timezone),
    menuItems: computed(() => [
        {
            label: i18n.t('INVENTORY.CLOUD_SERVICE.HISTORY.DETAIL.NOTE_TAB.DELETE'), name: 'delete',
        },
    ]),
    selectedNoteIdForDelete: '',
    totalCount: 0,
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

const handleChangeNoteInput = (e) => {
    state.noteInput = e.target?.value;
};
const apiQuery = new ApiQueryHelper();
const listNote = async () => {
    try {
        state.loading = true;
        apiQuery.setFilters([{ k: 'record_id', v: props.recordId, o: '=' }]).setSort('created_at');
        const res = await SpaceConnector.clientV2.inventory.note.list<NoteListParameters, ListResponse<NoteModel>>({
            query: apiQuery.data,
        });
        state.noteList = (res.results ?? []).map((d) => ({
            title: d.created_by,
            data: {
                note: d.note,
                note_id: d.note_id,
            },
            ...d,
        }));
        state.totalCount = res.total_count ?? 0;
    } catch (e) {
        ErrorHandler.handleError(e);
        state.noteList = [];
    } finally {
        state.loading = false;
    }
};

const handleCreateNote = async () => {
    try {
        await SpaceConnector.clientV2.inventory.note.create<NoteCreateParameters, NoteModel>({
            record_id: props.recordId,
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
        await SpaceConnector.clientV2.inventory.note.delete<NoteDeleteParameters>({
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
</script>

<template>
    <p-pane-layout class="cloud-service-history-detail-note">
        <p-heading class="pt-8 px-4 pb-4"
                   heading-type="sub"
                   use-total-count
                   :total-count="state.totalCount"
                   :title="$t('INVENTORY.CLOUD_SERVICE.HISTORY.DETAIL.NOTE')"
        />
        <article class="note-wrapper">
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
                        <p-select-dropdown v-if="state.hasReadWriteAccess"
                                           style-type="icon-button"
                                           button-icon="ic_ellipsis-horizontal"
                                           :menu="state.menuItems"
                                           menu-position="right"
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
                      :disabled="checkDeleteState.loading"
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
