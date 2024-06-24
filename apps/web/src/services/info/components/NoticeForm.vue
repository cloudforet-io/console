<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { useRouter } from 'vue-router/composables';

import {
    PButton,
    PCheckbox,
    PDataLoader,
    PEmpty,
    PFieldGroup,
    PPaneLayout, PRadio, PRadioGroup,
    PSelectDropdown,
    PTextHighlighting,
    PTextInput,
    PBadge,
} from '@spaceone/design-system';
import type {
    AutocompleteHandler,
    SelectDropdownMenuItem,
} from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { SpaceRouter } from '@/router';
import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { PostUpdateParameters } from '@/schema/board/post/api-verbs/update';
import { POST_BOARD_TYPE } from '@/schema/board/post/constant';
import type { WorkspaceListParameters } from '@/schema/identity/workspace/api-verbs/list';
import type { WorkspaceModel } from '@/schema/identity/workspace/model';
import { store } from '@/store';
import { i18n } from '@/translations';

import { makeAdminRouteName } from '@/router/helpers/route-helper';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import { emptyHtmlRegExp } from '@/common/components/editor/extensions/image/helper';
import type { Attachment } from '@/common/components/editor/extensions/image/type';
import TextEditor from '@/common/components/editor/TextEditor.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFileUploader } from '@/common/composables/file-uploader';
import { useFormValidator } from '@/common/composables/form-validator';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import { INFO_ROUTE } from '@/services/info/routes/route-constant';
import { useNoticeDetailStore } from '@/services/info/stores/notice-detail-store';
import { PREFERENCE_ROUTE } from '@/services/preference/routes/route-constant';

interface WorkspaceDropdownMenuItem extends SelectDropdownMenuItem {
    tags?: {
        theme?: string;
    };
}
interface Props {
    type?: NoticeFormType;
}
type NoticeFormType = 'CREATE' | 'EDIT';

const props = withDefaults(defineProps<Props>(), {
    type: 'CREATE',
});

const noticeDetailStore = useNoticeDetailStore();
const noticeDetailState = noticeDetailStore.state;
const userWorkspaceStore = useUserWorkspaceStore();
const userWorkspaceGetters = userWorkspaceStore.getters;

const router = useRouter();

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
    loading: true,
    visible: false,
    menuItems: [] as WorkspaceDropdownMenuItem[],
    selectedItems: [] as WorkspaceDropdownMenuItem[],
    searchText: '',
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

const workspaceMenuHandler: AutocompleteHandler = async (inputText: string) => {
    await fetchListWorkspaces(inputText);
    return {
        results: workspaceState.menuItems as WorkspaceDropdownMenuItem[],
    };
};
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
        await SpaceRouter.router.push(getProperRouteLocation({ name: INFO_ROUTE.NOTICE._NAME, query: {} }));
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('INFO.NOTICE.FORM.ALT_E_CREATE_NOTICE'));
    }
};
const handleEditNotice = async () => {
    try {
        await noticeDetailStore.updateNoticePost({
            ...formData.value,
            workspaces: workspaceState.selectedRadioIdx === 0 ? ['*'] : workspaceState.selectedItems.map((item) => item.name),
        });
        showSuccessMessage(i18n.t('INFO.NOTICE.FORM.ALT_S_UPDATE_NOTICE'), '');
        SpaceRouter.router.back();
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('INFO.NOTICE.FORM.ALT_E_UPDATE_NOTICE'));
    }
};

const workspaceListApiQueryHelper = new ApiQueryHelper()
    .setPageStart(1).setPageLimit(15)
    .setSort('name', true);
