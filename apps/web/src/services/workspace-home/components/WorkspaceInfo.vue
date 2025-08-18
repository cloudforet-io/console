<script setup lang="ts">
import Vue, {
    computed, reactive,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import { cloneDeep, isEmpty } from 'lodash';

import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PButton, PHeading,
    PHeadingLayout,
    PI, PTextButton,
} from '@cloudforet/mirinae';

import { useAppApi } from '@/api-clients/identity/app/composables/use-app-api';
import { ROLE_TYPE } from '@/api-clients/identity/role/constant';
import { useWorkspaceUserApi } from '@/api-clients/identity/workspace-user/composables/use-workspace-user-api';
import type { WorkspaceModel } from '@/api-clients/identity/workspace/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useAuthorizationStore } from '@/store/authorization/authorization-store';

import { MENU_ID } from '@/lib/menu/config';

import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import { gray } from '@/styles/colors';

import { ADMIN_ADVANCED_ROUTE } from '@/services/advanced/routes/admin/route-constant';
import { APP_DROPDOWN_MODAL_TYPE } from '@/services/iam/constants/app-constant';
import { USER_MODAL_TYPE } from '@/services/iam/constants/user-constant';
import { IAM_ROUTE } from '@/services/iam/routes/route-constant';
import { useAppPageStore } from '@/services/iam/store/app-page-store';
import { useUserPageStore } from '@/services/iam/store/user-page-store';

const userWorkspaceStore = useUserWorkspaceStore();
const userWorkspaceGetters = userWorkspaceStore.getters;
const userPageStore = useUserPageStore();
const appPageStore = useAppPageStore();
const appContextStore = useAppContextStore();
const authorizationStore = useAuthorizationStore();

const router = useRouter();

const storeState = reactive({
    currentWorkspace: computed<WorkspaceModel|undefined>(() => userWorkspaceGetters.currentWorkspace),
    workspaceList: computed<WorkspaceModel[]>(() => userWorkspaceGetters.workspaceList),
});
const state = reactive({
    selectedWorkspace: computed<WorkspaceModel>(() => storeState.workspaceList.find((workspace) => workspace.workspace_id === storeState.currentWorkspace?.workspace_id) || {} as WorkspaceModel),
});
const accessState = reactive({
    isWorkspaceOwner: computed<boolean>(() => authorizationStore.state.currentRoleInfo?.roleType === ROLE_TYPE.WORKSPACE_OWNER),
    accessUserMenu: computed<boolean>(() => !isEmpty(authorizationStore.getters.pageAccessPermissionMap[MENU_ID.USER]) && accessState.isWorkspaceOwner),
    accessAppMenu: computed<boolean>(() => !isEmpty(authorizationStore.getters.pageAccessPermissionMap[MENU_ID.APP]) && accessState.isWorkspaceOwner),
});


const { workspaceUserAPI } = useWorkspaceUserApi();
const { appAPI } = useAppApi();
const workspaceUserListQueryHelper = new ApiQueryHelper().setCountOnly();
const appListQueryHelper = new ApiQueryHelper().setCountOnly();
const { key: workspaceUserListQueryKey, params: workspaceUserListQueryParams } = useServiceQueryKey('identity', 'workspace-user', 'list', {
    params: computed(() => ({
        workspace_id: userWorkspaceGetters.currentWorkspaceId,
        query: workspaceUserListQueryHelper.data,
    })),
});
const { key: appListQueryKey, params: appListQueryParams } = useServiceQueryKey('identity', 'app', 'list', {
    params: computed(() => ({
        workspace_id: userWorkspaceGetters.currentWorkspaceId,
        query: appListQueryHelper.data,
    })),
});
const { data: workspaceUserListCount } = useScopedQuery({
    queryKey: workspaceUserListQueryKey,
    queryFn: () => workspaceUserAPI.list(workspaceUserListQueryParams.value),
    gcTime: 1000 * 60 * 2,
    staleTime: 1000 * 30,
    enabled: computed(() => accessState.accessUserMenu),
}, ['WORKSPACE']);
const { data: appListData } = useScopedQuery({
    queryKey: appListQueryKey,
    queryFn: () => appAPI.list(appListQueryParams.value),
    gcTime: 1000 * 60 * 2,
    staleTime: 1000 * 30,
    enabled: computed(() => accessState.accessAppMenu),
}, ['WORKSPACE']);

