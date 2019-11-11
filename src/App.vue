<template>
    <div v-if="isInit" id="app">
        <router-view />
    </div>
    <div v-else>
        This is Loading Page
    </div>
</template>
<script>
import Vue from 'vue';
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
            await config.init();
            await this.prepareApi();
            await this.prepareDomain();
            await this.$store.dispatch('auth/sync');
            this.$router.push(localStorage.getItem('common.nextPath'));
            this.isInit = true;
        },
        async prepareApi() {
            await api.init(config.get('VUE_APP_API.ENDPOINT'), {
                authError: () => {
                    this.$store.dispatch('auth/signOut');
                    // TODO: show popup (re-sign-in)
                },
            });

            Vue.prototype.$http = api.instance;
        },
        async prepareDomain() {
            this.$store.dispatch('domain/sync');
            if (!this.$store.getters['domain/id']) {
                try {
                    await this.$store.dispatch('domain/load');
                } catch (e) {
                    console.error(e);
                    this.$router.push({ path: '/error-page' });
                }
            }
        },
        // redirectTo() {
        //     const nextPath = this.$store.getters['domain/authType'] === 'local' ? { path: '/sign-in' } : { path: '/google-sign-in' };
        //     this.$router.push(nextPath);
        // },
    },
};

</script>

<style lang="scss">
  @import 'styles/style';
  //test
</style>
