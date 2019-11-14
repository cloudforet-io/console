<template>
    <div v-if="isInit" id="app">
        <router-view />
    </div>
    <div v-else class="Aligner">
        <div ref="loading" class="Aligner-item" />
    </div>
</template>
<script>
import _ from 'lodash';
import Vue from '@/main.js';
import api from '@/lib/api';
import config from '@/lib/config';
import cloudLoading from '@/assets/loading/cloudone_loading.json';
import lottie from 'lottie-web';

export default {
    name: 'App',
    props: {
        processEnv: {
            type: String,
            default: process.env.NODE_ENV,
        },
    },
    components: {
        lottie
    },
    data() {
        return {
            isInit: false,
        };
    },
    created() {
        this.preparationTo();
    },
    mounted() {
        this.drawLottie();
    },
    methods: {
        async drawLottie() {
            lottie.loadAnimation({
                name: 'test',
                container: this.$refs.loading,
                renderer: 'svg',
                loop: true,
                autoplay: true,
                animationData: cloudLoading,
                rendererSettings: {
                    scaleMode: 'noScale',
                    clearCanvas: false,
                    progressiveLoad: false,
                    hideOnTransparent: true,
                },
            });
        },
        stopLottie (){
            lottie.destroy('test');
        },
        async preparationTo() {
            try {
                await this.configInit();
                await this.syncStores('auth');
                await this.domainInit();
                await this.syncStores('domain');

                this.isInit = true;
                this.stopLottie();
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
    .Aligner {
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .Aligner-item {
        max-width: 100%;
    }
    #loading {
        background-color: transparent;
        /*loading image size*/
        width: 100%;
        height: auto;
        max-width: 600px;
        max-height: 600px;
        /*loading image size end*/
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
</style>
