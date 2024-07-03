<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import {
    PButton,
    PCheckbox,
    PDataLoader,
    PFieldGroup,
    PPaneLayout, PRadio, PRadioGroup,
    PTextInput,
} from '@spaceone/design-system';

import { SpaceRouter } from '@/router';
import type { PostUpdateParameters } from '@/schema/board/post/api-verbs/update';
import { POST_BOARD_TYPE } from '@/schema/board/post/constant';
import type { WorkspaceModel } from '@/schema/identity/workspace/model';
import { store } from '@/store';
import { i18n } from '@/translations';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import { emptyHtmlRegExp } from '@/common/components/editor/extensions/image/helper';
import type { Attachment } from '@/common/components/editor/extensions/image/type';
import TextEditor from '@/common/components/editor/TextEditor.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFileUploader } from '@/common/composables/file-uploader';
import { useFormValidator } from '@/common/composables/form-validator';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';

import NoticeWorkspaceDropdown from '@/services/info/components/NoticeWorkspaceDropdown.vue';
import { INFO_ROUTE } from '@/services/info/routes/route-constant';
import { useNoticeDetailStore } from '@/services/info/stores/notice-detail-store';
import type { NoticeFormType, WorkspaceDropdownMenuItem } from '@/services/info/types/notice-type';

interface Props {
    type?: NoticeFormType;
}

const props = withDefaults(defineProps<Props>(), {
    type: 'CREATE',
});

const noticeDetailStore = useNoticeDetailStore();
const noticeDetailState = noticeDetailStore.state;
const userWorkspaceStore = useUserWorkspaceStore();
const userWorkspaceGetters = userWorkspaceStore.getters;

const storeState = reactive({
    workspaceList: computed<WorkspaceModel[]>(() => userWorkspaceGetters.workspaceList),
});
const state = reactive({
    userName: computed<string>(() => store.state.user.name),
    isPinned: false,
    isPopup: false,
    attachments: [] as Attachment[],
});
const workspaceState = reactive({
    selectedItems: [] as WorkspaceDropdownMenuItem[],
    radioMenuList: computed(() => ([
        i18n.t('INFO.NOTICE.FORM.ALL'),
        i18n.t('INFO.NOTICE.FORM.SPECIFIC_WORKSPACE'),
    ])),
    selectedRadioIdx: 0,
});

const {
    forms: {
        noticeTitle,
        writerName,
        contents,
    },
    setForm,
    invalidState,
    invalidTexts,
    isAllValid,
} = useFormValidator({
    noticeTitle: noticeDetailState.post?.title ?? '',
    writerName: noticeDetailState.post?.writer || state.userName || '',
    contents: noticeDetailState.post?.contents || '',
}, {
    noticeTitle(value: string) { return value.trim().length ? '' : i18n.t('INFO.NOTICE.FORM.TITLE_REQUIRED'); },
    writerName(value: string) { return value.trim().length ? '' : i18n.t('INFO.NOTICE.FORM.WRITER_REQUIRED'); },
    contents(value: string) {
        return value.replace(emptyHtmlRegExp, '').length ? '' : i18n.t('INFO.NOTICE.FORM.CONTENT_REQUIRED');
    },
});

const formData = computed<Omit<PostUpdateParameters, 'post_id'>>(() => ({
    title: noticeTitle.value,
    writer: writerName.value,
    contents: contents.value,
    files: state.attachments.map(({ fileId }) => fileId) as string[],
    options: {
        is_pinned: state.isPinned,
        is_popup: state.isPopup,
    },
}));

const { fileUploader } = useFileUploader();
const { getProperRouteLocation } = useProperRouteLocation();


const handleConfirm = () => {
    if (props.type === 'CREATE') handleCreateNotice();
    else if (props.type === 'EDIT') handleEditNotice();
};


const handleCreateNotice = async () => {
    try {
        const data = formData.value;
        if (!data.title || !data.contents) throw new Error('Invalid form data');
        await noticeDetailStore.createNoticePost({
            board_type: POST_BOARD_TYPE.NOTICE,
            title: data.title,
            contents: data.contents,
            category: data.category,
            files: data.files,
            options: data.options,
            writer: data.writer,
            resource_group: 'WORKSPACE',
            workspaces: workspaceState.selectedRadioIdx === 0 ? ['*'] : workspaceState.selectedItems.map((item) => item.name),
        });
        showSuccessMessage(i18n.t('INFO.NOTICE.FORM.ALT_S_CREATE_NOTICE'), '');
        await SpaceRouter.router.push(getProperRouteLocation({ name: INFO_ROUTE.NOTICE._NAME, query: {} }));
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('INFO.NOTICE.FORM.ALT_E_CREATE_NOTICE'));
    }
};
const handleEditNotice = async () => {
    try {
        await noticeDetailStore.updateNoticePost({
            ...formData.value,
            workspaces: workspaceState.selectedRadioIdx === 0 ? [] : workspaceState.selectedItems.map((item) => item.name),
        });
        showSuccessMessage(i18n.t('INFO.NOTICE.FORM.ALT_S_UPDATE_NOTICE'), '');
        SpaceRouter.router.back();
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('INFO.NOTICE.FORM.ALT_E_UPDATE_NOTICE'));
    }
};

