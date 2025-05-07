<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PButtonModal, PFieldGroup, PTextInput, PRadioGroup, PRadio,
} from '@cloudforet/mirinae';

import { ROLE_TYPE } from '@/api-clients/identity/role/constant';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useAuthorizationStore } from '@/store/authorization/authorization-store';

import { BOOKMARK_MODAL_TYPE } from '@/common/components/bookmark/constant/constant';
import { useBookmarkStore } from '@/common/components/bookmark/store/bookmark-store';
import type { BookmarkItem, BookmarkModalStateType, RadioType } from '@/common/components/bookmark/type/type';
import { useFormValidator } from '@/common/composables/form-validator';

import { BOOKMARK_TYPE } from '@/services/workspace-home/constants/workspace-home-constant';
import type { BookmarkType } from '@/services/workspace-home/types/workspace-home-type';

interface Props {
    bookmarkFolderList?: BookmarkItem[],
    bookmarkList: BookmarkItem[],
    filterByFolder?: TranslateResult,
    selectedBookmark?: BookmarkItem,
}

const props = withDefaults(defineProps<Props>(), {
    bookmarkFolderList: undefined,
    bookmarkList: () => [],
    filterByFolder: undefined,
    selectedBookmark: undefined,
});

const bookmarkStore = useBookmarkStore();
const bookmarkState = bookmarkStore.state;
const appContextStore = useAppContextStore();
const appContextGetters = appContextStore.getters;
const authorizationStore = useAuthorizationStore();

const emit = defineEmits<{(e: 'confirm', isEdit?: boolean, name?: string): void; }>();

const storeState = reactive({
    isAdminMode: computed(() => appContextGetters.isAdminMode),
    isWorkspaceMember: computed<boolean>(() => authorizationStore.state.currentRoleInfo?.roleType === ROLE_TYPE.WORKSPACE_MEMBER),

    modal: computed<BookmarkModalStateType>(() => bookmarkState.modal),
    bookmarkType: computed<BookmarkType|undefined>(() => bookmarkState.bookmarkType),
});
const state = reactive({
    loading: false,
    bookmark: computed<string|undefined|TranslateResult>(() => props.selectedBookmark?.name || props.filterByFolder),
    radioMenuList: computed<RadioType[]>(() => {
        const menu: RadioType[] = [{
            label: i18n.t('HOME.BOOKMARK_MY_BOOKMARK'),
            name: BOOKMARK_TYPE.USER,
        }];
        if (!storeState.isWorkspaceMember) {
            menu.unshift({
                label: i18n.t('HOME.BOOKMARK_SHARED_BOOKMARK'),
                name: BOOKMARK_TYPE.WORKSPACE,
            });
        }
        return menu;
    }),
    selectedRadioIdx: 0,
    scope: computed(() => state.radioMenuList[state.selectedRadioIdx].name),
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
                id: props.selectedBookmark?.id,
                name: name.value,
                bookmarkList: props.bookmarkList,
            });
        } else {
            await bookmarkStore.createBookmarkFolder(name.value, state.scope);
        }
        emit('confirm', storeState.modal.isEdit, name.value);
        await handleClose();
    } finally {
        state.loading = false;
    }
};

watch(() => storeState.bookmarkType, (bookmarkType) => {
    if (storeState.isWorkspaceMember) {
        state.selectedRadioIdx = 0;
        return;
    }
    if (bookmarkType === BOOKMARK_TYPE.WORKSPACE) {
        state.selectedRadioIdx = 0;
    } else if (bookmarkType === BOOKMARK_TYPE.USER) {
        state.selectedRadioIdx = 1;
    }
}, { immediate: true });
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
                    :disabled="(name === '' || invalidState.name)"
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
                <p-field-group v-if="!storeState.isAdminMode && !storeState.modal.isEdit"
                               class="scope-wrapper"
                               :label="$t('HOME.FORM_SCOPE')"
                               required
                >
                    <p-radio-group>
                        <p-radio v-for="(item, idx) in state.radioMenuList"
                                 :key="`bookmark-scope-${idx}`"
                                 v-model="state.selectedRadioIdx"
                                 :value="idx"
                        >
                            <span class="radio-item">
                                {{ item.label }}
                            </span>
                        </p-radio>
                    </p-radio-group>
                </p-field-group>
            </div>
        </template>
        <template #confirm-button>
            <span v-if="!storeState.modal.isEdit">{{ $t('HOME.BOOKMARK_CREATE') }}</span>
        </template>
    </p-button-modal>
</template>
