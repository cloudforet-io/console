<template>
    <div v-if="isInit" id="app">
        <router-view />
    </div>
    <div v-else>
        This is Loading Page
    </div>
</template>
<script>
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
    async created() {
        await this.initialize();
    },
    methods: {
        async initialize() {
            await this.preparationTo();
            if (this.isInit === true) {
                this.redirectTo();
            }
        },
        async preparationTo() {
            await config.init();
            await api.init(config.get('VUE_APP_API.ENDPOINT'), {
                authError: (error) => {
                    this.$store.dispatch('auth/signOut');
                    // TODO: show popup (re-sign-in)
                },
            });

            Vue.prototype.$http = api.instance;

            this.$store.dispatch('domain/sync');
            debugger;
            if (!this.$store.getters['domain/id']) {
                try {
                    await this.$store.dispatch('domain/load');

                    console.log('in APP.vue', localStorage.getItem('common.authType'));

                } catch (e) {
                    console.log(e);
                    this.$router.push({ path: '/error-page' });
                }
            }
            await this.$store.dispatch('auth/sync');
            this.isInit = true;
        },
        redirectTo() {
            const nextPath = this.$store.getters['domain/authType'] === 'local' ? { path: '/sign-in'}: { path: '/google-sign-in' };
            this.$router.push(nextPath);
        },
    },
};

</script>

<style lang="scss">
  @import 'styles/style';
  //test
</style>
