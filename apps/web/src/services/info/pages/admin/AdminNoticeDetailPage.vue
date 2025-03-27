<script setup lang="ts">
import {
    computed, onBeforeMount, reactive,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PButton, PButtonModal, PHeading, PHeadingLayout, PDataTable, PStatus,
} from '@cloudforet/mirinae';
import type { DataTableField } from '@cloudforet/mirinae/types/data-display/tables/data-table/type';

import { RESOURCE_GROUP } from '@/api-clients/_common/schema/constant';
import type { WorkspaceModel } from '@/api-clients/identity/workspace/schema/model';
import type { PostSendParameters } from '@/schema/board/post/api-verbs/send';
import type { PostModel } from '@/schema/board/post/model';
import { i18n } from '@/translations';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useUserStore } from '@/store/user/user-store';

import {
    hideLoadingMessage,
    showErrorMessage,
    showLoadingMessage,
    showSuccessMessage,
} from '@/lib/helper/notice-alert-helper';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { usePageEditableStatus } from '@/common/composables/page-editable-status';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import { workspaceStateFormatter } from '@/services/advanced/composables/refined-table-data';
import { WORKSPACE_STATE } from '@/services/advanced/constants/workspace-constant';
import NoticeDetail from '@/services/info/components/NoticeDetail.vue';
import { ADMIN_INFO_ROUTE } from '@/services/info/routes/admin/route-constant';
import { useNoticeDetailStore } from '@/services/info/stores/notice-detail-store';

const props = defineProps<{
    postId: string;
}>();

const noticeDetailStore = useNoticeDetailStore();
const noticeDetailState = noticeDetailStore.state;
const userWorkspaceStore = useUserWorkspaceStore();
const userWorkspaceGetters = userWorkspaceStore.getters;
const userStore = useUserStore();

const { hasReadWriteAccess } = usePageEditableStatus();

const router = useRouter();

const storeState = reactive({
    post: computed<undefined|PostModel>(() => noticeDetailState.post),
    workspaceList: computed<WorkspaceModel[]>(() => userWorkspaceGetters.workspaceList),
    hasPermissionToEditOrDelete: computed<boolean>(() => userStore.getters.isDomainAdmin),
});
const state = reactive({
    deleteModalVisible: false,
    allSendingEmailModalVisible: false,
    specificSendingEmailModalVisible: false,
    sendLoading: false,
    isAllWorkspace: computed<boolean>(() => (!storeState.post?.workspaces || storeState.post?.workspaces?.includes('*')) ?? true),
    scopedWorkspaceList: computed<WorkspaceModel[]|undefined>(() => {
        if (state.isAllWorkspace) return undefined;
        return storeState.workspaceList.filter((workspace) => storeState.post?.workspaces.includes(workspace.workspace_id));
    }),
});

const tableField:DataTableField = [
    { name: 'name', label: 'Workspace' },
    { name: 'state', label: 'State' },
];

const handleClickEditButton = () => {
    if (!props.postId) {
        ErrorHandler.handleError(new Error('postId is undefined'));
        return;
    }
    router.push({
        name: ADMIN_INFO_ROUTE.NOTICE.UPDATE._NAME,
        params: { postId: props.postId },
    });
};

const handleDeleteModalOpen = () => {
    state.deleteModalVisible = true;
};

const handleDeleteNoticeConfirm = async () => {
    try {
        if (!props.postId) throw new Error('postId is undefined');
        await noticeDetailStore.deleteNoticePost(props.postId);
        showSuccessMessage(i18n.t('INFO.NOTICE.FORM.ALT_S_DELETE_NOTICE'), '');
        await router.push({ name: ADMIN_INFO_ROUTE.NOTICE._NAME });
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('INFO.NOTICE.FORM.ALT_E_DELETE_NOTICE'));
    } finally {
        state.deleteModalVisible = false;
    }
};

const handleOpenEmailSendingModal = () => {
    if (state.isAllWorkspace) {
        state.allSendingEmailModalVisible = true;
        return;
    }
    state.specificSendingEmailModalVisible = true;
};
const handleClickSendEmail = async () => {
    state.sendLoading = true;
    const loadingMessageId = showLoadingMessage(i18n.t('INFO.NOTICE.DETAIL.ALT_S_SENDING'), '');

    try {
        const delayHideLoadingMessage = new Promise((resolve) => {
            setTimeout(resolve, 1500);
        });

        await Promise.all([
            SpaceConnector.clientV2.board.post.send<PostSendParameters>({
                post_id: props.postId,
            }),
            delayHideLoadingMessage,
        ]);

        hideLoadingMessage(loadingMessageId);
        showSuccessMessage(i18n.t('INFO.NOTICE.DETAIL.ALT_S_SEND_EMAIL'), '');
    } catch (e) {
        ErrorHandler.handleError(e);
        hideLoadingMessage(loadingMessageId);
        showErrorMessage(i18n.t('INFO.NOTICE.DETAIL.ALT_E_SEND_EMAIL'), e);
    } finally {
        state.allSendingEmailModalVisible = false;
        state.specificSendingEmailModalVisible = false;
        state.sendLoading = false;
    }
};

