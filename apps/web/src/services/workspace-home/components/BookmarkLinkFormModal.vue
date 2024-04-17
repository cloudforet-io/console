<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PButton,
    PButtonModal, PFieldGroup, PI, PRadio, PRadioGroup, PTextInput,
} from '@spaceone/design-system';

import { i18n } from '@/translations';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import { BOOKMARK_MODAL_TYPE } from '@/services/workspace-home/constants/workspace-home-constant';
import { useBookmarkStore } from '@/services/workspace-home/store/bookmark-store';
import type { BookmarkItem, BookmarkModalType } from '@/services/workspace-home/types/workspace-home-type';

interface Props {
    bookmarkList?: BookmarkItem[],
    bookmarkFolderList?: BookmarkItem[],
}

const props = withDefaults(defineProps<Props>(), {
    bookmarkList: undefined,
    bookmarkFolderList: undefined,
});

const bookmarkStore = useBookmarkStore();
const bookmarkGetters = bookmarkStore.getters;

const storeState = reactive({
    type: computed<BookmarkModalType|undefined>(() => bookmarkGetters.modalType),
});
const state = reactive({
    loading: false,
    selectedFolderIdx: undefined as number|undefined,
    selectedFolder: computed<string|undefined>(() => (props.bookmarkFolderList ? props.bookmarkFolderList[state.selectedFolderIdx]?.name : undefined)),
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
        await bookmarkStore.createBookmarkFolder(i18n.t('HOME.FORM_NEW_FOLDER') as string);
        state.selectedFolderIdx = 0;
    } catch (e: any) {
        ErrorHandler.handleRequestError(e, e.message);
    }
};
const handleConfirm = async () => {
    state.loading = true;
    try {
        await bookmarkStore.createBookmarkLink({
            name: name.value,
            link: link.value,
            folder: state.selectedFolder,
        });
        await handleClose();
    } finally {
        state.loading = false;
    }
};
</script>

<template>
    <p-button-modal class="bookmark-link-form-modal"
                    :header-title="$t('HOME.BOOKMARK_ADD_LINK')"
                    size="sm"
                    :fade="true"
                    :backdrop="true"
                    :visible="storeState.type === BOOKMARK_MODAL_TYPE.LINK"
                    :disabled="name === ''"
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
                                    <p-i name="ic_folder-filled"
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
