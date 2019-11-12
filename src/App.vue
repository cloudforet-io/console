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
        async preparationTo() {
            try {
                await this.configInit();
                await this.syncStores('auth');
                await this.domainInit();
                await this.syncStores('domain');

                this.isInit = true;
                const excludeAuth = this.getMeta();

                if (!api.checkAccessToken()) {

                    if (this.checkMatchedPath(this.$store.getters['domain/authType'], localStorage.getItem('common.toNextPath'))) {
                        const nextPath = this.$store.getters['domain/authType'] === 'local' ? '/sign-in' : '/google-sign-in';
                        localStorage.setItem('common.toNextPath', nextPath);
                        this.$router.push({ path: nextPath });
                    }

                    if (excludeAuth !== true) {
                        this.redirectTo();
                    }
                }
            } catch (e) {
                console.log(e);
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
        getMeta() {
            return this.isEmpty(localStorage.getItem('common.toMeta')) ? null : _.get(JSON.parse(localStorage.getItem('common.toMeta')), 'excludeAuth', null);
        },
        checkMatchedPath(type, path) {
            return (path === '/sign-in' && type !== 'local' || path === '/google-sign-in' && type !== 'google_oauth2');
        },
    },
};

</script>

<style lang="scss">
    @import 'styles/style';
    //test
</style>