onBeforeMount(async () => {
    noticeDetailStore.reset(); // do not reset on unmounted for the case of moving to update page
    await noticeDetailStore.getNoticePost(props.postId);
});
</script>

<template>
    <div>
        <p-heading-layout class="mb-6">
            <template #heading>
                <p-heading :title="noticeDetailState.post?.title"
                           show-back-button
                           @click-back-button="$router.go(-1)"
                />
            </template>
            <template v-if="hasReadWriteAccess"
                      #extra
            >
                <div v-if="storeState.hasPermissionToEditOrDelete"
                     class="button-group"
                >
                    <p-button v-if="storeState.post?.resource_group !== RESOURCE_GROUP.SYSTEM"
                              style-type="tertiary"
                              icon-left="ic_edit"
                              @click="handleClickEditButton"
                    >
                        {{ $t('INFO.NOTICE.FORM.EDIT') }}
                    </p-button>
                    <p-button v-if="storeState.post?.resource_group !== RESOURCE_GROUP.SYSTEM"
                              style-type="tertiary"
                              icon-left="ic_paper-airplane"
                              :loading="state.sendLoading"
                              @click="handleOpenEmailSendingModal"
                    >
                        {{ $t('INFO.NOTICE.FORM.SEND_EMAIL_MODAL_TITLE') }}
                    </p-button>
                    <p-button v-if="storeState.post?.resource_group !== RESOURCE_GROUP.SYSTEM"
                              style-type="negative-secondary"
                              @click="handleDeleteModalOpen"
                    >
                        {{ $t('INFO.NOTICE.FORM.DELETE') }}
                    </p-button>
                </div>
            </template>
        </p-heading-layout>
        <notice-detail :post-id="props.postId" />
        <delete-modal :header-title="$t('INFO.NOTICE.FORM.DELETE_MODAL_TITLE')"
                      :visible.sync="state.deleteModalVisible"
                      :contents="$t('INFO.NOTICE.FORM.DELETE_MODAL_CONTENTS')"
                      @confirm="handleDeleteNoticeConfirm"
        />
        <p-button-modal :visible.sync="state.allSendingEmailModalVisible"
                        :header-title="$t('INFO.NOTICE.DETAIL.ALL_SENDING_EMAIL_MODAL_TITLE')"
                        size="sm"
                        @close="state.allSendingEmailModalVisible = false"
                        @cancel="state.allSendingEmailModalVisible = false"
                        @confirm="handleClickSendEmail"
        >
            <template #body>
                <div class="pt-4">
                    {{ $t('INFO.NOTICE.DETAIL.ALL_SENDING_EMAIL_MODAL_CONTENT') }}
                </div>
            </template>
        </p-button-modal>
        <p-button-modal :visible.sync="state.specificSendingEmailModalVisible"
                        :header-title="$t('INFO.NOTICE.DETAIL.SPECIFIC_SENDING_EMAIL_MODAL_TITLE')"
                        @close="state.specificSendingEmailModalVisible = false"
                        @cancel="state.specificSendingEmailModalVisible = false"
                        @confirm="handleClickSendEmail"
        >
            <template #body>
                <div class="pt-2">
                    <p-data-table :fields="tableField"
                                  :items="state.scopedWorkspaceList"
                    >
                        <template #col-name-format="{value, item}">
                            <div class="workspace-wrapper">
                                <workspace-logo-icon :text="value || ''"
                                                     :theme="item?.tags?.theme"
                                                     size="xs"
                                />
                                <span>{{ item?.name }}</span>
                            </div>
                        </template>
                        <template #col-state-format="{item, value}">
                            <p-status v-bind="workspaceStateFormatter(item.is_dormant ? WORKSPACE_STATE.DORMANT : value)"
                                      class="capitalize"
                            />
                        </template>
                    </p-data-table>
                </div>
            </template>
        </p-button-modal>
    </div>
</template>

<style scoped lang="postcss">
.button-group {
    @apply flex gap-2;
}

.workspace-wrapper {
    @apply flex items-center;
    gap: 0.25rem;
}
</style>
