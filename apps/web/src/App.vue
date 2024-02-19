<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core';
import {
    computed, reactive, watch, ref,
} from 'vue';
import type { Location } from 'vue-router';
import { useRoute, useRouter } from 'vue-router/composables';

import {
    PNoticeAlert, PToastAlert, PIconModal, PSidebar, PDataLoader,
} from '@spaceone/design-system';

import { LocalStorageAccessor } from '@cloudforet/core-lib/local-storage-accessor';

import { store } from '@/store';

import { CostReportDetailPath } from '@/router/constant';
import { getRouteScope, makeAdminRouteName } from '@/router/helpers/route-helper';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useGlobalUIStore } from '@/store/global-ui/global-ui-store';
import { SIDEBAR_TYPE } from '@/store/modules/display/config';

import config from '@/lib/config';
import { supportsBrowser } from '@/lib/helper/cross-browsing-helper';

import HasNoWorkspaceModal from '@/common/components/modals/HasNoWorkspaceModal.vue';
import NotificationEmailModal from '@/common/modules/modals/notification-email-modal/NotificationEmailModal.vue';
import { MODAL_TYPE } from '@/common/modules/modals/notification-email-modal/type';
import RecommendedBrowserModal from '@/common/modules/modals/RecommendedBrowserModal.vue';
import TopBar from '@/common/modules/navigations/top-bar/TopBar.vue';
import LayoutContainer from '@/common/modules/page-layouts/LayoutContainer.vue';
import NoticePopup from '@/common/modules/popup/notice/NoticePopup.vue';
import TopNotification from '@/common/modules/portals/TopNotification.vue';

import MobileGuideModal from '@/services/auth/components/MobileGuideModal.vue';
import { AUTH_ROUTE } from '@/services/auth/routes/route-constant';
import { PREFERENCE_ROUTE } from '@/services/preference/routes/route-constant';

const router = useRouter();
const route = useRoute();

const state = reactive({
    routeScope: computed(() => getRouteScope(route)),
    showGNB: computed(() => route.matched[1]?.name === 'admin' || route.matched[1]?.name === 'workspace' || state.isMyPage),
    isMyPage: computed(() => route.path.startsWith('/my-page')),
    isExpired: computed(() => !state.isRoutingToSignIn && store.state.error.visibleSessionExpiredError && state.routeScope !== 'EXCLUDE_AUTH'),
    isRoutingToSignIn: false,
    isEmailVerified: computed(() => store.state.user.emailVerified),
    userId: computed<string>(() => store.state.user.userId),
    email: computed<string>(() => store.state.user.email),
    notificationEmailModalVisible: false,
    smtpEnabled: computed(() => config.get('SMTP_ENABLED')),
    hasNoWorkspace: false,
    globalGrantLoading: computed(() => appContextStore.getters.globalGrantLoading),
});

const appContextStore = useAppContextStore();
const userWorkspaceStore = useUserWorkspaceStore();
const globalUIStore = useGlobalUIStore();
const globalUIGetters = globalUIStore.getters;

const topNotiRef = ref(null);
useResizeObserver(topNotiRef, (entries) => {
    const rect = entries[0].contentRect;
    globalUIStore.setTopNotificationHeight(rect.height);
});

const goToSignIn = async () => {
    state.isRoutingToSignIn = true;
    const res: Location = {
        name: AUTH_ROUTE.SIGN_OUT._NAME,
        query: { nextPath: route.fullPath },
    };
    store.commit('user/setCurrentGrantInfo', undefined);
    store.commit('error/setVisibleSessionExpiredError', false);

    await router.push(res);
    state.isRoutingToSignIn = false;
};
const showsBrowserRecommendation = () => {
    const currentPath = window.location.pathname;
    if (currentPath === CostReportDetailPath) return false;
    return (!supportsBrowser() && !LocalStorageAccessor.getItem('showBrowserRecommendation'));
};

watch(() => route.path, () => {
    state.notificationEmailModalVisible = route.path !== '/'
        && state.routeScope !== 'EXCLUDE_AUTH'
        && !state.isEmailVerified
        && !LocalStorageAccessor.getItem('hideNotificationEmailModal');
}, { immediate: true });


watch(() => route.name, (routeName) => {
    if (routeName && routeName !== makeAdminRouteName(PREFERENCE_ROUTE.WORKSPACES._NAME) && state.routeScope !== 'EXCLUDE_AUTH') {
        state.hasNoWorkspace = userWorkspaceStore.getters.workspaceList.length === 0 && store.getters['user/isDomainAdmin'];
    }
}, { immediate: true });

watch(() => state.userId, (userId) => {
    if (userId) {
        store.dispatch('settings/initSettings');
    }
}, { immediate: true });
</script>

