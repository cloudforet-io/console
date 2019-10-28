<template>
    <b-row align-v="center">
        <ul class="cb-slideshow">
            <li>
                <span />
                <div><h3>Clo·ud San·d·box</h3></div>
            </li>
            <li>
                <span />
                <div><h3>com·po·sure</h3></div>
            </li>
            <li>
                <span />
                <div><h3>e·qua·nim·i·ty</h3></div>
            </li>
            <li>
                <span />
                <div><h3>bal·an·ce</h3></div>
            </li>
            <li>
                <span />
                <div><h3>qui·e·tude</h3></div>
            </li>
            <li>
                <span />
                <div><h3>Ma·inf·rame compu·ter</h3></div>
            </li>
        </ul>
        <div class="container fade-in">
            <BaseSimpleModal
                ref="LOOA001_ErrorSimpleModal"
                :type="'danger'"
                :title="tr('TR_NOTI')"
            >
                <template #contents>
                    <div>
                        {{ tr('MODAL_MSG.NO_USER_VALID',[loginId]) }}
                        <br>
                        <div>● e-mail:<a href="mailto:admin@mz.co.kr"> <b> admin@mz.co.kr</b></a></div>
                        <div>● Phone: <a href="#">+82 (02)<b>1644-2243</b></a></div>
                    </div>
                </template>
            </BaseSimpleModal>
            <b-row class="justify-content-center">
                <b-col md="8">
                    <b-card-group class="card-group">
                        <b-card no-body class="p-4" style="min-height: 35vh">
                            <b-card-body>
                                <b-form>
                                    <h1>{{ $t('COMMON.SIGN_IN') }}</h1>
                                    <transition v-if="seenGreet" name="slide-fade">
                                        <p class="message">
                                            <b>{{ $t('COMMON.SIGN_IN_MSG') }}</b>
                                        </p>
                                    </transition>
                                    <transition v-if="seenError" name="slide-fade">
                                        <p class="message" style="color: #B82E24">
                                            <b>{{ $t('COMMON.SIGN_FAIL_TITLE') }}</b>
                                            <br> {{ $t('COMMON.SIGN_FAIL_BODY') }}
                                        </p>
                                    </transition>
                                    <b-input-group class="mb-4" >
                                        <div id="g-signin-btn" style="width: 70%;" @click="login" />
                                    </b-input-group>
                                    <b-col class="col-11 col-xs-11 col-sm-11 col-md-10 col-lg-12 col-xl-12">
                                        <div style="text-align: left" @click="directToAdmin"><a class="root-sign" href="#">{{ $t('SIGNIN.ROOT_CREDENTIALS') }}</a>
                                        </div>
                                    </b-col>
                                </b-form>
                            </b-card-body>
                        </b-card>
                        <b-card no-body class="text-white bg-primary" style="width:44%;">
                            <b-card-body class="right-info-card-body ">
                                <div class="text-center">
                                    <p style="margin-bottom: 10px">
                                        <img src="@/assets/images/brand/dcos.png" width="100vh" height="100vh">
                                    </p><h1>{{ getCurrentHostname }}</h1></p>
                                    <p>{{ getGreetMessage }} </p>
                                </div>
                            </b-card-body>
                        </b-card>
                    </b-card-group>
                </b-col>
            </b-row>
        </div>
    </b-row>
</template>
<script>
import url from 'url';
import { mapGetters } from 'vuex';
import store from '@/store';
import BaseSimpleModal from '@/components/base/modal/BaseSimpleModal';
/* global gapi */
const { gapi } = window;
export default {
    components: { BaseSimpleModal },
    data() {
        return {
            isSignedIn: false,
            loginId: null,
            oathSignParam: null,
            seenGreet: true,
            seenError: false,
            pramObject: null,
        };
    },
    computed: {
        ...mapGetters('auth', [
            'nextPath',
        ]),
        getCurrentHostname() {
            const hostName = url.parse(window.location.href).host;
            return hostName.substring(0, hostName.indexOf('.')).toUpperCase();
        },
        getGreetMessage() {
            const GreetingMsg = this.$store.getters['auth/greetDesc'];
            return !this.isEmpty(GreetingMsg) ? GreetingMsg : '';
        },
    },
    async mounted() {
        await this.setGoogleSignInButton();
    },
    methods: {
        async directToAdmin() {
            this.$router.push({ name: 'Admin-SignIn' });
            this.$router.push({ path: '/admin-sign-in' });
        },
        async setGoogleSignInButton() {
            const vm = this;
            const clientId = this.$store.getters['auth/client_id'];

            gapi.load('auth2', () => {
                const auth2 = gapi.auth2.init({
                    client_id: clientId,
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
            console.log(this.isSignedIn);
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
            const auth2 = gapi.auth2.getAuthInstance();
            await this.$store.dispatch('auth/login', this.oathSignParam).then((response) => {
                if (!auth2.isSignedIn.get()) {
                    return;
                }
                auth2.disconnect();
                this.$router.push(this.nextPath);
                this.setTimeZone();
                console.log('response', response);
            }).catch((error) => {
                if (!this.isEmpty(error.message)) {
                    const errorConfig = JSON.parse(error.message);
                    const errorMSG = errorConfig.error_dt_code;
                    auth2.disconnect();
                    if (errorMSG === 'ERROR_AUTHENTICATED_WITHOUT_USER') {
                        this.showErorrMSG(setTimeout(() => this.showGreetMSG(), 3000));
                    }
                } else {
                    this.consoleLogEnv('error', error);
                }
            });
        },
        showErorrMSG() {
            this.seenGreet = false;
            this.seenError = true;
        },
        showGreetMSG() {
            this.seenGreet = true;
            this.seenError = false;
        },
        popSignUpInstruction() {
            this.$refs.LogInSimpleModal.showModal();
        },
    },
};
</script>

<style lang="scss" scoped>
    @import '../../../assets/style/css/slideShow.css';
    a.root-sign:hover {
        text-decoration: underline;
    }

    .root-sign {
        text-align: left;
        font-size: 14px;
        font-family: "Helvetica Neue",Roboto,Arial,sans-serif;
        line-height: 21px;
        color: #16b;
        text-decoration: none;
    }

    .right-info-card-body {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
    }
    .login-check {
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

    .login-btn {
        border: 0;
        background: linear-gradient(to right, $blue, $violet);
        box-shadow: 0 0 5px 1px rgba($navy, 0.3);
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
