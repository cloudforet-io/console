<template>
    <div id="app">
        <!--        <button style="position: fixed; z-index: 9999999; left: 20px; top: 20px;" class="bg-coral font-bold px-4 py-2 rounded" @click="flush">-->
        <!--            flush session-->
        <!--        </button>-->
        <p-notice-alert group="noticeTopLeft" position="top left" />
        <p-notice-alert group="noticeTopRight" position="top right" />
        <p-notice-alert group="noticeBottomLeft" position="bottom left" />
        <p-notice-alert group="noticeBottomRight" position="bottom right" />
        <p-toast-alert group="toastTopCenter" position="top center" />
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
                <main class="main">
                    <router-view />
                </main>
            </div>
        </template>
        <router-view v-else />
    </div>
</template>

<script lang="ts">
import {
    ComponentRenderProxy, computed,
    defineComponent, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';

import PNoticeAlert from '@/components/molecules/alert/notice/PNoticeAlert.vue';
import PToastAlert from '@/components/molecules/alert/toast/PToastAlert.vue';
import GNB from '@/views/common/components/gnb/GNB.vue';
import PIconModal from '@/components/organisms/modals/icon-modal/PIconModal.vue';
import { Location } from 'vue-router';
import router from '@/routes';
import { SpaceConnector } from '@/lib/space-connector';


export default defineComponent({
    name: 'App',
    components: {
        GNB: GNB as any,
        PNoticeAlert,
        PToastAlert,
        PIconModal: PIconModal as any,
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
    display: flex;
    overflow-y: hidden;
    width: 100vw;
    .gnb {
        position: fixed;
        width: 100vw;
        height: 3rem;
        z-index: 100;
    }
    .app-body {
        display: flex;
        flex-direction: column;
        overflow-y: auto;
        height: 100vh;
        width: 100%;
        padding-top: 3rem;
        .main {
            height: 100%;
            margin: 0;
            overflow-x: hidden;
        }
    }
}
</style>
