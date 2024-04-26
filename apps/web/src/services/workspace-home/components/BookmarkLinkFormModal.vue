<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import {
    PButton, PButtonModal, PFieldGroup, PI, PRadio, PRadioGroup, PTextInput,
} from '@spaceone/design-system';

import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
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
const bookmarkState = bookmarkStore.state;

const storeState = reactive({
    modal: computed<BookmarkModalStateType>(() => bookmarkState.modal),
    selectedBookmark: computed<BookmarkItem|undefined>(() => bookmarkState.selectedBookmark),
    isFullMode: computed<boolean|undefined>(() => bookmarkState.isFullMode),
    isFileFullMode: computed<boolean|undefined>(() => bookmarkState.isFileFullMode),
});
const state = reactive({
    loading: false,
    isDisabled: computed(() => {
        const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w.-]*)*\/?$/;
        return !urlPattern.test(link.value) || !name.value;
    }),
    selectedFolderIdx: undefined as number|undefined,
    selectedFolder: computed<BookmarkItem|undefined>(() => (props.bookmarkFolderList ? props.bookmarkFolderList[state.selectedFolderIdx] : undefined)),
});

const {
    forms: {
        name, link,
    },
    setForm,
    initForm,
} = useFormValidator({
    name: '',
    link: '',
}, {});

const generateNewFolderName = (existingFolders) => {
    const folderNumbers = existingFolders
        .filter((n) => n.name.startsWith(i18n.t('HOME.FORM_NEW_FOLDER')))
        .map((n) => parseInt(n.name.replace(i18n.t('HOME.FORM_NEW_FOLDER'), '')) || 0)
        .sort((a, b) => a.name - b.name);

    for (let i = 1; i <= folderNumbers.length; i++) {
        if (!folderNumbers.includes(i)) {
            return `${i18n.t('HOME.FORM_NEW_FOLDER')}${i}`;
        }
    }

    return `${i18n.t('HOME.FORM_NEW_FOLDER')}${folderNumbers.length + 1}`;
};
const handleClose = () => {
    bookmarkStore.setModalType(undefined);
    state.selectedFolderIdx = undefined;
    initForm();
};
const handleDeselectButton = () => {
    state.selectedFolderIdx = undefined;
};
const handleClickNewFolderButton = async () => {
    try {
        const newFolder = generateNewFolderName(props.bookmarkFolderList);
        await bookmarkStore.createBookmarkFolder(newFolder);
        state.selectedFolderIdx = 0;
    } catch (e: any) {
        ErrorHandler.handleRequestError(e, e.message);
    }
};
const handleConfirm = async () => {
    state.loading = true;
    try {
        if (storeState.modal.isEdit) {
            await bookmarkStore.updateBookmarkLink({
                id: storeState.selectedBookmark?.id || '',
                name: name.value,
                link: link.value,
                folder: state.selectedFolder?.id,
            });
        } else {
            await bookmarkStore.createBookmarkLink({
                name: name.value,
                link: link.value,
                folder: state.selectedFolder?.id,
            });
            showSuccessMessage(i18n.t('HOME.ALT_S_ADD_LINK'), '');
        }
        if (storeState.isFullMode && state.selectedFolder?.id) {
            if (state.selectedFolder?.id) {
                await bookmarkStore.setFileFullMode(true, state.selectedFolder);
            } else {
                await bookmarkStore.setFullMode(true);
            }
        }
        await bookmarkStore.setSelectedBookmark(state.selectedFolder);
        await handleClose();
    } finally {
        state.loading = false;
    }
};

watch(() => storeState.modal.type, (type) => {
    if (type !== BOOKMARK_MODAL_TYPE.LINK) return;
    if (storeState.modal.isEdit) {
        setForm('name', storeState.selectedBookmark?.name as string || '');
        setForm('link', storeState.selectedBookmark?.link || '');
        state.selectedFolderIdx = props.bookmarkFolderList?.findIndex((item) => item.id === storeState.selectedBookmark?.folder);
        return;
    }
    if (!storeState.modal.isNew && storeState.selectedBookmark) {
        state.selectedFolderIdx = props.bookmarkFolderList?.findIndex((item) => item.id === storeState.selectedBookmark?.id);
    }
}, { immediate: true });
</script>

<template>
    <p-button-modal class="bookmark-link-form-modal"
                    :header-title="storeState.modal.isEdit ? $t('HOME.BOOKMARK_EDIT_LINK') : $t('HOME.BOOKMARK_ADD_LINK')"
                    size="sm"
                    :fade="true"
                    :backdrop="true"
                    :visible="storeState.modal.type === BOOKMARK_MODAL_TYPE.LINK"
                    :disabled="state.isDisabled"
                    :loading="state.loading"
                    @confirm="handleConfirm"
                    @cancel="handleClose"
                    @close="handleClose"
    >
        <template #body>
            <div class="form-contents">
                <p-field-group label="URL"
                               class="input-form"
                               required
                >
                    <p-text-input :value="link"
                                  class="text-input"
                                  block
                                  @update:value="setForm('link', $event)"
                    />
                </p-field-group>
                <p-field-group :label="$t('HOME.FORM_NAME')"
                               class="input-form"
                               required
                >
                    <p-text-input :value="name"
                                  class="text-input"
                                  block
                                  @update:value="setForm('name', $event)"
                    />
                </p-field-group>
                <p-field-group :label="$t('HOME.FORM_FOLDER')"
                               class="input-form"
                >
                    <div class="folder-wrapper">
                        <p-radio-group :direction="'vertical'">
                            <p-radio v-for="(item, idx) in props.bookmarkFolderList"
                                     :key="`bookmark-folder-${idx}`"
                                     v-model="state.selectedFolderIdx"
                                     :value="idx"
                            >
                                <span class="radio-item">
                                    <p-i name="ic_folder"
                                         color="inherit"
                                         width="1.25rem"
                                         height="1.25rem"
                                    />
                                    {{ item.name }}
                                </span>
                            </p-radio>
                        </p-radio-group>
                        <div class="buttons-wrapper">
                            <p-button icon-left="ic_plus"
                                      style-type="tertiary"
                                      size="sm"
                                      @click="handleClickNewFolderButton"
                            >
                                {{ $t('HOME.FORM_NEW_FOLDER') }}
                            </p-button>
                            <p-button :disabled="state.selectedFolderIdx === undefined"
                                      style-type="tertiary"
                                      size="sm"
                                      @click="handleDeselectButton"
                            >
                                {{ $t('HOME.FORM_DESELECT') }}
                            </p-button>
                        </div>
                    </div>
                </p-field-group>
            </div>
        </template>
        <template #confirm-button>
            <span v-if="storeState.modal.isEdit">{{ $t('HOME.BOOKMARK_EDIT') }}</span>
            <span v-else>{{ $t('HOME.BOOKMARK_ADD') }}</span>
        </template>v
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.bookmark-link-form-modal {
    .folder-wrapper {
        @apply flex flex-col border rounded-md border-gray-200;
        padding: 0.75rem;
        gap: 0.75rem;
        .radio-item {
            @apply inline-flex items-center;
            margin-left: 0.25rem;
            gap: 0.25rem;
        }
        .buttons-wrapper {
            @apply flex items-center;
            gap: 0.5rem;
        }
    }
}
</style>
