<template>
    <div v-if="isInit" id="app">
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
import api from '@/lib/api';
import config from '@/lib/config';
import PLottie from '@/components/molecules/lottie/PLottie.vue';
import PNoticeAlert from '@/components/molecules/alert/notice/NoticeAlert.vue';
import store from '@/store';

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
                // todo : check logic
                if (this.$store.getters['auth/isSignedIn'] && this.$route.meta.isSignInPage) {
                    this.$router.push({ path: '/' });
                    return;
                }

                // TODO:: Please Remove this for later when every domian sign in use Config options.
                // if (this.isPathMissMatch(this.$store.getters['domain/authType'], localStorage.getItem('common.toNextPath'))) {
                //     this.redirectTo('set');
                //     return;
                // }
                // if (!excludeAuth) {
                //     this.redirectTo();
                //     return;
                // }
            } catch (e) {
                this.$router.push({ path: '/error-page' });
                console.error(e);
            }
        },
        async configInit() {
            await config.init();
            await api.init(config.get('VUE_APP_API.ENDPOINT'), {
                authError: () => {
                    this.$store.commit('auth/signOut');
                },
            });

            Vue.prototype.$http = api.instance;
        },
        async domainInit() {
            if (!this.$store.getters['domain/id']) {
                try {
                    await this.$store.dispatch('domain/load');
                } catch (e) {
                    console.error(e);
                    this.$router.push({ path: '/error-page' });
                }
            }
        },
        async syncStores(storeName) {
            await this.$store.dispatch(`${storeName}/sync`);
        },

        getMeta() {
            return this.isEmpty(localStorage.getItem('common.toMeta')) ? null : _.get(JSON.parse(localStorage.getItem('common.toMeta')), 'excludeAuth', null);
        },
        isPathMissMatch(type, path) {
            return (path === '/sign-in' && type !== 'local')
                || (path === '/google-sign-in' && type !== 'google_oauth2');
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
