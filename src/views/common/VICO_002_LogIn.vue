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
        ref="LogInSimpleModal"
        :title="tr('TR_NOTI')"
      >
        <template #contents>
          <div>
            We apologize for inconvenience. 'Sign up', 'Password retrieval' feature currently unavailable due to our policies.
            <br>Please, contact System Administrator for following contacts:
            <br>
            <div>● e-mail:<a href="mailto:admin@mz.co.kr"> <b> admin@mz.co.kr</b></a></div>
            <div>● Phone: <a href="#">+82 (02)<b>1644-2243</b></a></div>
          </div>
        </template>
      </BaseSimpleModal>

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
                    <b-input-group-prepend>
                      <b-input-group-text><i class="fal fa-user" /></b-input-group-text>
                    </b-input-group-prepend>
                    <b-form-input v-model="username" type="text" placeholder="User name" />
                  </b-input-group>
                  <b-input-group class="mb-2">
                    <b-input-group-prepend>
                      <b-input-group-text><i class="fal fa-key" /></b-input-group-text>
                    </b-input-group-prepend>
                    <b-form-input v-model="password" type="password" placeholder="Password"
                                  autocomplete="current-password"
                    />
                  </b-input-group>
                  <b-row>
                    <b-col class="col-11 col-xs-11 col-sm-11 col-md-10 col-lg-10 col-xl-8">
                      <b-form-checkbox
                        id="LOGIN_checkbox"
                        v-model="rememberStatus"
                        name="LOGIN_checkbox"
                        :true-value="true"
                        :false-value="false"
                      >
                        {{ $t('MSG.REMEMBER') }}
                      </b-form-checkbox>
                    </b-col>
                    <b-col class="col-1 col-xs-1 col-sm-1 col-md-1 col-lg-4 col-xl-4 login-check">
                      <button v-b-tooltip.hover
                              type="button"
                              class="btn btn-link login-check"
                              title="Trouble to Log In?"
                              @click="popSignUpInstruction"
                      >
                        <i class="fal fa-exclamation-circle" />
                      </button>
                    </b-col>
                  </b-row>
                  <b-row class="row justify-content-end">
                    <b-col class="col-xs-12 col-sm-12 col-md-12 col-lg-5 col-xl-4">
                      <b-button type="button" block class="login-btn" @click="login">
                        {{ $t('MSG.LOG_IN') }}
                      </b-button>
                    </b-col>
                  </b-row>
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
import { mapGetters } from 'vuex';
import BaseSimpleModal from '@/components/base/modal/BAMO_002_BaseSimpleModal.vue';
const signupContents = 'We apologize for inconvenience. \'Sign up\', \'Password retrieval\' feature currently unavailable due to our policies.' +
        ' Please, contact System Administrator for following contacts: ' + '<br>' +
        '● e-mail: admin@mz.co.kr';
export default {
    components: {
        BaseSimpleModal
    },
    data () {
        return {
            instructionContents: signupContents,
            rememberStatus: false,
            seenGreet: true,
            seenError: false,
            username: 'admin',
            password: 'admin'
        };
    },
    computed: {
        ...mapGetters('auth', [
            'nextPath'
        ])
    },
    mounted () {
        this.isRemembered();
    },
    methods: {
        async login () {
            console.log(this.$i18n.t('MSG.LOG_IN'));
            await this.$store.dispatch('auth/login',
                {
                    username: this.username,
                    password: this.password,
                    domainId: sessionStorage.getItem('domain_id')
                }
            ).then(() => {
                this.$router.push(this.nextPath);
                this.rememberMe();
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
        isRemembered () {
            localStorage.checkbox = (localStorage.checkbox === 'true');
            if (localStorage && !this.isEmpty(localStorage.username)) {
                this.rememberStatus = true;
                this.username = localStorage.username;
            } else {
                this.rememberStatus = false;
                this.username = '';
            }
        },
        rememberMe () {
            if (this.rememberStatus && !this.isEmpty(this.username)) {
                localStorage.username = this.username;
                localStorage.checkbox = this.rememberStatus;
            } else {
                localStorage.username = '';
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
    @import '../../asset/style/css/slideShow.css';

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