<template>
    <div v-cloak
         id="app"
    >
        <template v-if="store.state.display.isInitialized">
            <p-notice-alert group="noticeTopLeft" />
            <p-notice-alert group="noticeTopRight" />
            <p-notice-alert group="noticeBottomLeft" />
            <p-notice-alert group="noticeBottomRight" />
            <p-toast-alert group="toastTopCenter" />
            <top-notification />
            <div v-if="state.showGNB">
                <top-bar class="top-bar" />
                <layout-container class="app-body"
                                  :style="{ height: globalUIGetters.appBodyHeight }"
                >
                    <template #main>
                        <p-sidebar v-if="!state.globalGrantLoading"
                                   :visible="store.state.display.visibleSidebar"
                                   :style-type="store.getters['display/sidebarProps'].styleType"
                                   :size="store.getters['display/sidebarProps'].size"
                                   :is-fixed-size="store.getters['display/sidebarProps'].isFixedSize"
                                   :hide-close-button="store.getters['display/sidebarProps'].disableButton"
                                   :disable-scroll="store.getters['display/sidebarProps'].disableScroll"
                                   @close="store.dispatch('display/hideSidebar')"
                        >
                            <div class="main-content">
                                <portal-target ref="topNotiRef"
                                               name="top-notification"
                                               :slot-props="{hasDefaultMessage: true}"
                                />
                                <router-view />
                            </div>
                            <template #title>
                                <portal-target v-if="store.state.display.sidebarType === SIDEBAR_TYPE.info"
                                               name="info-title"
                                />
                                <portal-target v-else-if="store.state.display.sidebarType === SIDEBAR_TYPE.widget"
                                               name="widget-title"
                                />
                                <portal-target v-else
                                               name="handbook-title"
                                />
                            </template>
                            <template #sidebar>
                                <portal-target v-if="store.state.display.sidebarType === SIDEBAR_TYPE.info"
                                               name="info-contents"
                                />
                                <portal-target v-else-if="store.state.display.sidebarType === SIDEBAR_TYPE.widget"
                                               name="widget-contents"
                                />
                                <portal-target v-else
                                               name="handbook-contents"
                                />
                            </template>
                            <template #footer>
                                <portal-target name="widget-footer" />
                            </template>
                        </p-sidebar>
                        <p-data-loader v-else
                                       :loading="state.globalGrantLoading"
                                       :data="true"
                                       class="console-loading-wrapper"
                        />
                    </template>
                </layout-container>
            </div>
            <router-view v-else />
            <p-icon-modal :visible="state.isExpired"
                          emoji="👋"
                          :header-title="$t('COMMON.SESSION_MODAL.SESSION_EXPIRED')"
                          :button-text="$t('COMMON.SESSION_MODAL.SIGNIN')"
                          button-type="primary"
                          @clickButton="goToSignIn"
            />
            <has-no-workspace-modal :visible.sync="state.hasNoWorkspace" />
            <notification-email-modal
                v-if="state.smtpEnabled"
                :user-id="state.userId"
                :email="state.email"
                :visible.sync="state.notificationEmailModalVisible"
                :modal-type="MODAL_TYPE.SEND"
            />
            <notice-popup v-if="!state.globalGrantLoading" />
            <!--            <survey-modal />-->
        </template>
        <!-- Modal for Cross Browsing -->
        <recommended-browser-modal v-if="showsBrowserRecommendation()" />
        <mobile-guide-modal v-if="store.state.display.visibleMobileGuideModal" />
    </div>
</template>

<style lang="postcss">
#app {
    display: flex;
    flex-direction: column;
    overflow-y: hidden;
    width: 100vw;
    height: 100vh;
    background-color: $bg-color;

    .console-loading-wrapper {
        position: absolute;
        height: 100%;
        z-index: 101;
        & > .data-loader-container > .loader-wrapper > .loader.spinner {
            max-height: unset;
        }
    }

    .top-bar {
        position: fixed;
        width: 100%;
        height: $top-bar-height;
        z-index: 100;
        flex-shrink: 0;
        top: 0;
    }
    .app-body {
        @apply relative flex flex-col;
        margin-top: $top-bar-height;
        overflow-y: hidden;
        width: 100%;
        flex-grow: 1;
        .p-sidebar {
            .sidebar-container {
                @apply bg-gray-100;
            }
            .non-sidebar-wrapper {
                min-height: 100%;
            }
        }
        .main-content {
            display: flex;
            flex-direction: column;
            height: 100%;
            margin: 0;
            overflow-x: hidden;
            overflow-y: hidden;
        }
    }
}
</style>
