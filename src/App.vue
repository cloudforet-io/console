<template>
    <div v-if="!loading" id="app">
        <p-notice-alert group="noticeTopLeft" position="top left" />
        <p-notice-alert group="noticeTopRight" position="top right" />
        <p-notice-alert group="noticeBottomLeft" position="bottom left" />
        <p-notice-alert group="noticeBottomRight" position="bottom right" />
        <router-view />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import {
    defineComponent, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import { api } from '@/lib/api/axios';
import { SpaceConnector } from '@/lib/space-connector';
import config from '@/lib/config';
import PLottie from '@/components/molecules/lottie/PLottie.vue';
import PNoticeAlert from '@/components/molecules/alert/notice/PNoticeAlert.vue';
import { GTag, setGtagUserID } from '@/lib/gtag';

export default defineComponent({
    name: 'App',
    components: {
        PLottie,
        PNoticeAlert,
    },
    props: {
        processEnv: {
            type: String,
            default: process.env.NODE_ENV,
        },
    },
    setup(props, context) {
        const vm = getCurrentInstance() as any;
        const state = reactive({
            loading: true,
        });
        const configInit = async () => {
            await config.init();
            await SpaceConnector.init(config.get('CONSOLE_API.ENDPOINT'), () => {
                vm.$ls.logout(vm);
            }, vm.$ls.user);

            Vue.prototype.$http = api.init(config.get('VUE_APP_API.ENDPOINT'), vm);
        };
        const preparationTo = async () => {
            try {
                await configInit();
                if (config.get('GTAG_ID')) new GTag(config.get('GTAG_ID'), vm);
                setGtagUserID(vm);
            } catch (e) {
                console.error(e);
                if (!config.config.NO_SERVER_MODE) {
                    vm.$router.push({ path: '/error-page' });
                }
            }
            state.loading = false;
        };
        preparationTo();

        return {
            ...toRefs(state),
        };
    },

});

</script>

<style lang="postcss">
    #loading {
        background-color: transparent;
        width: 100%;
        height: auto;
        max-width: 600px;
        max-height: 600px;
        display: block;
        overflow: hidden;
        margin: auto;
        padding-top: 100px;
        z-index: 999;
        animation: fadein 3s;
        -moz-animation: fadein 3s;
        -webkit-animation: fadein 3s;
        -o-animation: fadein 3s;
    }

    @keyframes fadein {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    @-moz-keyframes fadein {
        /* Firefox */
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    @-webkit-keyframes fadein {
        /* Safari and Chrome */
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    @-o-keyframes fadein {
        /* Opera */
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    .app-spinner {
        height: 100vh;
    }
</style>
