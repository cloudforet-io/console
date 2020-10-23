<template>
    <div id="app">
        <p-notice-alert group="noticeTopLeft" position="top left" />
        <p-notice-alert group="noticeTopRight" position="top right" />
        <p-notice-alert group="noticeBottomLeft" position="bottom left" />
        <p-notice-alert group="noticeBottomRight" position="bottom right" />
        <p-toast-alert group="toastTopCenter" position="top center" />
        <router-view />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import {
    defineComponent,
    getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';

import PNoticeAlert from '@/components/molecules/alert/notice/PNoticeAlert.vue';
import PToastAlert from '@/components/molecules/alert/toast/PToastAlert.vue';

import config from '@/lib/config';
import { api } from '@/lib/api/axios';
import { SpaceConnector } from '@/lib/space-connector';
import { GTag, setGtagUserID } from '@/lib/gtag';
import { useStore } from '@/store/toolset';
import { store } from '@/store';
import router from '@/routes';

export default defineComponent({
    name: 'App',
    components: {
        PNoticeAlert,
        PToastAlert,
    },
    props: {
        processEnv: {
            type: String,
            default: process.env.NODE_ENV,
        },
    },
    setup(props, context) {
        // const vm = getCurrentInstance() as any;
        // const { logout } = useStore();
        // const state = reactive({
        //     loading: true,
        // });
        // const configInit = async () => {
        //     await config.init();
        //     await SpaceConnector.init(config.get('CONSOLE_API.ENDPOINT'), () => {
        //         // TODO: open session expire modal
        //         logout();
        //     });
        //     Vue.prototype.$http = api.init(config.get('VUE_APP_API.ENDPOINT'));
        // };
        // const domainInit = async () => {
        //     let domainName;
        //     if (config.get('DOMAIN_NAME_REF') === 'hostname') {
        //         const { hostname } = window.location;
        //         domainName = hostname.split('.')[0];
        //     } else {
        //         domainName = config.get('DOMAIN_NAME');
        //     }
        //     await store.dispatch('domain/load', domainName);
        // };
        //
        // const gtagInit = () => {
        //     if (config.get('GTAG_ID')) new GTag(config.get('GTAG_ID'), vm, vm.$router);
        //     setGtagUserID(vm, vm.$store);
        // };
        //
        // const preparationTo = async () => {
        //     try {
        //         await configInit();
        //         await domainInit();
        //         gtagInit();
        //     } catch (e) {
        //         console.error(e);
        //     }
        //     state.loading = false;
        // };
        //
        // /* init */
        // (async () => {
        //     await preparationTo();
        // })();
        //
        // return {
        //     ...toRefs(state),
        // };
    },
});

</script>
