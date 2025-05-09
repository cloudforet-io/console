<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core';
import {
    computed, reactive, watch, ref,
} from 'vue';
import type { Location } from 'vue-router';
import { useRoute, useRouter } from 'vue-router/composables';

import { useQueryClient } from '@tanstack/vue-query';
import { ConsoleVueQueryDevtools } from 'console-vue-query-devtools-sdk';

import { LocalStorageAccessor } from '@cloudforet/core-lib/local-storage-accessor';
import {
    PNoticeAlert, PToastAlert, PIconModal, PSidebar, PDataLoader,
} from '@cloudforet/mirinae';

import { EXTERNAL_PAGE_ROUTE } from '@/router/constant';
import { getRouteScope } from '@/router/helpers/route-helper';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useAuthorizationStore } from '@/store/authorization/authorization-store';
import { SIDEBAR_TYPE } from '@/store/display/constant';
import { useDisplayStore } from '@/store/display/display-store';
import { useErrorStore } from '@/store/error/error-store';
import { useGlobalUIStore } from '@/store/global-ui/global-ui-store';
import { useUserStore } from '@/store/user/user-store';

import config from '@/lib/config';
import { supportsBrowser } from '@/lib/helper/cross-browsing-helper';

import NotificationEmailModal from '@/common/modules/modals/notification-email-modal/NotificationEmailModal.vue';
import { MODAL_TYPE } from '@/common/modules/modals/notification-email-modal/type';
import RecommendedBrowserModal from '@/common/modules/modals/RecommendedBrowserModal.vue';
import TopBar from '@/common/modules/navigations/top-bar/TopBar.vue';
import TopBarMyPage from '@/common/modules/navigations/top-bar/TopBarMyPage.vue';
import LayoutContainer from '@/common/modules/page-layouts/LayoutContainer.vue';
import NoticePopup from '@/common/modules/popup/notice/NoticePopup.vue';
import TopNotification from '@/common/modules/portals/TopNotification.vue';

import MobileGuideModal from '@/services/auth/components/MobileGuideModal.vue';
import { AUTH_ROUTE } from '@/services/auth/routes/route-constant';
import { LANDING_ROUTE } from '@/services/landing/routes/route-constant';

if (import.meta.env.DEV) {
    const queryClient = useQueryClient();
    import('@/_dev-tools/vue-query-console-debug').then((mod) => mod.initVueQueryConsoleDebug(queryClient))
        .catch((error) => {
            console.error('Failed to load vue-query-console-debug module:', error);
            console.error('Ensure the module exists and the path is correct.');
        });
}

const router = useRouter();
const route = useRoute();

const state = reactive({
    routeScope: computed(() => getRouteScope(route)),
    showGNB: computed(() => !state.isWorkspaceLandingPage && (route.matched[1]?.name === 'admin' || route.matched[1]?.name === 'workspace' || state.isMyPage)),
    isWorkspaceLandingPage: computed(() => route.name === LANDING_ROUTE._NAME),
    isMyPage: computed(() => route.path.startsWith('/my-page')),
    isExpired: computed(() => !state.isRoutingToSignIn && errorStore.state.visibleSessionExpiredError && state.routeScope !== 'EXCLUDE_AUTH'),
    isRoutingToSignIn: false,
    isEmailVerified: computed<boolean|undefined>(() => userStore.state.emailVerified),
    userId: computed<string|undefined>(() => userStore.state.userId),
    email: computed<string|undefined>(() => userStore.state.email),
    notificationEmailModalVisible: false,
    smtpEnabled: computed(() => config.get('SMTP_ENABLED')),
    globalGrantLoading: computed(() => appContextStore.getters.globalGrantLoading),
});

const userStore = useUserStore();
const authorizationStore = useAuthorizationStore();
const appContextStore = useAppContextStore();
const errorStore = useErrorStore();
const globalUIStore = useGlobalUIStore();
const globalUIGetters = globalUIStore.getters;
const displayStore = useDisplayStore();

const topNotiRef = ref(null);
useResizeObserver(topNotiRef, (entries) => {
    const rect = entries[0].contentRect;
    globalUIStore.setTopNotificationHeight(rect.height);
});

