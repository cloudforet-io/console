<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PButtonModal, PFieldGroup, PTextInput, PCheckbox, PTooltip, PI,
} from '@spaceone/design-system';

import { store } from '@/store';
import { i18n } from '@/translations';

import { useFormValidator } from '@/common/composables/form-validator';

import { gray } from '@/styles/colors';

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
    isDomainAdmin: computed(() => store.getters['user/isDomainAdmin']),
    filterByFolder: computed<string|undefined|TranslateResult>(() => bookmarkState.filterByFolder),
    selectedBookmark: computed<BookmarkItem|undefined>(() => bookmarkState.selectedBookmark),
    isFileFullMode: computed<boolean|undefined>(() => bookmarkState.isFileFullMode),
    modal: computed<BookmarkModalStateType>(() => bookmarkState.modal),
});
const state = reactive({
    loading: false,
    isManaged: false,
    bookmark: computed<string|undefined|TranslateResult>(() => storeState.selectedBookmark?.name || storeState.filterByFolder),
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
        if (value.length > 16) {
            return i18n.t('HOME.ALT_E_MAX_LENGTH_INVALID', { max: 16 });
        }
        return '';
    },
});

const handleClose = () => {
    bookmarkStore.setModalType(undefined, false, false);
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
            await bookmarkStore.createBookmarkFolder(name.value, state.isManaged);
        }
        await handleClose();
    } finally {
        state.loading = false;
    }
};

watch(() => storeState.modal.isEdit, (isEditModal) => {
    if (isEditModal) {
        setForm('name', state.bookmark as string || '');
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
                <p-checkbox v-if="!storeState.modal.isEdit && storeState.isDomainAdmin"
                            v-model="state.isManaged"
                            :value="true"
                            class="managed-checkbox"
                >
                    <span>{{ $t('HOME.BOOKMARK_MANAGED_CREATE') }}</span>
                    <p-tooltip position="bottom"
                               :contents="$t('HOME.BOOKMARK_MANAGED_CREATE_DESC')"
                               class="tooltip"
                    >
                        <p-i name="ic_info-circle"
                             width="1rem"
                             height="1rem"
                             :color="gray[500]"
                        />
                    </p-tooltip>
                </p-checkbox>
            </div>
        </template>
        <template #confirm-button>
            <span v-if="!storeState.modal.isEdit">{{ $t('HOME.BOOKMARK_CREATE') }}</span>
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.bookmark-folder-form-modal {
    .form-contents {
        .managed-checkbox {
            @apply flex items-center;
            gap: 0.25rem;
            .tooltip {
                margin-left: 0.25rem;
            }
        }
    }
}
</style>