const handleActionButton = (type: string) => {
    if (type === 'invite' || type === 'user') {
        routerToWorkspaceUser(type === 'invite');
        return;
    }
    if (type === 'create' || type === 'app') {
        routerToCreateApp(type === 'create');
        return;
    }
    const workspaceId = state.selectedWorkspace.workspace_id;
    actionWorkspace(type, workspaceId);
};
const actionWorkspace = (type: string, workspaceId: string) => {
    appContextStore.enterAdminMode();
    Vue.notify({
        group: 'toastTopCenter',
        type: 'info',
        title: i18n.t('COMMON.GNB.ADMIN.SWITCH_ADMIN') as string,
        duration: 2000,
        speed: 1,
    });
    router.push({
        name: ADMIN_ADVANCED_ROUTE.WORKSPACES._NAME,
        query: {
            modalType: type,
            selectedWorkspaceId: workspaceId,
        },
    });
};
const routerToCreateApp = (isOpenModal: boolean) => {
    router.push({ name: IAM_ROUTE.APP._NAME }).catch(() => {});
    if (isOpenModal) {
        appPageStore.setModalInfo(APP_DROPDOWN_MODAL_TYPE.CREATE, i18n.t('IAM.APP.MODAL.CREATE_TITLE') as string);
        appPageStore.setModalVisible('form', true);
    }
};
const routerToWorkspaceUser = (isOpenModal: boolean) => {
    router.push({ name: IAM_ROUTE.USER._NAME }).catch(() => {});
    if (isOpenModal) {
        userPageStore.$patch((_state) => {
            _state.state.modal.type = USER_MODAL_TYPE.INVITE;
            _state.state.modal.title = i18n.t('IAM.USER.MAIN.MODAL.INVITE_TITLE', { workspace_name: userWorkspaceStore.getters.currentWorkspace?.name }) as string;
            _state.state.modal.themeColor = 'primary';
            _state.state.modal.visible = {
                add: true,
            };
            _state.state.modal = cloneDeep(_state.state.modal);
        });
    }
};
</script>

<template>
    <div class="workspace-info">
        <div class="workspace_title">
            <p-heading-layout>
                <template #heading>
                    <p-heading :title="state.selectedWorkspace.name">
                        <template #title-left-extra>
                            <workspace-logo-icon :text="state.selectedWorkspace.name"
                                                 :theme="state.selectedWorkspace.tags?.theme"
                                                 class="workspace-icon"
                                                 size="sm"
                            />
                        </template>
                        <template #title-right-extra>
                            <span class="title-right-button-wrapper">
                                <favorite-button :item-id="state.selectedWorkspace.workspace_id"
                                                 :favorite-type="FAVORITE_TYPE.WORKSPACE"
                                                 class="favorite-button"
                                                 scale="0.8"
                                />
                            </span>
                        </template>
                    </p-heading>
                    <span v-if="state.selectedWorkspace.tags?.description"
                          class="desc"
                    >{{ state.selectedWorkspace.tags?.description }}</span>
                    <div class="info-cnt-wrapper">
                        <div v-if="accessState.accessUserMenu"
                             class="info-cnt"
                        >
                            <p-i name="ic_service_user"
                                 width="0.875rem"
                                 height="0.875rem"
                                 color="inherit"
                            />
                            <p-text-button @click="handleActionButton('user')">
                                {{ workspaceUserListCount?.total_count || 0 }} {{ $t('HOME.INFO_USERS') }}
                            </p-text-button>
                        </div>
                        <p-i v-if="accessState.accessAppMenu && accessState.accessUserMenu"
                             name="ic_dot"
                             width="0.125rem"
                             height="0.125rem"
                             :color="gray[500]"
                             class="dot"
                        />
                        <div v-if="accessState.accessAppMenu"
                             class="info-cnt"
                        >
                            <p-i name="ic_service_app"
                                 width="0.875rem"
                                 height="0.875rem"
                                 color="inherit"
                            />
                            <p-text-button @click="handleActionButton('app')">
                                {{ appListData?.total_count || 0 }} {{ $t('HOME.INFO_APPS') }}
                            </p-text-button>
                        </div>
                    </div>
                </template>
                <template v-if="accessState.accessUserMenu && authorizationStore.getters.pageAccessPermissionMap[MENU_ID.USER]?.write"
                          #extra
                >
                    <p-button style-type="tertiary"
                              class="invite-user-button"
                              icon-left="ic_service_user"
                              @click="handleActionButton('invite')"
                    >
                        {{ $t('HOME.INFO_INVITE_USER') }}
                    </p-button>
                    <p-button style-type="tertiary"
                              class="create-app-button"
                              icon-left="ic_service_app"
                              @click="handleActionButton('create')"
                    >
                        {{ $t('HOME.INFO_CREATE_APP') }}
                    </p-button>
                </template>
            </p-heading-layout>
        </div>
    </div>
</template>

<style scoped lang="postcss">
.workspace-info {
    @apply flex;
    padding-top: 1.25rem;
    padding-bottom: 3rem;
    .workspace_title {
        @apply flex flex-col;
        gap: 0.25rem;
        flex: 1;
        .workspace-icon {
            @apply inline-flex;
        }
        .title-right-button-wrapper {
            @apply inline-flex items-center;
            .favorite-button {
                margin-right: 0.5rem;
            }
        }
        .desc {
            @apply text-paragraph-md text-gray-600;
        }
        .info-cnt-wrapper {
            @apply flex items-center;
            margin-top: 0.5rem;
            gap: 0.5rem;
            .info-cnt {
                @apply flex items-center text-label-md;
                gap: 0.125rem;
            }
        }
    }

    /* custom design-system component - p-heading-layout */
    :deep(.p-heading-layout) {
        .extra-container {
            margin-top: 0;
        }
    }

    @screen mobile {
        .invite-user-button, .create-app-button {
            @apply hidden;
        }
    }
}
</style>
