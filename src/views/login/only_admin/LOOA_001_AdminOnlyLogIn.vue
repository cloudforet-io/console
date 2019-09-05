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
                    Admin {{ $t('MSG.LOG_IN') }}
                  </h1>
                  <transition v-if="seenGreet" name="slide-fade">
                    <p class="message">
                      <b>{{ $t('MSG.LOG_IN_GREET') }}</b>
                    </p>
                  </transition>
                  <transition v-if="seenError" name="slide-fade">
                    <p class="message" style="color: #B82E24">
                      <b>{{ $t('MSG.LOG_FAIL_TITLE') }}</b>
                      <br> {{ $t('MSG.LOG_FAIL_BODY') }}
                    </p>
                  </transition>
                  <b-input-group class="mb-3">
                    <b-input-group-prepend>
                      <b-input-group-text><i class="fal fa-user" /></b-input-group-text>
                    </b-input-group-prepend>
                    <b-form-input v-model="adminUserId" type="text" placeholder="User ID" />
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
                        v-model="adminRememberStatus"
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
                  <b-row class="mb-3">
                    <b-col md="4" class="col-xs-12 col-sm-12">
                      <b-button type="button" variant="primary" @click="directToCommonUser">
                        {{ tr('MSG.COMMON_USER') }}
                      </b-button>
                    </b-col>
                    <b-col md="4" class="ml-auto col-xs-12 col-sm-12">
                      <b-button type="button" block class="login-btn" @click="login">
                        {{ $t('MSG.LOG_IN') }}
                      </b-button>
                    </b-col>
                  </b-row>
                </b-form>
              </b-card-body>
            </b-card>
            <b-card no-body class="text-white bg-danger py-5 d-md-down-none" style="width:44%">
              <b-card-body class="text-center">
                <div>
                  <p /><h2>{{ tr('MSG.WELCOME_MSG_P',[getCurrentHostname]) }} for Admin.</h2> </p>
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
import { mapGetters } from 'vuex';
import BaseSimpleModal from '@/components/base/modal/BAMO_002_BaseSimpleModal.vue';
import url from 'url';
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
            adminRememberStatus: false,
            seenGreet: true,
            seenError: false,
            adminUserId: '',
            password: ''
        };
    },
    computed: {
        ...mapGetters('auth', [
            'nextPath'
        ]),
        getCurrentHostname (){
            let hostName = url.parse(window.location.href).host;
            return hostName.substring(0, hostName.indexOf('.'));
        }
    },
    mounted () {
        this.isRemembered();
    },
    methods: {
        async directToCommonUser () {
            const clientId = this.$store.getters['auth/client_id'];
            if (this.isEmpty(clientId)){
                this.$router.push({ path: '/log-in' });
            } else {
                this.$router.push({ path: '/google-Log-in' });
            }
        },
        async login () {
            const authObj = {
                adminUserId: this.adminUserId,
                password: this.password,
                domainId: sessionStorage.getItem('domainId'),
                user_type: 'DOMAIN_OWNER'
            };
            await this.$store.dispatch('auth/login',authObj).then(() => {
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
        isRemembered () {
            localStorage.checkbox = (localStorage.checkbox === 'true');
            if (localStorage && !this.isEmpty(localStorage.adminUserId)) {
                this.adminRememberStatus = true;
                this.adminUserId = localStorage.adminUserId;
            } else {
                this.adminRememberStatus = false;
                this.adminUserId = '';
            }
        },
        rememberMe () {
            if (this.adminRememberStatus && !this.isEmpty(this.adminUserId)) {
                localStorage.adminUserId = this.adminUserId;
                localStorage.checkbox = this.adminRememberStatus;
            } else {
                localStorage.adminUserId = '';
                localStorage.checkbox = false;
            }
        },
        popSignUpInstruction () {
            this.$refs.LogInSimpleModal.showModal();
        },
        async setTimeZone(){
            await this.$axios.post('identity/user/get', {
                user_id: this.adminUserId,
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
