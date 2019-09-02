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
                    {{ $t('MSG.LOG_IN') }}
                  </h1>
                  <transition v-if="seenGreet" name="slide-fade">
                    <p class="message">
                      <b>{{ $t('MSG.SIGN_IN') }}</b>
                    </p>
                  </transition>
                  <transition v-if="seenError" name="slide-fade">
                    <p class="message" style="color: #B82E24">
                      <b>{{ $t('MSG.SIGN_FAIL_TITLE') }}</b>
                      <br> {{ $t('MSG.SIGN_FAIL_BODY') }}
                    </p>
                  </transition>
                  <b-input-group class="mb-3">
                    <div id="g-signin-btn" />
                  </b-input-group>
                </b-form>
              </b-card-body>
            </b-card>
            <b-card no-body class="text-white bg-primary py-5 d-md-down-none" style="width:44%">
              <b-card-body class="text-center">
                <div>
                  <br>
                  <br>
                  <p> {{ $t('MSG.SIGN_UP_MSG') }}</p>
                </div>
              </b-card-body>
            </b-card>
          </b-card-group>
        </b-col>
      </b-row>
      </basesimplemodal>
    </div>
  </b-row>
</template>

<script>
/*function onSignIn(googleUser) {
    console.log('on sign in, granted scopes: ' + googleUser.getGrantedScopes());
    console.log('ID token: ' + googleUser.getAuthResponse().id_token);
    console.log('Access token: ' + googleUser.getAuthResponse().access_token);
    let profile = googleUser.getBasicProfile();
    let message = `ID:   ${profile.getId()}  '\n' Name: ${profile.getName()}  '\n' Image URL:  ${profile.getImageUrl()} '\n'  Email:  ${profile.getEmail()} `;
    debugger;
    this.alertAbs();
    //setProfileImage(profile.getImageUrl());
}*/
import { mapGetters } from 'vuex';
export default {
    components: {
    },
    data () {
        return {
            rememberStatus: false,
            seenGreet: true,
            seenError: false,
            userId: 'admin',
            password: 'admin'
        };
    },
    computed: {
        ...mapGetters('auth', [
            'nextPath'
        ])
    },
    mounted () {
        this.setGoogleSignInButton();
    },
    methods: {
        setGoogleSignInButton(){
            gapi.load('auth2', function() {
                let auth2 = gapi.auth2.init({
                    client_id: '150323145707-hp5i8q4hm1vcb2hpta23c1829167nl1h.apps.googleusercontent.com',
                    fetch_basic_profile: false,
                    scope: 'profile'
                });
                gapi.signin2.render('g-signin-btn', {
                    scope: 'email',
                    width: 200,
                    height: 50,
                    longtitle: false,
                    theme: 'dark',
                    onsuccess: this.onSignIn(this),
                    onfailure: null
                });
            });
        },
        onSignIn(googleUser){
            console.log('on sign in, granted scopes: ' + googleUser.getGrantedScopes());
            console.log('ID token: ' + googleUser.getAuthResponse().id_token);
            console.log('Access token: ' + googleUser.getAuthResponse().access_token);
            let profile = googleUser.getBasicProfile();
            let message = `ID:   ${profile.getId()}  '\n' Name: ${profile.getName()}  '\n' Image URL:  ${profile.getImageUrl()} '\n'  Email:  ${profile.getEmail()} `;
            console.log(message);
            debugger;
            this.alertAbs();
        },
        async login () {
            console.log(this.tr('MSG.LOG_IN'));
            await this.$store.dispatch('auth/login',
                {
                    userId: this.userId,
                    password: this.password,
                    domainId: sessionStorage.getItem('domainId')
                }
            ).then(() => {
                this.$router.push(this.nextPath);
                this.rememberMe();
                this.setTimeZone();
            }).catch(() => {
                this.showErorrMSG(setTimeout(() => this.showGreetMSG(), 3000));
            });
        },
        showErorrMSG () {
            this.seenGreet = false;
            this.seenError = true;
        },
        showGreetMSG () {
            this.seenGreet = true;
            this.seenError = false;
        },
        rememberMe () {
            if (this.rememberStatus && !this.isEmpty(this.userId)) {
                localStorage.userId = this.userId;
                localStorage.checkbox = this.rememberStatus;
            } else {
                localStorage.userId = '';
                localStorage.checkbox = false;
            }
        },
        popSignUpInstruction () {
            this.$refs.LogInSimpleModal.showModal();
        },
        async setTimeZone(){
            await this.$axios.post('identity/user/get', {
                user_id: this.userId,
                domainId: sessionStorage.getItem('domainId')
            }).then((response) => {
                const timeZone = this.isEmpty(response.data.timezone) ? 'Etc/GMT' : response.data.timezone;
                localStorage.timeZone = timeZone;

            }).catch(() => {
                this.showErorrMSG(setTimeout(() => this.showGreetMSG(), 3000));
            });
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
</style>
