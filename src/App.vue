<template>
    <div v-cloak id="app">
        <!--        <button style="position: fixed; z-index: 9999999; left: 20px; top: 20px;" class="bg-coral font-bold px-4 py-2 rounded" @click="flush">-->
        <!--            flush session-->
        <!--        </button>-->
        <template v-if="$store.state.display.isInitialized">
            <p-notice-alert group="noticeTopLeft" position="top left" />
            <p-notice-alert group="noticeTopRight" position="top right" />
            <p-notice-alert group="noticeBottomLeft" position="bottom left" />
            <p-notice-alert group="noticeBottomRight" position="bottom right" />
            <p-toast-alert group="toastTopCenter" position="top center" />
            <top-notification v-if="!$store.getters['user/hasPermission']">
                <i18n path="APP.TOP_NOTI.HAS_NO_ROLE">
                    <template #needRole>
                        <strong>{{ $t('APP.TOP_NOTI.NEED_ROLE') }}</strong>
                    </template>
                </i18n>
            </top-notification>
            <p-icon-modal :visible="isExpired"
                          emoji
                          :header-title="$t('COMMON.SESSION_MODAL.SESSION_EXPIRED')"
                          :button-text="$t('COMMON.SESSION_MODAL.SIGNIN')"
                          button-type="primary-dark"
                          :outline="false"
                          @clickButton="goToSignIn"
            />
            <template v-if="showGNB">
                <GNB class="gnb" />
                <div class="app-body">
                    <p-sidebar :visible="$store.state.display.visibleInfo"
                               @close="$store.dispatch('display/hideInfo')"
                    >
                        <main class="main">
                            <portal-target name="top-notification" />
                            <router-view />
                        </main>
                        <template #title>
                            <portal-target name="info-title" />
                        </template>
                        <template #sidebar>
                            <portal-target name="info-contents" />
                        </template>
                    </p-sidebar>
                </div>
            </template>
            <router-view v-else />
        </template>
    </div>
</template>

<script lang="ts">
import {
    ComponentRenderProxy, computed,
    defineComponent, getCurrentInstance, reactive, toRefs
} from '@vue/composition-api';

import {
    PNoticeAlert, PToastAlert, PIconModal, PSidebar, PLottie,
} from '@spaceone/design-system';

import GNB from '@/views/common/components/gnb/GNB.vue';
import { Location } from 'vue-router';
import router from '@/routes';
import TopNotification from '@/views/common/components/notification/TopNotification.vue';

export default defineComponent({
    name: 'App',
    components: {
        TopNotification,
        GNB: GNB as any,
        PNoticeAlert,
        PToastAlert,
        PIconModal: PIconModal as any,
        PSidebar,
        PLottie,
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const state = reactive({
            showGNB: computed(() => vm.$route.matched[0]?.name === 'root'),
            isExpired: computed(() => vm.$store.state.user.isSessionExpired === true && !vm.$route.meta.excludeAuth),
        });

        const goToSignIn = async () => {
            const res: Location = {
                name: 'SignOut',
            };
            await router.push(res);
        };

        return {
            ...toRefs(state),
            goToSignIn,
            // flush() {
            //     SpaceConnector.flushToken();
            //     vm.$store.dispatch('user/setIsSessionExpired', true);
            // },
        };
    },
});

</script>

<style lang="postcss">
#app {
    @apply bg-white;
    display: flex;
    flex-direction: column;
    overflow-y: hidden;
    width: 100vw;
    height: 100vh;

    .gnb {
        position: fixed;
        width: 100%;
        height: $gnb-height;
        z-index: 100;
        flex-shrink: 0;
    }
    .app-body {
        display: flex;
        flex-direction: column;
        overflow-y: hidden;
        width: 100%;
        height: calc(100vh - $(gnb-height));
        margin-top: $gnb-height;
        flex-grow: 1;
        .p-sidebar .non-sidebar-wrapper {
            min-height: 100%;
        }
        .main {
            display: flex;
            flex-direction: column;
            height: 100%;
            margin: 0;
            overflow-x: hidden;
            overflow-y: auto;
        }
    }
}
</style>
