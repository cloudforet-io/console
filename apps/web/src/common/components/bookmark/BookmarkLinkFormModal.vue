<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import {
    PButton, PButtonModal, PFieldGroup, PI, PRadio, PRadioGroup, PTextInput,
} from '@spaceone/design-system';

import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import {
    checkValidUrl,
    convertUrlProtocol,
    generateNewFolderName,
} from '@/common/components/bookmark/composables/use-bookmark';
import { BOOKMARK_MODAL_TYPE } from '@/common/components/bookmark/constant/constant';
import type { BookmarkItem, BookmarkModalStateType } from '@/common/components/bookmark/type/type';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import { useBookmarkStore } from '@/services/workspace-home/store/bookmark-store';

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
});
const state = reactive({
    loading: false,
    selectedFolderIdx: undefined as number|undefined,
    selectedFolder: computed<BookmarkItem|undefined>(() => (props.bookmarkFolderList ? props.bookmarkFolderList[state.selectedFolderIdx] : undefined)),
});

const {
    forms: {
        name, link,
    },
    setForm,
    initForm,
    invalidState,
    invalidTexts,
    isAllValid,
} = useFormValidator({
    name: '',
    link: '',
}, {
    name: (value: string) => {
        if (value.length < 2) return i18n.t('HOME.ALT_E_VALIDATION_NAME');
        return true;
    },
});


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
    let convertedLink = link.value;
    if (!checkValidUrl(link.value)) {
        convertedLink = convertUrlProtocol(link.value);
    }

    try {
        if (storeState.modal.isEdit) {
            await bookmarkStore.updateBookmarkLink({
                id: storeState.selectedBookmark?.id || '',
                name: name.value,
                link: convertedLink,
                folder: state.selectedFolder?.id,
            });
        } else {
            await bookmarkStore.createBookmarkLink({
                name: name.value,
                link: convertedLink,
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
                    :disabled="!isAllValid"
                    :loading="state.loading"
                    @confirm="handleConfirm"
                    @cancel="handleClose"
                    @close="handleClose"
    >
        <template #body>
            <div class="form-contents">
                <p-field-group label="URL"
                               class="input-form"
                               :invalid="invalidState.link"
                               :invalid-text="invalidTexts.link"
                               required
                >
                    <p-text-input :value="link"
                                  :invalid="invalidState.link"
                                  class="text-input"
                                  block
                                  @update:value="setForm('link', $event)"
                    />
                </p-field-group>
                <p-field-group :label="$t('HOME.FORM_NAME')"
                               class="input-form"
                               :invalid="invalidState.name"
                               :invalid-text="invalidTexts.name"
                               required
                >
                    <p-text-input :value="name"
                                  :invalid="invalidState.name"
                                  class="text-input"
                                  block
                                  @update:value="setForm('name', $event)"
                    />
                </p-field-group>
                <p-field-group :label="$t('HOME.FORM_FOLDER')"
                               class="input-form"
                >
                    <div class="folder-wrapper">
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
                    </div>
                </p-field-group>
            </div>
        </template>
        <template #confirm-button>
            <span v-if="!storeState.modal.isEdit">{{ $t('HOME.BOOKMARK_ADD') }}</span>
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
            @apply flex items-center;
            margin-left: 0.25rem;
            gap: 0.25rem;
        }

        /* custom design-system component - p-radio */
        :deep(.p-radio) {
            @apply flex items-center;
            .text {
                @apply block;
            }
        }
        .buttons-wrapper {
            @apply flex items-center;
            gap: 0.5rem;
        }
    }
}
</style>
