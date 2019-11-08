<template>
    <div>
        This is loading...
    </div>
</template>

<script>
import Vue from '@/main.js';
import { mapGetters, mapMutations } from 'vuex';
import api from '@/lib/api';
import config from '@/lib/config';

export default {
    name: 'Init',
    components: {
    },
    data() {
        return {
            rememberStatus: false,
            seenGreet: true,
            seenError: false,
        };
    },
    created() {
        this.initialize();
    },
    computed: {
        ...mapGetters('auth', ['nextPath']),
        ...mapMutations('auth', [
            'nextPath',
        ]),
        ...mapGetters('domain', ['authType']),
    },
    methods: {
        async initialize() {
            await this.preparationTo();
            if (this.checkAvailability) {
                this.checkAndNextRoute();
                this.processToNext();
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

            if (!this.$store.getters['domain/id']) {
                try {
                    await this.$store.dispatch('domain/load');
                } catch (e) {
                    console.log(e);
                    this.$router.push({ path: '/error-page' });
                }
            }
            await this.$store.dispatch('auth/sync');
        },
        checkAndNextRoute () {
            const currentTo = localStorage.getItem('toPath');
            if (currentTo === '/' || currentTo === '/sign-in') {
                if (this.authType !== 'local') {
                    this.nextPath('/google-sign-in');
                }
            }
        },
        checkAvailability() {
            return !!((!this.isEmpty(this.$http) && !this.isEmpty(this.$store.getters['domain/id'])));
        },
        processToNext() {
            this.$router.push({ path: localStorage.getItem('toPath') });
        },
    },
};
</script>

<style lang="scss" scoped>

</style>
