<template>
    <div v-if="isInit" id="app">
        <router-view />
    </div>
    <div v-else>
        This is Loading Page
    </div>
</template>
<script>
import _ from 'lodash';
import Vue from '@/main.js';
import api from '@/lib/api';
import config from '@/lib/config';

export default {
    name: 'App',
    props: {
        processEnv: {
            type: String,
            default: process.env.NODE_ENV,
        },
    },
    data() {
        return {
            isInit: false,
        };
    },
    created() {
        this.preparationTo();
    },
    methods: {
        isInitialized() {
            if (this.isEmpty($cookies.get('domainInfo')) || this.isEmpty(_.get(Vue, 'prototype.$http'))) {
                console.log('domainInfo', $cookies.get('domainInfo'));
                console.log('#####################', _.get(Vue, 'prototype.$http'));
                return false;
            }
            this.isInit = true;
            return true;
        },
        async preparationTo() {
            await this.configInit();
            await this.syncStores('auth');
            await this.domainInit();
            await this.syncStores('domain');

            if (this.isInitialized()) {
                if (!api.checkAccessToken()) {
                    this.redirectTo();
                }
            }
        },
        async configInit() {
            await config.init();
            await api.init(config.get('VUE_APP_API.ENDPOINT'), {
                authError: (error) => {
                    this.$store.dispatch('auth/signOut');
                    // TODO: show popup (re-sign-in)
                },
            });

            Vue.prototype.$http = api.instance;
        },
        async domainInit() {
            if (!this.$store.getters['domain/id']) {
                try {
                    await this.$store.dispatch('domain/load');

                    console.log('in APP.vue', localStorage.getItem('common.authType'));
                } catch (e) {
                    console.log(e);
                    this.$router.push({ path: '/error-page' });
                }
            }
        },
        async syncStores(storeName) {
            await this.$store.dispatch(`${storeName}/sync`);
        },
        redirectTo() {
            const nextPath = this.$store.getters['domain/authType'] === 'local' ? { path: '/sign-in' } : { path: '/google-sign-in' };
            this.$router.push(nextPath);
        },
    },
};

</script>

<style lang="scss">
    @import 'styles/style';
    //test
</style>
