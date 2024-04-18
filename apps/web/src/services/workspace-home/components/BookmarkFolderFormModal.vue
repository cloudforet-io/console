<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import {
    PButtonModal, PFieldGroup, PTextInput,
} from '@spaceone/design-system';

import { i18n } from '@/translations';

import { useFormValidator } from '@/common/composables/form-validator';

import { BOOKMARK_MODAL_TYPE } from '@/services/workspace-home/constants/workspace-home-constant';
import { useBookmarkStore } from '@/services/workspace-home/store/bookmark-store';
import type { BookmarkItem, BookmarkModalStateType } from '@/services/workspace-home/types/workspace-home-type';

interface Props {
    bookmarkFolderList?: BookmarkItem[],
}

const props = withDefaults(defineProps<Props>(), {
    bookmarkFolderList: undefined,
});

const bookmarkStore = useBookmarkStore();
const bookmarkGetters = bookmarkStore.getters;

const storeState = reactive({
    filterByFolder: computed<string|undefined>(() => bookmarkGetters.filterByFolder),
    selectedBookmark: computed<BookmarkItem|undefined>(() => bookmarkGetters.selectedBookmark),
    isFileFullMode: computed<boolean|undefined>(() => bookmarkGetters.isFileFullMode),
    modal: computed<BookmarkModalStateType>(() => bookmarkGetters.modal),
});
const state = reactive({
    loading: false,
    bookmark: computed<string|undefined>(() => storeState.selectedBookmark?.name || storeState.filterByFolder),
});

const {
    forms: {
        name,
    },
    setForm,
    invalidState,
    invalidTexts,
    initForm,
} = useFormValidator({
    name: '',
}, {
    name(value: string) {
        if (state.bookmark === value) return '';
        const duplicatedName = props.bookmarkFolderList?.find((item) => item.name === value);
        if (duplicatedName) {
            return i18n.t('HOME.ALT_E_DUPLICATED_NAME');
        }
        return '';
    },
});

const handleClose = () => {
    bookmarkStore.setModalType(undefined);
    initForm();
};
const handleConfirm = async () => {
    state.loading = true;
    try {
        if (storeState.modal.isEdit) {
            await bookmarkStore.updateBookmarkFolder({
                id: storeState.selectedBookmark?.id,
                name: name.value,
            });
            if (storeState.isFileFullMode) {
                await bookmarkStore.setSelectedBookmark({
                    ...storeState.selectedBookmark,
                    name: name.value,
                });
            }
        } else {
            await bookmarkStore.createBookmarkFolder(name.value);
        }
        await handleClose();
    } finally {
        state.loading = false;
    }
};

watch(() => storeState.modal.isEdit, (isEditModal) => {
    if (isEditModal) {
        setForm('name', state.bookmark || '');
    }
}, { immediate: true });
</script>

<template>
    <p-button-modal class="bookmark-folder-form-modal"
                    :header-title="storeState.modal.isEdit ? $t('HOME.BOOKMARK_EDIT_FOLDER') : $t('HOME.BOOKMARK_CREATE_FOLDER')"
                    size="sm"
                    :fade="true"
                    :backdrop="true"
                    :visible="storeState.modal.type === BOOKMARK_MODAL_TYPE.FOLDER"
                    :disabled="(name === '' || invalidState.name) || state.bookmark === name"
                    :loading="state.loading"
                    @confirm="handleConfirm"
                    @cancel="handleClose"
                    @close="handleClose"
    >
        <template #body>
            <div class="form-contents">
                <p-field-group :label="$t('HOME.FORM_NAME')"
                               :invalid="invalidState.name"
                               :invalid-text="invalidTexts.name"
                               class="input-form"
                               required
                >
                    <p-text-input :value="name"
                                  :invalid="invalidState.name"
                                  class="text-input"
                                  block
                                  @update:value="setForm('name', $event)"
                    />
                </p-field-group>
            </div>
        </template>
        <template #confirm-button>
            <span v-if="storeState.modal.isEdit">{{ $t('HOME.BOOKMARK_EDIT') }}</span>
            <span v-else>{{ $t('HOME.BOOKMARK_CREATE') }}</span>
        </template>
    </p-button-modal>
</template>
