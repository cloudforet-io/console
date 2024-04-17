<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PButtonModal, PFieldGroup, PTextInput,
} from '@spaceone/design-system';

import { i18n } from '@/translations';

import { useFormValidator } from '@/common/composables/form-validator';

import { BOOKMARK_MODAL_TYPE } from '@/services/workspace-home/constants/workspace-home-constant';
import { useBookmarkStore } from '@/services/workspace-home/store/bookmark-store';
import type { BookmarkItem, BookmarkModalType } from '@/services/workspace-home/types/workspace-home-type';

interface Props {
    bookmarkFolderList?: BookmarkItem[],
}

const props = withDefaults(defineProps<Props>(), {
    bookmarkFolderList: undefined,
});

const bookmarkStore = useBookmarkStore();
const bookmarkGetters = bookmarkStore.getters;

const storeState = reactive({
    type: computed<BookmarkModalType|undefined>(() => bookmarkGetters.modalType),
});
const state = reactive({
    loading: false,
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
        await bookmarkStore.createBookmarkFolder(name.value);
        await handleClose();
    } finally {
        state.loading = false;
    }
};
</script>

<template>
    <p-button-modal class="bookmark-folder-form-modal"
                    :header-title="$t('HOME.BOOKMARK_CREATE_FOLDER')"
                    size="sm"
                    :fade="true"
                    :backdrop="true"
                    :visible="storeState.type === BOOKMARK_MODAL_TYPE.FOLDER"
                    :disabled="name === '' || invalidState.name"
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
    </p-button-modal>
</template>