const fetchListWorkspaces = async (inputText: string) => {
    workspaceState.loading = true;

    workspaceListApiQueryHelper.setFilters([
        { k: 'name', v: inputText, o: '' },
        { k: 'state', v: 'ENABLED', o: '' },
    ]);
    try {
        const { results } = await SpaceConnector.clientV2.identity.workspace.list<WorkspaceListParameters, ListResponse<WorkspaceModel>>({
            query: workspaceListApiQueryHelper.data,
        });
        workspaceState.menuItems = (results ?? []).map((role) => ({
            label: role.name,
            name: role.workspace_id,
            tags: role.tags,
        }));
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        workspaceState.loading = false;
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
        await fetchListWorkspaces('');
        workspaceState.selectedItems = (notice?.workspaces ?? []).map((workspace) => {
            const selectedWorkspace = storeState.workspaceList.find((w) => w.workspace_id === workspace);
            return {
                label: selectedWorkspace?.name || '',
                name: selectedWorkspace?.workspace_id || '',
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
                    <p-select-dropdown v-if="workspaceState.selectedRadioIdx === 1"
                                       use-fixed-menu-style
                                       :visible-menu.sync="workspaceState.visible"
                                       :loading="workspaceState.loading"
                                       :search-text.sync="workspaceState.searchText"
                                       :selected.sync="workspaceState.selectedItems"
                                       :handler="workspaceMenuHandler"
                                       show-select-marker
                                       is-filterable
                                       multi-selectable
                                       appearance-type="badge"
                                       show-delete-all-button
                                       class="workspace-select-dropdown"
                                       :class="{'no-data': workspaceState.menuItems.length === 0 && !workspaceState.loading}"
                    >
                        <template #dropdown-button>
                            <div v-if="workspaceState.selectedItems.length > 0"
                                 class="selected-workspace-wrapper"
                            >
                                <workspace-logo-icon :text="workspaceState.selectedItems[0].label || ''"
                                                     :theme="workspaceState.selectedItems[0].tags?.theme"
                                                     size="xxs"
                                />
                                <span>{{ workspaceState.selectedItems[0].label }}</span>
                                <p-badge v-if="workspaceState.selectedItems.length > 1"
                                         style-type="blue200"
                                         badge-type="subtle"
                                >
                                    + {{ workspaceState.selectedItems.length - 1 }}
                                </p-badge>
                            </div>
                            <span v-else
                                  class="placeholder"
                            >
                                {{ $t('INFO.NOTICE.FORM.SELECT') }}
                            </span>
                        </template>
                        <template #menu-item--format="{item}">
                            <div class="menu-item-wrapper">
                                <workspace-logo-icon :text="item?.label || ''"
                                                     :theme="item?.tags?.theme"
                                                     size="xxs"
                                />
                                <p-text-highlighting class="label-text"
                                                     :text="item.label"
                                                     :term="workspaceState.searchText"
                                />
                            </div>
                        </template>
                        <template #no-data-area>
                            <p-empty v-if="workspaceState.menuItems.length === 0 && !workspaceState.loading"
                                     image-size="sm"
                                     show-image
                                     show-button
                                     class="no-data-wrapper"
                            >
                                <template #image>
                                    <img src="@/assets/images/illust_planet.svg"
                                         alt="empty-options"
                                    >
                                </template>
                                <template #button>
                                    <p-button style-type="substitutive"
                                              icon-left="ic_plus_bold"
                                              @click="router.push({ name: makeAdminRouteName(PREFERENCE_ROUTE.WORKSPACES._NAME) })"
                                    >
                                        {{ $t('INFO.NOTICE.FORM.CREATE_WORKSPACE') }}
                                    </p-button>
                                </template>
                                {{ $t('INFO.NOTICE.FORM.NO_WORKSPACE') }}
                            </p-empty>
                        </template>
                    </p-select-dropdown>
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

    .workspace-select-dropdown {
        width: 50%;
        margin-top: 0.25rem;
        .no-data-wrapper {
            margin-top: 2rem;
            margin-bottom: 2rem;
        }
        .menu-item-wrapper {
            @apply flex items-center;
            gap: 0.25rem;
        }
        .selected-workspace-wrapper {
            @apply flex items-center;
            gap: 0.25rem;
        }
        .placeholder {
            @apply text-gray-600;
        }
    }
}
.notice-create-buttons-wrapper {
    @apply inline-flex float-right mt-4;
    & .p-button {
        @apply ml-4;
    }
}
</style>
