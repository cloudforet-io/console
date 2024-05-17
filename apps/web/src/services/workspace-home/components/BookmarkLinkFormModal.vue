<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import {
    PButton, PButtonModal, PFieldGroup, PI, PRadio, PRadioGroup, PTextInput,
} from '@spaceone/design-system';

import { store } from '@/store';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import BookmarkManagedBadge from '@/services/workspace-home/components/BookmarkManagedBadge.vue';
import {
    checkValidUrl,
    convertUrlProtocol,
    generateNewFolderName,
} from '@/services/workspace-home/composables/use-bookmark';
import { BOOKMARK_MODAL_TYPE, BOOKMARK_SCOPE } from '@/services/workspace-home/constants/workspace-home-constant';
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
    isDomainAdmin: computed(() => store.getters['user/isDomainAdmin']),
    modal: computed<BookmarkModalStateType>(() => bookmarkState.modal),
    selectedBookmark: computed<BookmarkItem|undefined>(() => bookmarkState.selectedBookmark),
    isFullMode: computed<boolean|undefined>(() => bookmarkState.isFullMode),
    isFileFullMode: computed<boolean|undefined>(() => bookmarkState.isFileFullMode),
});
const state = reactive({
    loading: false,
    bookmarkScope: BOOKMARK_SCOPE.PERSONAL,
    bookmarkFolderList: computed(() => props.bookmarkFolderList?.filter((item) => item.isManaged === (state.bookmarkScope === BOOKMARK_SCOPE.MANAGED))),
    selectedFolderIdx: undefined as number|undefined,
    selectedFolder: computed<BookmarkItem|undefined>(() => (state.bookmarkFolderList ? state.bookmarkFolderList[state.selectedFolderIdx] : undefined)),
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
        const newFolder = generateNewFolderName(state.bookmarkFolderList);
        await bookmarkStore.createBookmarkFolder(newFolder, state.bookmarkScope === BOOKMARK_SCOPE.MANAGED);
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
                isManaged: state.bookmarkScope === BOOKMARK_SCOPE.MANAGED,
            });
        } else {
            await bookmarkStore.createBookmarkLink({
                name: name.value,
                link: convertedLink,
                folder: state.selectedFolder?.id,
                isManaged: state.bookmarkScope === BOOKMARK_SCOPE.MANAGED,
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
        state.bookmarkScope = storeState.selectedBookmark?.isManaged ? BOOKMARK_SCOPE.MANAGED : BOOKMARK_SCOPE.PERSONAL;
        state.selectedFolderIdx = state.bookmarkFolderList?.findIndex((item) => item.id === storeState.selectedBookmark?.folder);
        return;
    }
    if (!storeState.modal.isNew && storeState.selectedBookmark) {
        state.selectedFolderIdx = state.bookmarkFolderList?.findIndex((item) => item.id === storeState.selectedBookmark?.id);
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
                <p-field-group v-if="storeState.isDomainAdmin"
                               :label="$t('HOME.FORM_SCOPE')"
                               required
                >
                    <div class="bookmark-scope">
                        <p-radio v-model="state.bookmarkScope"
                                 :value="BOOKMARK_SCOPE.PERSONAL"
                        >
                            {{ $t('HOME.BOOKMARK_WORKSPACE') }}
                        </p-radio>
                        <p-radio v-model="state.bookmarkScope"
                                 :value="BOOKMARK_SCOPE.MANAGED"
                        >
                            {{ $t('HOME.BOOKMARK_ALL_WORKSPACE') }}
                        </p-radio>
                    </div>
                </p-field-group>
                <p-field-group :label="$t('HOME.FORM_FOLDER')"
                               class="input-form"
                >
                    <div class="folder-wrapper">
                        <p-radio-group :direction="'vertical'">
                            <p-radio v-for="(item, idx) in state.bookmarkFolderList"
                                     :key="`bookmark-folder-${idx}`"
                                     v-model="state.selectedFolderIdx"
                                     :value="idx"
                            >
                                <span class="radio-item">
                                    <p-i v-if="!item.isManaged"
                                         name="ic_folder"
                                         color="inherit"
                                         width="1.25rem"
                                         height="1.25rem"
                                    />
                                    <bookmark-managed-badge v-else />
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
            <span v-if="!storeState.modal.isEdit">{{ $t('HOME.BOOKMARK_ADD') }}</span>
        </template>v
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.bookmark-link-form-modal {
    .bookmark-scope {
        @apply flex items-center;
        gap: 1rem;
    }
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
