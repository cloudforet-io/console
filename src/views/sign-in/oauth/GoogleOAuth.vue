<template>
    <div class="background-cover">
        <div class="row">
            <div class="container fade-in">
                <div class="row d-flex justify-content-center">
                    <div class="col-md-8">
                        <div class="card-group">
                            <div class="card col-7 card-left-container">
                                <div class="signIn-title">
                                    {{ $t('SIGNIN.SIGN_IN') }}
                                </div>
                                <div v-show.visible="greeting" class="signIn-sub-title">
                                    {{ $t('SIGNIN.SIGN_IN_MSG') }}
                                </div>
                                <div v-show.visible="!greeting" class="signIn-sub-title">
                                    <div class="sign-in-alert">
                                        {{ $t('SIGNIN.AUTH_G_FAIL_BODY') }}
                                    </div>
                                </div>
                                <form class="form-binder">
                                    <div class="row">
                                        <div class="g-signin2">
                                            <div id="g-signin-btn" style="width: 70%;" @click="login" />
                                        </div>
                                    </div>
                                    <div class="row mt-4">
                                        <b-col class="col-11 col-xs-11 col-sm-11 col-md-10 col-lg-12 col-xl-12">
                                            <div @click="directToAdmin">
                                                <span class="root-sign">{{ $t('SIGNIN.ROOT_CREDENTIALS') }}</span>
                                            </div>
                                        </b-col>
                                    </div>
                                </form>
                            </div>
                            <div class="card card-right-container embed-responsive-16by9">
                                <img class="card-img-top embed-responsive-item" src="@/assets/images/landing/cloudone_console_sign-in_bg--sm.svg">
                                <div class="card-img-overlay text-white d-flex flex-column justify-content-center">
                                    <div class="text-center">
                                        <p style="margin-bottom: 10px">
                                            <img src="@/assets/images/brand/brand_logo.png" width="100vh" height="100vh">
                                        </p><h1>{{ getCurrentHostname }}</h1></p>
                                        <p>{{ getGreetMessage }} </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import url from 'url';
import { mapGetters } from 'vuex';
import BaseSimpleModal from '@/components/base/modal/BaseSimpleModal';

const { gapi } = window;
export default {
    components: { BaseSimpleModal },
    data() {
        return {
            isSignedIn: false,
            loginId: null,
            oathSignParam: null,
            greeting: true,
            pramObject: null,
        };
    },
    computed: {
        ...mapGetters('auth', [
            'nextPath',
        ]),
        getGreetMessage() {
            const companyTitle = this.$store.getters['domain/companyTitle'];
            const companyDesc = this.$store.getters['domain/description'];
            const hostName = this.getWindowHostName();
            return !this.isEmpty(companyTitle) ? this.tr('SIGNIN.WELCOME_MSG', [companyDesc]) : !this.isEmpty(companyTitle) ? this.tr('SIGNIN.WELCOME_MSG_P', [companyTitle]) : this.tr('SIGNIN.WELCOME_MSG_P', [hostName]);
        },
        getCurrentHostname() {
            const companyTitle = this.$store.getters['domain/companyTitle'];
            const hostName = this.getWindowHostName();
            return !this.isEmpty(companyTitle) ? companyTitle : hostName;
        },
    },
    async mounted() {
        await this.setGoogleSignInButton();
    },
    methods: {
        getWindowHostName() {
            const hostName = url.parse(window.location.href).host;
            return hostName.substring(0, hostName.indexOf('.')).toUpperCase();
        },
        async directToAdmin() {
            this.$router.push({ name: 'Admin-SignIn' });
            this.$router.push({ path: '/admin-sign-in' });
        },
        async setGoogleSignInButton() {
            const vm = this;

            gapi.load('auth', () => {
                const auth2 = gapi.auth2.init({
                    client_id: this.$store.getters['domain/clientId'],
                    fetch_basic_profile: false,
                    scope: 'profile',
                });

                vm.isSignedIn = window.gapi.auth2.getAuthInstance().isSignedIn.get();

                gapi.signin2.render('g-signin-btn', {
                    scope: 'email',
                    width: 300,
                    height: 50,
                    longtitle: true,
                    theme: 'dark',
                    onsuccess: vm.onSignIn,
                    onfailure: null,
                });
            });
        },
        onSignIn(googleUser) {
            const profile = googleUser.getBasicProfile();
            this.loginId = profile.getEmail();
            const param = {
                userId: profile.getEmail(),
                access_token: googleUser.getAuthResponse().access_token,
            };
            this.oathSignParam = param;
            this.login();
        },
        async login() {
            this.displayGreetingMSG(true);
            const auth2 = await gapi.auth2.getAuthInstance();

            if (this.isEmpty(this.oathSignParam)) {
                return;
            }

            await this.$store.dispatch('auth/signIn', this.oathSignParam).then((response) => {
                if (!auth2.isSignedIn.get()) {
                    return;
                }
                auth2.disconnect();
                if (localStorage.getItem('common.toNextPath') === '/google-sign-in' || localStorage.getItem('common.toNextPath') === null) {
                    localStorage.setItem('common.toNextPath', '/');
                }
                this.$router.push({ path: localStorage.getItem('common.toNextPath') });
            }).catch((error) => {
                auth2.disconnect();
                this.displayGreetingMSG(false);
                console.log(error);
                /* if (!this.isEmpty(error.message)) {
                    const errorConfig = JSON.parse(error.message);
                    const errorMSG = errorConfig.error_dt_code;

                } else {
                    this.consoleLogEnv('error', error);
                } */
            });
        },
        displayGreetingMSG(flag) {
            this.greeting = flag;
        },
    },
};
</script>

