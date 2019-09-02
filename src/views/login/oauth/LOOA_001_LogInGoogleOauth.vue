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
                    <b-button class="g-signin-button" variant="outline-primary" @click="setGoogleSignInButton">
                      Google Sign in
                    </b-button>
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
import GAuth from 'vue-google-oauth2';
import { mapGetters } from 'vuex';
export default {
    components: {
    },
    data () {
        return {
            isSignIn: null,
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
        //this.setGoogleSignInButton();
    },
    methods: {
        async setGoogleSignInButton(){
            try {
                let GoogleUser = await this.$gAuth.signIn();
                console.log('GoogleUser', GoogleUser);
                this.login(GoogleUser);
            } catch (e){
                console.log(e);
            }
        },
        async login (oauth) {
            const oauthObject = {
                domainId: sessionStorage.getItem('domainId'),
                access_token: oauth.Zi.access_token
            };
            console.log('authObj', oauthObject);
            await this.$store.dispatch('auth/login', oauthObject
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
