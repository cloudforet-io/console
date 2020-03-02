<template>
    <div v-if="!$ls.display.state.loading" id="app">
        <p-notice-alert group="noticeTopLeft" position="top left" />
        <p-notice-alert group="noticeTopRight" position="top right" />
        <p-notice-alert group="noticeBottomLeft" position="bottom left" />
        <p-notice-alert group="noticeBottomRight" position="bottom right" />
        <router-view />
    </div>
    <div v-else class="app-spinner">
        <p-lottie ref="pageLoading" :auto="true" :size="45" />
    </div>
</template>

<script>
import _ from 'lodash';
import Vue from 'vue';
import api, { ApiInstance } from '@/lib/api';
import config from '@/lib/config';
import PLottie from '@/components/molecules/lottie/PLottie.vue';
import PNoticeAlert from '@/components/molecules/alert/notice/NoticeAlert.vue';
import { GTag } from '@/lib/gtag';

export default {
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
    // setup(props,context){
    //     const vm = getCurrentInstance() as any''
    //
    //     try {
    //         vm.$ls.display.loadingStart();
    //         await vm.configInit();
    //         new GTag(config.get('GTAG_ID'), this);
    //     } catch (e) {
    //         vm.$router.push({ path: '/error-page' });
    //         console.error(e);
    //     }
    //     vm.$ls.display.loadingEnd();
    //
    //     return{
    //
    //     }
    //
    // }
    created() {
        this.preparationTo();
    },
    methods: {
        async preparationTo() {
            try {
                await this.configInit();
                new GTag(config.get('GTAG_ID'), this);
                await this.$ls.domain.getDomain(this);
            } catch (e) {
                console.error(e);
                this.$router.push({ path: '/error-page' });
            }
        },
        async configInit() {
            await config.init();
            Vue.prototype.$http = new ApiInstance(config.get('VUE_APP_API.ENDPOINT'), this).instance;
            console.log('set $http');
        },
    },
};

</script>

<style lang="scss">
    @import 'styles/style';
    #loading {
        background-color: transparent;
        /*lottie image size*/
        width: 100%;
        height: auto;
        max-width: 600px;
        max-height: 600px;
        /*lottie image size end*/
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
