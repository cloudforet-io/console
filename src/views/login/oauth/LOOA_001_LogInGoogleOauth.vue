<template>
  <b-row align-v="center">
    <div class="container fade-in">
      <b-row class="justify-content-center">
        <b-col md="8">
          <b-card-group class="card-group">
            <b-card no-body class="p-4">
              <b-card-body>
                <b-form>
                  <h1>
                    {{ tr('MSG.SIGN_IN') }}
                  </h1>
                  <p class="message">
                    <b>{{ tr('MSG.SIGN_IN_MSG') }}</b>
                  </p>
                  <b-input-group class="mb-4">
                    <div id="g-signin-btn" style="width: 70%;" @click="login" />
                  </b-input-group>
                  <b-input-group class="mb-4">
                    <b-button block style="height:50px" variant="danger" @click="directToAdmin">
                      {{ tr('MSG.ADMIN_USER') }}
                    </b-button>
                  </b-input-group>
                </b-form>
              </b-card-body>
            </b-card>
            <b-card no-body class="text-white bg-primary py-5 d-md-down-none" style="width:44%">
              <b-card-body class="text-center">
                <div>
                  <h1>
                    <p>
                      {{ tr('MSG.WELCOME_MSG',[getCurrentHostname]) }}
                    </p>
                  </h1>
                  <p> {{ $t('MSG.SIGN_IN_DESC') }}</p>
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
import store from '@/store';
import url from 'url';
import { mapGetters } from 'vuex';
const gapi = window.gapi;
export default {
    components: {},
    data() {
        return {
            isSignedIn: false,
            oathSignParam: null,
            seenGreet: true,
            seenError: false,
            pramObject: null
        };
    },
    computed: {
        ...mapGetters('auth', [
            'nextPath'
        ]),
        getCurrentHostname (){
            let hostName = url.parse(window.location.href).host;
            return hostName.substring(0, hostName.indexOf('.')).toUpperCase();
        }
    },
    async mounted() {
        await this.setGoogleSignInButton();
    },
    methods: {
        async directToAdmin () {
            this.$router.push({ name: 'Admin-logIn' });
            this.$router.push({ path: '/admin-log-in' });
        },
        async setGoogleSignInButton() {
            let vm = this;
            const clientId = this.$store.getters['auth/client_id'];
            gapi.load('auth2', function () {
                let auth2 = gapi.auth2.init({
                    client_id: clientId,
                    fetch_basic_profile: false,
                    scope: 'profile'
                });
                vm.isSignedIn = window.gapi.auth2.getAuthInstance().isSignedIn.get();
                gapi.signin2.render('g-signin-btn', {
                    scope: 'email',
                    width: 300,
                    height: 50,
                    longtitle: false,
                    theme: 'dark',
                    onsuccess: vm.onSignIn,
                    onfailure: null
                });
            });
        },
        onSignIn(googleUser) {
            console.log(this.isSignedIn);
            const profile = googleUser.getBasicProfile();
            const param = {
                userId: profile.getEmail(),
                access_token: googleUser.getAuthResponse().access_token
            };
            this.oathSignParam = param;
            this.login();
            /*if (!this.isSignedIn) {
              this.login();
                this.isSignedIn = true;
            }*/


        },
        async login() {
            await this.$store.dispatch('auth/login', this.oathSignParam
            ).then((response) => {
                let auth2 = gapi.auth2.getAuthInstance();
                if (!auth2.isSignedIn.get()) {
                    return;
                }
                auth2.disconnect();
                this.$router.push(this.nextPath);
                this.rememberMe();
                this.setTimeZone();
                console.log('response', response);
            }).catch((error) => {
                if (!this.isEmpty(error.message)){
                    const errorConfig = JSON.parse(error.message);
                    const errorMSG = errorConfig.error_dt_code;
                    if ('ERROR_AUTHENTICATED_WITHOUT_USER' === errorMSG){
                        alert('Please, Create a valid User first.');
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
        rememberMe() {
            if (this.rememberStatus && !this.isEmpty(this.userId)) {
                localStorage.userId = this.userId;
                localStorage.checkbox = this.rememberStatus;
            } else {
                localStorage.userId = '';
                localStorage.checkbox = false;
            }
        },
        popSignUpInstruction() {
            this.$refs.LogInSimpleModal.showModal();
        }
    }
};
</script>

<style lang="scss" scoped>
    @import '../../../asset/style/css/slideShow.css';

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
