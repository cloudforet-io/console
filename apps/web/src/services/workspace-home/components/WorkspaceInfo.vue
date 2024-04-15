<script setup lang="ts">
import Vue, { computed, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import {
    PButton, PHeading, PI, PIconButton,
} from '@spaceone/design-system';
import { cloneDeep } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { AppListParameters } from '@/schema/identity/app/api-verbs/list';
import type { AppModel } from '@/schema/identity/app/model';
import { ROLE_TYPE } from '@/schema/identity/role/constant';
import type { WorkspaceUserListParameters } from '@/schema/identity/workspace-user/api-verbs/list';
import type { WorkspaceUserModel } from '@/schema/identity/workspace-user/model';
import type { WorkspaceModel } from '@/schema/identity/workspace/model';
import { store } from '@/store';
import { i18n } from '@/translations';

import { makeAdminRouteName } from '@/router/helpers/route-helper';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import type { UserState } from '@/store/modules/user/type';

import ErrorHandler from '@/common/composables/error/errorHandler';
import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import { gray } from '@/styles/colors';

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

const router = useRouter();

const storeState = reactive({
    isDomainAdmin: computed<boolean>(() => store.getters['user/isDomainAdmin']),
    getCurrentRoleInfo: computed<UserState>(() => store.getters['user/getCurrentRoleInfo']),
    hasAdminOrWorkspaceOwnerRole: computed<boolean>(() => store.getters['user/hasAdminOrWorkspaceOwnerRole']),
    currentWorkspace: computed<WorkspaceModel|undefined>(() => userWorkspaceGetters.currentWorkspace),
    workspaceList: computed<WorkspaceModel[]>(() => userWorkspaceGetters.workspaceList),
});
const state = reactive({
    isWorkspaceOwner: computed<boolean>(() => storeState.getCurrentRoleInfo.roleType === ROLE_TYPE.WORKSPACE_OWNER),
    selectedWorkspace: computed<WorkspaceModel>(() => storeState.workspaceList.find((workspace) => workspace.workspace_id === storeState.currentWorkspace?.workspace_id) || {} as WorkspaceModel),
    workspaceUserTotalCount: undefined as number|undefined,
    appsTotalCount: undefined as number|undefined,
});

const handleClickInviteButton = () => {
    router.push({ name: IAM_ROUTE.USER._NAME });
    userPageStore.$patch((_state) => {
        _state.modal.type = USER_MODAL_TYPE.INVITE;
        _state.modal.title = i18n.t('IAM.USER.MAIN.MODAL.INVITE_TITLE', { workspace_name: userWorkspaceStore.getters.currentWorkspace?.name }) as string;
        _state.modal.themeColor = 'primary';
        _state.modal.visible.add = true;
        _state.modal = cloneDeep(_state.modal);
    });
};
const handleClickCreateButton = () => {
    appContextStore.enterAdminMode();
    router.push({
        name: makeAdminRouteName(IAM_ROUTE.APP._NAME),
    });
    Vue.notify({
        group: 'toastTopCenter',
        type: 'info',
        title: i18n.t('COMMON.GNB.ADMIN.SWITCH_ADMIN') as string,
        duration: 2000,
        speed: 1,
    });
    appPageStore.$patch((_state) => {
        _state.modal.type = APP_DROPDOWN_MODAL_TYPE.CREATE;
        _state.modal.title = i18n.t('IAM.APP.MODAL.CREATE_TITLE') as string;
        _state.modal.visible.form = true;
        _state.modal = cloneDeep(_state.modal);
    });
};

const listQueryHelper = new ApiQueryHelper().setCountOnly();
const fetchWorkspaceUserList = async () => {
    try {
        const { total_count } = await SpaceConnector.clientV2.identity.workspaceUser.list<WorkspaceUserListParameters, ListResponse<WorkspaceUserModel>>({
            workspace_id: state.selectedWorkspace.workspace_id,
            query: listQueryHelper.data,
        });
        state.workspaceUserTotalCount = total_count || undefined;
    } catch (e: any) {
        ErrorHandler.handleRequestError(e, e.message);
    }
};
const fetchAppList = async () => {
    try {
        const { total_count } = await SpaceConnector.clientV2.identity.app.list<AppListParameters, ListResponse<AppModel>>({
            query: listQueryHelper.data,
        });
        state.appsTotalCount = total_count || undefined;
    } catch (e: any) {
        ErrorHandler.handleRequestError(e, e.message);
    }
};

onMounted(async () => {
    await fetchWorkspaceUserList();
    await fetchAppList();
});
</script>

<template>
    <div class="workspace-info">
        <p-heading :title="state.selectedWorkspace.name"
                   class="heading-wrapper"
        >
            <template #title-left-extra>
                <workspace-logo-icon :text="state.selectedWorkspace.name"
                                     :theme="state.selectedWorkspace.tags?.theme"
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
                    <p-icon-button v-if="storeState.isDomainAdmin"
                                   name="ic_edit-text"
                                   width="1.5rem"
                                   height="1.5rem"
                    />
                    <p-icon-button v-if="storeState.isDomainAdmin"
                                   name="ic_delete"
                                   width="1.5rem"
                                   height="1.5rem"
                                   class="delete-button"
                    />
                </span>
            </template>
            <template #extra>
                <div class="extra-wrapper">
                    <p-button v-if="state.isWorkspaceOwner"
                              style-type="tertiary"
                              icon-left="ic_service_user"
                              @click="handleClickInviteButton"
                    >
                        {{ $t('HOME.INFO_INVITE_USER') }}
                    </p-button>
                    <p-button v-if="storeState.isDomainAdmin"
                              style-type="tertiary"
                              icon-left="ic_service_app"
                              @click="handleClickCreateButton"
                    >
                        {{ $t('HOME.INFO_CREATE_APP') }}
                    </p-button>
                </div>
            </template>
        </p-heading>
        <span v-if="state.selectedWorkspace.tags?.description"
              class="desc"
        >{{ state.selectedWorkspace.tags?.description }}</span>
        <div class="info-cnt-wrapper">
            <div v-if="state.isWorkspaceOwner"
                 class="info-cnt"
            >
                <p-i name="ic_service_user"
                     width="0.875rem"
                     height="0.875rem"
                     color="inherit"
                />
                <span>{{ state.workspaceUserTotalCount }} {{ $t('HOME.INFO_USERS') }}</span>
            </div>
            <p-i v-if="storeState.isDomainAdmin"
                 name="ic_dot"
                 width="0.125rem"
                 height="0.125rem"
                 :color="gray[500]"
                 class="dot"
            />
            <div v-if="storeState.isDomainAdmin"
                 class="info-cnt"
            >
                <p-i name="ic_service_app"
                     width="0.875rem"
                     height="0.875rem"
                     color="inherit"
                />
                <span>{{ state.appsTotalCount }} {{ $t('HOME.INFO_APPS') }}</span>
            </div>
        </div>
    </div>
</template>

<style scoped lang="postcss">
.workspace-info {
    @apply flex flex-col;
    padding-top: 1.25rem;
    padding-bottom: 3rem;
    gap: 0.25rem;
    .heading-wrapper {
        margin: 0;
        .title-right-button-wrapper {
            @apply flex items-center;
            .favorite-button {
                margin-right: 0.5rem;
            }
        }
        .extra-wrapper {
            @apply flex;
            gap: 0.5rem;
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
</style>
