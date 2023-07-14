<script lang="ts" setup>
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PPaneLayout, PFieldGroup, PTextInput, PRadio, PFilterableDropdown, PCheckbox, PButton,
} from '@spaceone/design-system';
import type { ComputedRef } from 'vue';
import {
    computed,
    reactive, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import { emptyHtmlRegExp } from '@/common/components/editor/extensions/image/helper';
import type { Attachment } from '@/common/components/editor/extensions/image/type';
import TextEditor from '@/common/components/editor/TextEditor.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFileUploader } from '@/common/composables/file-uploader';
import { useFormValidator } from '@/common/composables/form-validator';

import type { NoticePostModel } from '@/services/info/notice/type';
import { INFO_ROUTE } from '@/services/info/route-config';


interface DomainItem {
    name: string;
    label: string;
}

type NoticeFormType = 'CREATE' | 'EDIT';
interface Props {
    boardId: string;
    type: NoticeFormType;
    noticePostData: Partial<NoticePostModel>;
}

const props = withDefaults(defineProps<Props>(), {
    boardId: undefined,
    type: 'CREATE',
    noticePostData: () => ({}),
});
const router = useRouter();
const store = useStore();
const { t } = useI18n();

const state = reactive({
    hasSystemRole: computed<boolean>(() => store.getters['user/hasSystemRole']),
    hasDomainRole: computed<boolean>(() => store.getters['user/hasDomainRole']),
    userName: computed<string>(() => store.state.user.name),
    isPinned: false,
    isPopup: false,
    attachments: [] as Attachment[],
    isAllDomainSelected: !!store.getters['user/hasSystemRole'], // It's active only in root domain case
    boardIdState: '',
    domainList: [] as Array<DomainItem>,
    selectedDomain: store.getters['user/hasSystemRole']
        ? []
        : [{ name: store.state.domain.domainId, label: store.state.domain.domainId }] as Array<DomainItem>,
    postId: '',
    domainName: '',
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
    noticeTitle: props.noticePostData?.title ?? '',
    writerName: props.noticePostData?.writer || state.userName || '',
    contents: props.noticePostData?.contents || '',
}, {
    noticeTitle(value: string) { return value.trim().length ? '' : t('INFO.NOTICE.FORM.TITLE_REQUIRED'); },
    writerName(value: string) { return value.trim().length ? '' : t('INFO.NOTICE.FORM.WRITER_REQUIRED'); },
    contents(value: string) {
        return value.replace(emptyHtmlRegExp, '').length ? '' : t('INFO.NOTICE.FORM.CONTENT_REQUIRED');
    },
});

const formData:ComputedRef = computed(() => ({
    board_id: state.boardIdState,
    title: noticeTitle.value,
    writer: writerName.value,
    contents: contents.value,
    files: state.attachments.map(({ fileId }) => fileId) as string[],
    options: {
        is_pinned: state.isPinned,
        is_popup: state.isPopup,
    },
}));

const { fileUploader } = useFileUploader(computed(() => (state.isAllDomainSelected ? null : state.selectedDomain[0].name)));

const handleConfirm = () => {
    if (props.type === 'CREATE') handleCreateNotice();
    if (props.type === 'EDIT') handleEditNotice();
};

const handleCreateNotice = async () => {
    try {
        await SpaceConnector.client.board.post.create({
            ...formData.value,
            domain_id: state.isAllDomainSelected ? null : state.selectedDomain[0].name,
        });
        showSuccessMessage(t('INFO.NOTICE.FORM.ALT_S_CREATE_NOTICE'), '');
        await router.push({ name: INFO_ROUTE.NOTICE._NAME, query: {} });
    } catch (e) {
        ErrorHandler.handleRequestError(e, t('INFO.NOTICE.FORM.ALT_E_CREATE_NOTICE'));
    }
};
const handleEditNotice = async () => {
    try {
        await SpaceConnector.client.board.post.update(
            state.isAllDomainSelected
                ? {
                    ...formData.value,
                    post_id: state.postId,
                }
                : {
                    ...formData.value,
                    domain_id: state.selectedDomain[0].name,
                    post_id: state.postId,
                },
        );
        showSuccessMessage(t('INFO.NOTICE.FORM.ALT_S_UPDATE_NOTICE'), '');
        await router.back();
    } catch (e) {
        ErrorHandler.handleRequestError(e, t('INFO.NOTICE.FORM.ALT_E_UPDATE_NOTICE'));
    }
};

const handleClickAllDomainRadio = () => { state.isAllDomainSelected = true; };
const handleClickSelectDomainRadio = () => { state.isAllDomainSelected = false; };

const handleSelectDomain = (domain: Array<DomainItem>) => {
    if (!state.isAllDomainSelected) {
        state.selectedDomain = domain;
    }
};

const getDomainList = async () => {
    try {
        const { results } = await SpaceConnector.client.identity.domain.list();
        state.domainList = results.map((d) => ({
            name: d.domain_id,
            label: d.name,
        }));
    } catch (e) {
        ErrorHandler.handleError(e);
        state.domainList = [];
    }
};

const getBoardList = async () => {
    try {
        const { results } = await SpaceConnector.client.board.board.list({
            domain_id: state.domainList.length ? state.domainList.map((d) => d.name)
                : store.state.domain.domainId,
        });
        state.boardIdState = results.filter((d) => d.name === 'Notice')[0]?.board_id ?? '';
    } catch (e) {
        ErrorHandler.handleError(e);
        state.boardIdState = '';
    }
};

watch(() => state.isAllDomainSelected, (isAllDomain: boolean) => {
    if (isAllDomain) state.selectedDomain = [];
});

watch(() => props.noticePostData, async (d: Partial<NoticePostModel>) => {
    if (!Object.keys(d).length) return;
    if (d?.domain_id) {
        const { name } = await SpaceConnector.client.identity.domain.get({ domain_id: d.domain_id });
        state.domainName = name;
    }

    // INIT STATES
    state.isPinned = d.options?.is_pinned ?? false;
    state.isPopup = d.options?.is_popup ?? false;
    state.attachments = d.files?.map((file) => ({ fileId: file.file_id, downloadUrl: file.download_url ?? '' })) ?? [];
    state.isAllDomainSelected = !d?.domain_id;
    state.boardIdState = d?.board_id ?? '';
    state.selectedDomain = d?.domain_id
        ? [{ name: d.domain_id, label: state.domainName || d.domain_id }]
        : [];
    state.postId = d.post_id ?? '';
    setForm('writerName', d.writer);
    setForm('noticeTitle', d.title);
    setForm('contents', d.contents);
});

(async () => {
    if (state.hasSystemRole) await getDomainList();
    await getBoardList();
})();

</script>

<template>
    <div class="notice-form">
        <p-pane-layout class="notice-form-wrapper">
            <p-field-group class="notice-label-wrapper writer-name-input"
                           :label="t('INFO.NOTICE.FORM.LABEL_WRITER_NAME')"
                           required
            >
                <template #default="{invalid}">
                    <p-text-input :value="writerName"
                                  :invalid="invalid"
                                  :placeholder="$store.state.user.name || t('INFO.NOTICE.FORM.PLACEHOLDER_REQUIRED')"
                                  @update:value="setForm('writerName', $event)"
                    />
                </template>
            </p-field-group>
            <p-field-group v-if="state.hasSystemRole"
                           class="notice-label-wrapper"
                           :label="t('INFO.NOTICE.FORM.LABEL_VIEWER')"
                           required
            >
                <p-radio :disabled="type === 'EDIT'"
                         :selected="state.isAllDomainSelected"
                         class="mr-4"
                         @change="handleClickAllDomainRadio"
                >
                    <span>{{ t('INFO.NOTICE.FORM.ALL_DOMAINS') }}</span>
                </p-radio>
                <p-radio :disabled="type === 'EDIT'"
                         :selected="!state.isAllDomainSelected"
                         @change="handleClickSelectDomainRadio"
                >
                    <span>{{ t('INFO.NOTICE.FORM.SELECTED_DOMAIN') }}</span>
                </p-radio>
                <br>
                <p-filterable-dropdown class="mt-2 w-1/2"
                                       :menu="state.domainList"
                                       :selected="state.selectedDomain"
                                       :disabled="state.isAllDomainSelected || type === 'EDIT'"
                                       :placeholder="state.isAllDomainSelected ? t('INFO.NOTICE.FORM.PLACEHOLDER_ALL') : ''"
                                       @update:selected="handleSelectDomain"
                />
            </p-field-group>
            <p-field-group class="notice-label-wrapper"
                           :label="t('INFO.NOTICE.FORM.LABEL_TITLE')"
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
                           :label="t('INFO.NOTICE.FORM.LABEL_CONTENT')"
                           required
                           :invalid="invalidState.contents"
                           :invalid-text="invalidTexts.contents"
            >
                <template #default="{ invalid }">
                    <text-editor v-model:attachments="state.attachments"
                                 :value="contents"
                                 :image-uploader="fileUploader"
                                 :invalid="invalid"
                                 @update:value="(d) => setForm('contents', d)"
                    />
                </template>
            </p-field-group>
            <div v-if="state.hasSystemRole || state.hasDomainRole"
                 class="notice-create-options-wrapper"
            >
                <p-checkbox v-model:value="state.isPinned">
                    <span>{{ t('INFO.NOTICE.FORM.PIN_NOTICE') }}</span>
                </p-checkbox>
                <p-checkbox v-model:value="state.isPopup">
                    <span>{{ t('INFO.NOTICE.FORM.IN_POP_UP') }}</span>
                </p-checkbox>
            </div>
        </p-pane-layout>
        <div class="notice-create-buttons-wrapper">
            <p-button style-type="tertiary"
                      size="lg"
                      @click="router.go(-1)"
            >
                {{ t('INFO.NOTICE.FORM.CANCEL') }}
            </p-button>
            <p-button style-type="primary"
                      size="lg"
                      :disabled="!isAllValid"
                      @click="handleConfirm"
            >
                {{ t('INFO.NOTICE.FORM.CONFIRM') }}
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
