<template>
  <div id="app" class="app flex-row align-items-center">
    <ul class="cb-slideshow">
      <li><span>Image 01</span>
        <div><h3>Clo·ud San·d·box</h3></div>
      </li>
      <li><span>Image 02</span>
        <div><h3>com·po·sure</h3></div>
      </li>
      <li><span>Image 03</span>
        <div><h3>e·qua·nim·i·ty</h3></div>
      </li>
      <li><span>Image 04</span>
        <div><h3>bal·an·ce</h3></div>
      </li>
      <li><span>Image 05</span>
        <div><h3>qui·e·tude</h3></div>
      </li>
      <li><span>Image 06</span>
        <div><h3>Ma·inf·rame compu·ter</h3></div>
      </li>
    </ul>

    <div class="container">
      <b-row class="justify-content-center">
        <b-col md="8">
          <b-card-group>
            <b-card no-body class="p-4">
              <b-card-body>
                <b-form>
                  <h1>{{ $t('MSG.LOG_IN')}}</h1>
                  <transition name="slide-fade" v-if="seenGreet">
                    <p class="message"><b>{{ $t('MSG.SIGN_IN')}}</b></p>
                  </transition>
                  <transition name="slide-fade" v-if="seenError">
                    <p class="message" style="color: #B82E24"><b>{{$t('MSG.SIGN_FAIL_TITLE')}}</b>
                      <br> {{ $t('MSG.SIGN_FAIL_BODY')}}</p>
                  </transition>
                  <b-input-group class="mb-3">
                    <b-input-group-prepend>
                      <b-input-group-text><i class="icon-user"></i></b-input-group-text>
                    </b-input-group-prepend>
                    <b-form-input v-model="username" type="text" placeholder="Username"/>
                  </b-input-group>
                  <b-input-group class="mb-2">
                    <b-input-group-prepend>
                      <b-input-group-text><i class="icon-lock"></i></b-input-group-text>
                    </b-input-group-prepend>
                    <b-form-input v-model="password" type="password" placeholder="Password"
                                  autocomplete="current-password"/>
                  </b-input-group>
                  <b-row>
                    <b-col class="col-11 col-xs-11 col-sm-11 col-md-10 col-lg-10 col-xl-8">
                      <b-form-checkbox
                        id="LOGIN_checkbox"
                        v-model="rememberStatus"
                        name="LOGIN_checkbox"
                        :true-value=true
                        :false-value=false>
                        {{ $t('MSG.REMEMBER')}}
                      </b-form-checkbox>
                    </b-col>
                    <b-col class="col-1 col-xs-1 col-sm-1 col-md-1 col-lg-4 col-xl-4 login-check">
                      <button type="button" class="btn btn-link login-check" v-b-tooltip.hover
                              title="Trouble to Log In?">
                        <i class="fa fa-exclamation-circle"></i>
                      </button>
                    </b-col>
                  </b-row>
                  <b-row class="row justify-content-end">
                    <b-col class="col-xs-12 col-sm-12 col-md-12 col-lg-5 col-xl-4">
                      <b-button type="button" variant="primary" @click="login" class="btn-block">
                        {{ $t('MSG.LOG_IN')}}
                      </b-button>
                    </b-col>
                    <!--<b-col cols="6" class="text-right">
                      <b-button type="button" variant="link" class="px-0">
                        {{ $t('MSG.FORGPW')}}
                      </b-button>
                    </b-col>-->
                  </b-row>
                </b-form>
              </b-card-body>
            </b-card>
            <b-card no-body class="text-white bg-primary py-5 d-md-down-none" style="width:44%">
              <b-card-body class="text-center">
                <div>
                  <!--<h2> {{ $t('MSG.SIGN_UP')}}</h2>-->
                  <br>
                  <br>
                  <p> {{ $t('MSG.SIGN_UP_MSG')}} </p>
                  <!--<b-button variant="primary" class="active mt-3">{{ $t('MSG.REGISTER')}}</b-button>-->
                </div>
              </b-card-body>
            </b-card>
          </b-card-group>
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex'
  import i18n from '../setup/i18n'

  export default {
    components: {},

    data() {
      return {
        rememberStatus: false,
        seenGreet: true,
        seenError: false,
        username: '',
        password: ''
      }
    },
    computed: {
      ...mapGetters('auth', [
        'nextPath'
      ]),
    },
    mounted() {
      this.isRemembered()
    },
    methods: {
      async login() {
        console.log(this.$i18n.t('MSG.LOG_IN'));
        await this.$store.dispatch('auth/login',
          {
            username: this.username,
            password: this.password
          }
        ).then(res => {
          this.$router.push(this.nextPath)
          this.rememberMe();
        }).catch(error => {
          const errObj = JSON.parse(error.message);
          this.showErorrMSG(setTimeout(() => this.showGreetMSG(), 3000));
        })
      },
      showErorrMSG() {
        this.seenGreet = false;
        this.seenError = true;

      },
      showGreetMSG() {
        this.seenGreet = true;
        this.seenError = false;
      },
      isRemembered() {
        localStorage.checkbox = (localStorage.checkbox === 'true');
        if (localStorage && !this.isEmpty(localStorage.username)) {
          this.rememberStatus = true
          this.username = localStorage.username;
        } else {
          this.rememberStatus = false
          this.username = "";
        }
      },
      rememberMe() {
        if (this.rememberStatus && !this.isEmpty(this.username)) {
          localStorage.username = this.username;
          localStorage.checkbox = this.rememberStatus;
        } else {
          localStorage.username = "";
          localStorage.checkbox = false;
        }
      },

    }
  }
</script>

<style lang="scss" scoped>
  @import '../asset/css/demo.css';
  @import '../asset/css/slideShow.css';

  .login-check {
    float: right;
    padding: 0px 6px 6px 0px;
  }
</style>