const goToSignIn = async () => {
    state.isRoutingToSignIn = true;
    const to: Location = {
        name: AUTH_ROUTE.SIGN_OUT._NAME,
        query: { previousPath: route.fullPath },
    };
    authorizationStore.setCurrentGrantInfo(undefined);
    errorStore.setVisibleSessionExpiredError(false);

    await router.push(to);
    state.isRoutingToSignIn = false;
};
const showsBrowserRecommendation = () => {
    const currentPath = window.location.pathname;
    if (currentPath === `/${EXTERNAL_PAGE_ROUTE.COST_REPORT_DETAIL._NAME}`) return false;
    return (!supportsBrowser() && !LocalStorageAccessor.getItem('showBrowserRecommendation'));
};

watch(() => route.path, () => {
    state.notificationEmailModalVisible = route.path !== '/'
        && state.routeScope !== 'EXCLUDE_AUTH'
        && !state.isEmailVerified
        && !LocalStorageAccessor.getItem('hideNotificationEmailModal');
}, { immediate: true });

watch(() => state.userId, (userId) => {
    if (userId) {
        displayStore.initSettings();
    }
}, { immediate: true });
</script>

<template>
    <div v-cloak
         id="app"
    >
        <console-vue-query-devtools />
        <template v-if="displayStore.state.isInitialized">
            <p-notice-alert group="noticeTopLeft" />
            <p-notice-alert group="noticeTopRight" />
            <p-notice-alert group="noticeBottomLeft" />
            <p-notice-alert group="noticeBottomRight" />
            <p-toast-alert group="toastTopCenter" />
            <top-notification />
            <div v-if="state.showGNB">
                <div class="top-bar">
                    <top-bar-my-page v-if="state.isMyPage" />
                    <top-bar v-else />
                </div>
                <layout-container class="app-body"
                                  :style="{ height: globalUIGetters.appBodyHeight }"
                >
                    <template #main>
                        <p-sidebar v-if="!state.globalGrantLoading"
                                   :visible="displayStore.state.visibleSidebar"
                                   :style-type="displayStore.getters.sidebarProps.styleType"
                                   :size="displayStore.getters.sidebarProps.size"
                                   :is-fixed-size="displayStore.getters.sidebarProps.isFixedSize"
                                   :hide-close-button="displayStore.getters.sidebarProps.disableButton"
                                   :disable-scroll="displayStore.getters.sidebarProps.disableScroll"
                                   @close="displayStore.setVisibleSidebar(false)"
                        >
                            <div class="main-content">
                                <portal-target ref="topNotiRef"
                                               name="top-notification"
                                               :slot-props="{hasDefaultMessage: true}"
                                />
                                <router-view />
                            </div>
                            <template #title>
                                <portal-target v-if="displayStore.state.sidebarType === SIDEBAR_TYPE.info"
                                               name="info-title"
                                />
                                <portal-target v-else-if="displayStore.state.sidebarType === SIDEBAR_TYPE.widget"
                                               name="widget-title"
                                />
                                <portal-target v-else
                                               name="handbook-title"
                                />
                            </template>
                            <template #sidebar>
                                <portal-target v-if="displayStore.state.sidebarType === SIDEBAR_TYPE.info"
                                               name="info-contents"
                                />
                                <portal-target v-else-if="displayStore.state.sidebarType === SIDEBAR_TYPE.widget"
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
            <notification-email-modal
                v-if="state.smtpEnabled"
                :user-id="state.userId"
                :email="state.email"
                :visible.sync="state.notificationEmailModalVisible"
                :modal-type="MODAL_TYPE.SEND"
            />
            <notice-popup v-if="!state.globalGrantLoading" />
        </template>
        <!-- Modal for Cross Browsing -->
        <recommended-browser-modal v-if="showsBrowserRecommendation()" />
        <mobile-guide-modal v-if="displayStore.state.visibleMobileGuideModal" />
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
        z-index: 10;
        & > .data-loader-container > .loader-wrapper > .loader.spinner {
            max-height: unset;
        }
    }

    .top-bar {
        position: fixed;
        width: 100%;
        height: $top-bar-height;
        z-index: 1030;
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