<style lang="scss" scoped>

    .background-cover {
        height: 100vh;
        width: 100vw;
        background-position: center bottom;
        background-size: cover;
        background-image: url("../../../assets/images/landing/cloudone_console_sign-in_bg.jpg");
    }

    .signIn-title {
        text-align: left;
        font: Bold 32px/37px Arial;
        letter-spacing: 0;
        color: #222532;
        opacity: 1;
    }

    .signIn-sub-title {
        margin-top: 0.5rem;
        text-align: left;
        font: 14px/16px Arial;
        letter-spacing: 0;
        color: #000000;
        opacity: 1;
    }

    .sign-in-alert{
        text-align: left;
        font: 14px/16px Arial;
        letter-spacing: 0;
        color: $alert;
        opacity: 1;
    }

    .card-left-container {
        padding: 1.5rem;
    }

    .card-right-container {
        border: none;
        background:  $primary;
        opacity: 1;
        max-height: 30vh;
        > img {
            object-fit: cover;
            max-height: 30vh;
            border-radius: 0;
            border-top-right-radius: 7px;
            border-bottom-right-radius: 7px;
        }
    }

    .form-binder {
        margin-top: 1.5rem;
    }

    span.root-sign:hover {
        text-decoration: underline;
        cursor: pointer
    }

    .root-sign {
        text-align: left;
        font: Regular 14px/16px Arial;
        letter-spacing: 0;
        color: #8185D1;
        opacity: 1;
    }

    .g-signin2{
        width: 100%;
        padding-left: 1rem;
    }


    .right-info-card-body {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
    }

    .signIn-check {
        float: right;
        padding: 0px 6px 6px 0px;
    }

    .container {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }


    .card-group {
        @extend %sheet;
        .input-group-text {
            border: 0;
            background: none;
        }

        .form-control {
            border: 1px solid $lightgray;
            border-radius: 5px;
        }
    }
    .signIn-btn {
        border: 0;
        background: $primary;
        color: $white;
        &:hover {
            color: $white;
        }
    }

    .g-signin-button {
        /* This is where you control how the button looks. Be creative! */
        display: inline-block;
        padding: 4px 8px;
        border-radius: 3px;
        background-color: #3c82f7;
        color: #fff;
        box-shadow: 0 3px 0 #0f69ff;
    }
</style>
