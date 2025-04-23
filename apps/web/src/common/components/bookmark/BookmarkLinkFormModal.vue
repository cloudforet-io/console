<script setup lang="ts">
import { computed, reactive, watch } from 'vue';


import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancellable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PButton, PButtonModal, PFieldGroup, PI, PRadio, PRadioGroup, PTextInput,
} from '@cloudforet/mirinae';

import { ROLE_TYPE } from '@/api-clients/identity/role/constant';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useAuthorizationStore } from '@/store/authorization/authorization-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import {
    checkValidUrl,
    convertUrlProtocol,
    generateNewFolderName,
} from '@/common/components/bookmark/composables/use-bookmark';
import { BOOKMARK_MODAL_TYPE } from '@/common/components/bookmark/constant/constant';
import { useBookmarkStore } from '@/common/components/bookmark/store/bookmark-store';
import type { BookmarkItem, BookmarkModalStateType, RadioType } from '@/common/components/bookmark/type/type';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';

import { BOOKMARK_TYPE } from '@/services/workspace-home/constants/workspace-home-constant';
import type { BookmarkType } from '@/services/workspace-home/types/workspace-home-type';

interface Props {
    bookmarkFolderList?: BookmarkItem[],
}

const props = withDefaults(defineProps<Props>(), {
    bookmarkFolderList: undefined,
});

const bookmarkStore = useBookmarkStore();
const bookmarkState = bookmarkStore.state;
const userWorkspaceStore = useUserWorkspaceStore();
const userWorkspaceStoreGetters = userWorkspaceStore.getters;
const appContextStore = useAppContextStore();
const appContextGetters = appContextStore.getters;
const authorizationStore = useAuthorizationStore();

const emit = defineEmits<{(e: 'confirm', selectedFolder?: BookmarkItem, scope?: BookmarkType): void; }>();

const storeState = reactive({
    isAdminMode: computed(() => appContextGetters.isAdminMode),
    currentWorkspaceId: computed<string|undefined>(() => userWorkspaceStoreGetters.currentWorkspaceId),
    isWorkspaceMember: computed<boolean>(() => authorizationStore.state.currentRoleInfo?.roleType === ROLE_TYPE.WORKSPACE_MEMBER),

    modal: computed<BookmarkModalStateType>(() => bookmarkState.modal),
    selectedBookmark: computed<BookmarkItem|undefined>(() => bookmarkState.selectedBookmark),
    bookmarkType: computed<BookmarkType|undefined>(() => bookmarkState.bookmarkType),
});
const state = reactive({
    loading: false,
    bookmarkFolderList: [] as BookmarkItem[],
    selectedFolderIdx: undefined as number|undefined,
    selectedFolder: computed<BookmarkItem|undefined>(() => (state.bookmarkFolderList ? state.bookmarkFolderList[state.selectedFolderIdx] : undefined)),
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
    scope: computed<BookmarkType>(() => state.radioMenuList[state.selectedRadioIdx].name),
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
        await bookmarkStore.createBookmarkFolder(newFolder, state.scope);
        await fetchBookmarkFolderList();
        state.selectedFolderIdx = 0;
    } catch (e: any) {
        ErrorHandler.handleRequestError(e, e.message);
    }
};
const fetchBookmarkFolderList = async () => {
    const defaultFilter: ConsoleFilter[] = [
        { k: 'name', v: 'console:bookmark', o: '' },
        { k: 'data.link', v: null, o: '=' },
    ];
    if (!storeState.isAdminMode) {
        defaultFilter.push({ k: 'data.workspaceId', v: storeState.currentWorkspaceId || '', o: '=' });
    }
    const bookmarkListApiQuery = new ApiQueryHelper()
        .setSort('updated_at', true)
        .setFilters(defaultFilter);
    try {
        let fetcher;
        if (state.scope === BOOKMARK_TYPE.USER) {
            fetcher = getCancellableFetcher(SpaceConnector.clientV2.config.userConfig.list);
        } else if (storeState.isAdminMode || state.scope === BOOKMARK_TYPE.WORKSPACE) {
            fetcher = getCancellableFetcher(SpaceConnector.clientV2.config.sharedConfig.list);
        }
        const { status, response } = await fetcher({
            query: bookmarkListApiQuery.data,
        });
        if (status === 'succeed') {
            const list = (response.results ?? []).map((i) => ({
                ...i.data,
                id: i.name,
            } as BookmarkItem));
            state.bookmarkFolderList = storeState.isAdminMode ? list.filter((i) => i.isGlobal) : list;
        }
    } catch (e) {
        ErrorHandler.handleError(e);
        state.bookmarkFolderList = [];
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
                type: state.scope,
            });
            showSuccessMessage(i18n.t('HOME.ALT_S_ADD_LINK'), '');
        }
        emit('confirm', state.selectedFolder, state.scope);
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
watch(() => state.selectedRadioIdx, () => {
    fetchBookmarkFolderList();
}, { immediate: true });
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
                <p-field-group v-if="!storeState.isAdminMode && (!storeState.modal.isEdit && storeState.modal.isNew)"
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
                        <p-radio-group :direction="'vertical'"
                                       class="radio-group"
                        >
                            <p-radio v-for="(item, idx) in state.bookmarkFolderList"
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
        .radio-group {
            @apply overflow-y-auto;
            max-height: 12.5rem;
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