watch([() => noticeDetailState.post, () => noticeDetailState.loading], async ([notice, loading]) => {
    if (loading) return;

    // INIT STATES
    state.isPinned = notice?.options?.is_pinned ?? false;
    state.isPopup = notice?.options?.is_popup ?? false;
    state.attachments = notice?.files?.map((file) => ({ fileId: file.file_id, downloadUrl: file.download_url ?? '' })) ?? [];
    setForm('writerName', notice?.writer ?? store.state.user.name);
    setForm('noticeTitle', notice?.title ?? '');
    setForm('contents', notice?.contents ?? '');

    if (notice?.workspaces?.includes('*')) {
        workspaceState.selectedRadioIdx = 0;
        workspaceState.selectedItems = [];
    } else {
        workspaceState.selectedRadioIdx = 1;
        workspaceState.selectedItems = (notice?.workspaces ?? []).map((workspace) => {
            const selectedWorkspace = storeState.workspaceList.find((w) => w.workspace_id === workspace);
            return {
                label: selectedWorkspace?.name || '',
                name: selectedWorkspace?.workspace_id || '',
                tags: selectedWorkspace?.tags,
            };
        });
    }
});

</script>

<template>
    <div class="notice-form">
        <p-pane-layout class="notice-form-wrapper">
            <p-data-loader :loading="noticeDetailState.loading"
                           :data="noticeDetailState.post"
            >
                <p-field-group class="notice-label-wrapper writer-name-input"
                               :label="$t('INFO.NOTICE.FORM.LABEL_WRITER_NAME')"
                               required
                >
                    <template #default="{invalid}">
                        <p-text-input :value="writerName"
                                      :invalid="invalid"
                                      :placeholder="$store.state.user.name || $t('INFO.NOTICE.FORM.PLACEHOLDER_REQUIRED')"
                                      @update:value="setForm('writerName', $event)"
                        />
                    </template>
                </p-field-group>
                <p-field-group class="notice-label-wrapper"
                               :label="$t('INFO.NOTICE.FORM.WORKSPACE')"
                               required
                >
                    <p-radio-group>
                        <p-radio v-for="(item, idx) in workspaceState.radioMenuList"
                                 :key="`workspace-scope-${idx}`"
                                 v-model="workspaceState.selectedRadioIdx"
                                 :value="idx"
                        >
                            <span class="radio-item">
                                {{ item }}
                            </span>
                        </p-radio>
                    </p-radio-group>
                    <notice-workspace-dropdown v-if="workspaceState.selectedRadioIdx === 1"
                                               :selected-items.sync="workspaceState.selectedItems"
                                               :type="props.type"
                    />
                </p-field-group>
                <p-field-group class="notice-label-wrapper"
                               :label="$t('INFO.NOTICE.FORM.LABEL_TITLE')"
                               required
                               :invalid="invalidState.noticeTitle"
                               :invalid-text="invalidTexts.noticeTitle"
                >
                    <template #default="{invalid}">
                        <p-text-input :value="noticeTitle"
                                      :invalid="invalid"
                                      class="!w-full"
                                      @update:value="setForm('noticeTitle', $event)"
                        />
                    </template>
                </p-field-group>
                <p-field-group class="notice-label-wrapper"
                               :label="$t('INFO.NOTICE.FORM.LABEL_CONTENT')"
                               required
                               :invalid="invalidState.contents"
                               :invalid-text="invalidTexts.contents"
                >
                    <template #default="{invalid}">
                        <text-editor :value="contents"
                                     :attachments.sync="state.attachments"
                                     :image-uploader="fileUploader"
                                     :invalid="invalid"
                                     @update:value="(d) => setForm('contents', d)"
                        />
                    </template>
                </p-field-group>
                <div class="notice-create-options-wrapper">
                    <p-checkbox v-model="state.isPinned">
                        <span>{{ $t('INFO.NOTICE.FORM.PIN_NOTICE') }}</span>
                    </p-checkbox>
                    <p-checkbox v-model="state.isPopup">
                        <span>{{ $t('INFO.NOTICE.FORM.IN_POP_UP') }}</span>
                    </p-checkbox>
                </div>
            </p-data-loader>
        </p-pane-layout>
        <div class="notice-create-buttons-wrapper">
            <p-button style-type="tertiary"
                      size="lg"
                      :disabled="noticeDetailState.loadingForCUD"
                      @click="$router.go(-1)"
            >
                {{ $t('INFO.NOTICE.FORM.CANCEL') }}
            </p-button>
            <p-button style-type="primary"
                      size="lg"
                      :disabled="!isAllValid || (workspaceState.selectedRadioIdx === 1 && workspaceState.selectedItems.length === 0)"
                      :loading="noticeDetailState.loadingForCUD"
                      @click="handleConfirm"
            >
                {{ $t('INFO.NOTICE.FORM.CONFIRM') }}
            </p-button>
        </div>
    </div>
</template>

<style scoped lang="postcss">
.notice-form-wrapper {
    padding: 1.625rem 0.625rem;
    .notice-label-wrapper {
        @apply mb-4;
        .p-radio {
            @apply inline-flex gap-1;
        }
    }
    .writer-name-input {
        /* custom design-system component - p-text-input */
        :deep(.p-text-input) {
            @apply w-1/2;
            .input-container {
                @apply w-full;
            }
        }
    }
    .notice-create-options-wrapper {
        @apply flex flex-col gap-2;
    }
}
.notice-create-buttons-wrapper {
    @apply inline-flex float-right mt-4;
    & .p-button {
        @apply ml-4;
    }
}
</style>
