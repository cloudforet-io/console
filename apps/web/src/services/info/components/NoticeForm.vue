<script setup lang="ts">
import {
    computed, reactive, watch, toRef, ref,
} from 'vue';

import { isEqual } from 'lodash';

import {
    PButton,
    PCheckbox,
    PDataLoader,
    PFieldGroup,
    PPaneLayout, PRadio, PRadioGroup,
    PTextInput,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import { RESOURCE_GROUP } from '@/api-clients/_common/schema/constant';
import type { ContentsType, ResourceGroupType } from '@/api-clients/_common/schema/type';
import type { WorkspaceModel } from '@/api-clients/identity/workspace/schema/model';
import { SpaceRouter } from '@/router';
import type { PostUpdateParameters } from '@/schema/board/post/api-verbs/update';
import { POST_BOARD_TYPE } from '@/schema/board/post/constant';
import { i18n } from '@/translations';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useUserStore } from '@/store/user/user-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import { emptyHtmlRegExp } from '@/common/components/editor/extensions/image/helper';
import TextEditor from '@/common/components/editor/TextEditor.vue';
import { useEditorContentTransformer } from '@/common/composables/editor-content-transformer';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFileUploader } from '@/common/composables/file-uploader';
import { useFormValidator } from '@/common/composables/form-validator';


import NoticeWorkspaceDropdown from '@/services/info/components/NoticeWorkspaceDropdown.vue';
import { ADMIN_INFO_ROUTE } from '@/services/info/routes/admin/route-constant';
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
const userStore = useUserStore();

const storeState = reactive({
    workspaceList: computed<WorkspaceModel[]>(() => userWorkspaceGetters.workspaceList),
    postResourceGroup: computed<ResourceGroupType|undefined>(() => noticeDetailState.post?.resource_group),
    userName: computed<string|undefined>(() => userStore.state.name),
});
const state = reactive({
    isPinned: false,
    isPopup: false,
    fileIds: [] as string[],
});
const workspaceState = reactive({
    selectedItems: [] as WorkspaceDropdownMenuItem[],
    radioMenuList: computed<MenuItem[]>(() => ([
        { label: i18n.t('INFO.NOTICE.FORM.ALL'), name: RESOURCE_GROUP.DOMAIN },
        { label: i18n.t('INFO.NOTICE.FORM.SPECIFIC_WORKSPACE'), name: RESOURCE_GROUP.WORKSPACE },
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
    writerName: noticeDetailState.post?.writer || storeState.userName || '',
    contents: noticeDetailState.post?.contents || '',
}, {
    noticeTitle(value: string) { return value.trim().length ? '' : i18n.t('INFO.NOTICE.FORM.TITLE_REQUIRED'); },
    writerName(value: string) { return value.trim().length ? '' : i18n.t('INFO.NOTICE.FORM.WRITER_REQUIRED'); },
    contents(value: string) {
        return value.replace(emptyHtmlRegExp, '').length ? '' : i18n.t('INFO.NOTICE.FORM.CONTENT_REQUIRED');
    },
});

const contentsType = ref<ContentsType>('markdown');
const resourceGroup = 'DOMAIN';
const { fileUploader } = useFileUploader({ resourceGroup });
const {
    contents: uploadContents,
    editorContents,
} = useEditorContentTransformer({
    contentsType,
    resourceGroup,
    fileIds: toRef(state, 'fileIds'), // auto update to state.fileIds
    contents,
});
watch(uploadContents, (d) => {
    setForm('contents', d);
});
const formData = computed<Omit<PostUpdateParameters, 'post_id'>>(() => ({
    title: noticeTitle.value,
    writer: writerName.value,
    contents: contents.value,
    files: state.fileIds,
    options: {
        is_pinned: state.isPinned,
        is_popup: state.isPopup,
    },
}));



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
            resource_group: workspaceState.selectedRadioIdx === 0 ? 'DOMAIN' : 'WORKSPACE',
            workspaces: workspaceState.selectedRadioIdx === 0 ? ['*'] : workspaceState.selectedItems.map((item) => item.name),
        });
        showSuccessMessage(i18n.t('INFO.NOTICE.FORM.ALT_S_CREATE_NOTICE'), '');
        await SpaceRouter.router.push({ name: ADMIN_INFO_ROUTE.NOTICE._NAME, query: {} });
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('INFO.NOTICE.FORM.ALT_E_CREATE_NOTICE'));
    }
};
const handleEditNotice = async () => {
    try {
        const originData = noticeDetailState.post;
        if (!originData) throw new Error('Origin data is not found');
        const postData: Omit<PostUpdateParameters, 'post_id'> = {};
        if (originData.title !== formData.value.title) postData.title = formData.value.title;
        if (originData.writer !== formData.value.writer) postData.writer = formData.value.writer;
        if (originData.contents !== formData.value.contents) postData.contents = formData.value.contents;
        if (!isEqual(originData.files, formData.value.files)) {
            postData.files = formData.value.files?.filter((f) => !!f);
        }
        if (!isEqual(originData.options, formData.value.options)) postData.options = formData.value.options;

        await noticeDetailStore.updateNoticePost({
            ...postData,
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
    state.fileIds = notice?.files?.map((file) => file.file_id) ?? [];
    setForm('writerName', notice?.writer ?? storeState.userName);
    setForm('noticeTitle', notice?.title ?? '');
    setForm('contents', notice?.contents ?? '');
    contentsType.value = notice?.contents_type ?? 'markdown';

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
                        <div class="name-input-wrapper">
                            <p-text-input :value="writerName"
                                          block
                                          :invalid="invalid"
                                          :placeholder="storeState.userName || $t('INFO.NOTICE.FORM.PLACEHOLDER_REQUIRED')"
                                          @update:value="setForm('writerName', $event)"
                            />
                        </div>
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
                                 :disabled="props.type === 'EDIT' && item.name !== storeState.postResourceGroup"
                                 :value="idx"
                        >
                            <span class="radio-item">
                                {{ item.label }}
                            </span>
                        </p-radio>
                    </p-radio-group>
                    <notice-workspace-dropdown v-if="workspaceState.selectedRadioIdx === 1"
                                               :selected-items.sync="workspaceState.selectedItems"
                                               :type="props.type"
                                               class="workspace-dropdown"
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
                        <text-editor :value="editorContents"
                                     :image-uploader="fileUploader"
                                     :invalid="invalid"
                                     :contents-type="contentsType"
                                     @update:value="editorContents = $event"
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
        .name-input-wrapper {
            width: 50%;
        }
    }
    .notice-create-options-wrapper {
        @apply flex flex-col gap-2;
    }

    .workspace-dropdown {
        width: 50%;
    }
}
.notice-create-buttons-wrapper {
    @apply inline-flex float-right mt-4;
    & .p-button {
        @apply ml-4;
    }
}
</style>
