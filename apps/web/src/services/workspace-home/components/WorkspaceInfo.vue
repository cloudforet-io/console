<script setup lang="ts">
import Vue, {
    computed, reactive,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import {
    PButton, PHeading, PI, PIconButton, PTextButton,
} from '@spaceone/design-system';
import { cloneDeep } from 'lodash';

import type { WorkspaceModel } from '@/schema/identity/workspace/model';
import { store } from '@/store';
import { i18n } from '@/translations';

import { makeAdminRouteName } from '@/router/helpers/route-helper';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import { gray } from '@/styles/colors';

import { APP_DROPDOWN_MODAL_TYPE } from '@/services/iam/constants/app-constant';
import { USER_MODAL_TYPE } from '@/services/iam/constants/user-constant';
import { IAM_ROUTE } from '@/services/iam/routes/route-constant';
import { useAppPageStore } from '@/services/iam/store/app-page-store';
import { useUserPageStore } from '@/services/iam/store/user-page-store';
import { PREFERENCE_ROUTE } from '@/services/preference/routes/route-constant';
import { useWorkspaceHomePageStore } from '@/services/workspace-home/store/workspace-home-page-store';

interface Props {
    accessUserMenu: boolean;
    accessAppMenu: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    accessUserMenu: false,
    accessAppMenu: false,
});

const userWorkspaceStore = useUserWorkspaceStore();
const userWorkspaceGetters = userWorkspaceStore.getters;
const userPageStore = useUserPageStore();
const appPageStore = useAppPageStore();
const appContextStore = useAppContextStore();
const workspaceHomePageStore = useWorkspaceHomePageStore();
const workspaceHomePageState = workspaceHomePageStore.state;

const router = useRouter();

const storeState = reactive({
    isDomainAdmin: computed<boolean>(() => store.getters['user/isDomainAdmin']),
    currentWorkspace: computed<WorkspaceModel|undefined>(() => userWorkspaceGetters.currentWorkspace),
    workspaceList: computed<WorkspaceModel[]>(() => userWorkspaceGetters.workspaceList),
    workspaceUserTotalCount: computed<number|undefined>(() => workspaceHomePageState.workspaceUserTotalCount),
    appsTotalCount: computed<number|undefined>(() => workspaceHomePageState.appsTotalCount),
});
const state = reactive({
    selectedWorkspace: computed<WorkspaceModel>(() => storeState.workspaceList.find((workspace) => workspace.workspace_id === storeState.currentWorkspace?.workspace_id) || {} as WorkspaceModel),
});

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
        name: makeAdminRouteName(PREFERENCE_ROUTE.WORKSPACES._NAME),
        query: {
            modalType: type,
            selectedWorkspaceId: workspaceId,
        },
    });
};
const routerToCreateApp = (isOpenModal: boolean) => {
    router.push({ name: IAM_ROUTE.APP._NAME });
    if (isOpenModal) {
        appPageStore.$patch((_state) => {
            _state.modal.type = APP_DROPDOWN_MODAL_TYPE.CREATE;
            _state.modal.title = i18n.t('IAM.APP.MODAL.CREATE_TITLE') as string;
            _state.modal.visible.form = true;
            _state.modal = cloneDeep(_state.modal);
        });
    }
};
const routerToWorkspaceUser = (isOpenModal: boolean) => {
    router.push({ name: IAM_ROUTE.USER._NAME });
    if (isOpenModal) {
        userPageStore.$patch((_state) => {
            _state.modal.type = USER_MODAL_TYPE.INVITE;
            _state.modal.title = i18n.t('IAM.USER.MAIN.MODAL.INVITE_TITLE', { workspace_name: userWorkspaceStore.getters.currentWorkspace?.name }) as string;
            _state.modal.themeColor = 'primary';
            _state.modal.visible.add = true;
            _state.modal = cloneDeep(_state.modal);
        });
    }
};
</script>

<template>
    <div class="workspace-info">
        <div class="workspace_title">
            <p-heading class="heading">
                <div class="heading-title">
                    <workspace-logo-icon :text="state.selectedWorkspace.name"
                                         :theme="state.selectedWorkspace.tags?.theme"
                                         size="sm"
                    />
                    <span>{{ state.selectedWorkspace.name }}</span>
                </div>
                <template #title-right-extra>
                    <span class="title-right-button-wrapper">
                        <favorite-button :item-id="state.selectedWorkspace.workspace_id"
                                         :favorite-type="FAVORITE_TYPE.WORKSPACE"
                                         class="favorite-button"
                                         scale="0.8"
                        />
                        <p-icon-button v-if="storeState.isDomainAdmin"
                                       name="ic_settings"
                                       width="1.5rem"
                                       height="1.5rem"
                                       @click="handleActionButton('edit')"
                        />
                        <p-icon-button v-if="storeState.isDomainAdmin"
                                       name="ic_delete"
                                       width="1.5rem"
                                       height="1.5rem"
                                       class="delete-button"
                                       @click="handleActionButton('delete')"
                        />
                    </span>
                </template>
            </p-heading>
            <span v-if="state.selectedWorkspace.tags?.description"
                  class="desc"
            >{{ state.selectedWorkspace.tags?.description }}</span>
            <div class="info-cnt-wrapper">
                <div v-if="props.accessUserMenu"
                     class="info-cnt"
                >
                    <p-i name="ic_service_user"
                         width="0.875rem"
                         height="0.875rem"
                         color="inherit"
                    />
                    <p-text-button @click="handleActionButton('user')">
                        {{ storeState.workspaceUserTotalCount || 0 }} {{ $t('HOME.INFO_USERS') }}
                    </p-text-button>
                </div>
                <p-i v-if="props.accessAppMenu && props.accessUserMenu"
                     name="ic_dot"
                     width="0.125rem"
                     height="0.125rem"
                     :color="gray[500]"
                     class="dot"
                />
                <div v-if="props.accessAppMenu"
                     class="info-cnt"
                >
                    <p-i name="ic_service_app"
                         width="0.875rem"
                         height="0.875rem"
                         color="inherit"
                    />
                    <p-text-button @click="handleActionButton('app')">
                        {{ storeState.appsTotalCount || 0 }} {{ $t('HOME.INFO_APPS') }}
                    </p-text-button>
                </div>
            </div>
        </div>
        <div class="extra-wrapper">
            <p-button v-if="props.accessUserMenu"
                      style-type="tertiary"
                      icon-left="ic_service_user"
                      @click="handleActionButton('invite')"
            >
                {{ $t('HOME.INFO_INVITE_USER') }}
            </p-button>
            <p-button v-if="props.accessAppMenu"
                      style-type="tertiary"
                      icon-left="ic_service_app"
                      @click="handleActionButton('create')"
            >
                {{ $t('HOME.INFO_CREATE_APP') }}
            </p-button>
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
        .heading {
            margin: 0;
            .heading-title {
                @apply flex items-center;
                gap: 0.5rem;
            }
            .title-right-button-wrapper {
                @apply flex items-center;
                .favorite-button {
                    margin-right: 0.5rem;
                }
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

    .extra-wrapper {
        @apply flex;
        gap: 0.5rem;
    }

    @screen mobile {
        .extra-wrapper {
            @apply hidden;
        }

        /* custom design-system component - p-heading */
        :deep(.p-heading) {
            .heading-wrapper {
                @apply flex-col items-start;
                gap: 0.25rem;
            }
        }
    }
}
</style>
