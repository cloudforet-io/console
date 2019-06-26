<template>
    <div id="app" class="app flex-row align-items-center">
      <div class="container">

        <b-row class="justify-content-center">
          <b-col md="8">
            <b-card-group>
              <b-card no-body class="p-4">
                <b-card-body>
                  <b-form>
                    <h1>{{ $t('MSG.LOG_IN')}}</h1>
                    <transition name="slide-fade" v-if="seenGreet">
                      <p class="message" ><b>{{ $t('MSG.SIGN_IN')}}</b></p>
                    </transition>
                    <transition name="slide-fade" v-if="seenError">
                      <p class="message" style="color: #B82E24"><b>{{$t('MSG.SIGN_FAIL_TITLE')}}</b><br> {{ $t('MSG.SIGN_FAIL_BODY')}}</p>
                    </transition>
                    <b-input-group class="mb-3">
                      <b-input-group-prepend><b-input-group-text><i class="icon-user"></i></b-input-group-text></b-input-group-prepend>
                      <b-form-input v-model="username" type="text" placeholder="Username" />
                    </b-input-group>
                    <b-input-group class="mb-4">
                      <b-input-group-prepend><b-input-group-text><i class="icon-lock"></i></b-input-group-text></b-input-group-prepend>
                      <b-form-input v-model="password" type="password" placeholder="Password" autocomplete="current-password" />
                    </b-input-group>
                    <b-row>
                      <b-col cols="6">
                        <b-button type="button" size="sm" variant="primary" @click="login" class="px-4">
                          {{ $t('MSG.LOG_IN')}}
                        </b-button>
                      </b-col>
                      <b-col cols="6" class="text-right">
                        <b-button type="button" variant="link" class="px-0">
                          {{ $t('MSG.FORGPW')}}
                        </b-button>
                      </b-col>
                    </b-row>
                  </b-form>
                </b-card-body>
              </b-card>
              <b-card no-body class="text-white bg-primary py-5 d-md-down-none" style="width:44%">
                <b-card-body class="text-center">
                  <div>
                    <h2> {{ $t('MSG.SIGN_UP')}}</h2>
                    <p> {{ $t('MSG.SIGN_UP_MSG')}} </p>
                    <b-button variant="primary" class="active mt-3">{{ $t('MSG.REGISTER')}}</b-button>
                  </div>
                </b-card-body>
              </b-card>
            </b-card-group>
          </b-col>
        </b-row>
      </div>
    </div>
  <!--<b-row no-gutters align-v="center" align-h="center" class="animated fadeIn content-body">
    <b-col cols="4">
      <h3>Welcome to the OOOOOO.</h3>
    </b-col>
    <b-col cols="4">
      <b-card class="signin-box">
        <b-form>
          <b-form-group>
            <b-input-group>
              <b-input-group-prepend>
                <b-input-group-text><i class="fa fa-user" /></b-input-group-text>
              </b-input-group-prepend>
              <b-form-input v-model="username" type="text" placeholder="Username" />
            </b-input-group>
          </b-form-group>
          <b-form-group>
            <b-input-group>
              <b-input-group-prepend>
                <b-input-group-text><i class="fa fa-asterisk" /></b-input-group-text>
              </b-input-group-prepend>
              <b-form-input v-model="password" type="password" placeholder="Password" autocomplete="current-password" />
            </b-input-group>
          </b-form-group>
          <div class="form-group form-actions">
            <b-button type="button" size="sm" variant="success" @click="login">
            {{ $t('MSG.LOG_IN')}}
            </b-button>
            &nbsp
            <b-button type="button" size="sm" variant="success" @click="forgotpassword">
              {{ $t('MSG.FORGPW')}}
            </b-button>
          </div>

        </b-form>
      </b-card>
    </b-col>
  </b-row>
  -->
</template>

<script>
import { mapGetters } from 'vuex'
import i18n from '../setup/i18n'

export default {
  data () {
    return {
      seenGreet: true,
      seenError: false,
      username: 'iamnewyorker1222',
      password: 'this_is_my_scret_password1'
    }
  },
  computed: {
    ...mapGetters('auth', [
      'nextPath'
    ])
  },
  methods: {
    async login () {
        console.log(this.$i18n.t('MSG.LOG_IN'));
        await this.$store.dispatch('auth/login',
          {
            username: this.username,
            password: this.password
          }
        ).then (res => {
          this.$router.push(this.nextPath)
        }).catch(error =>{
          const errObj = JSON.parse(error.message);
          this.showErorMSG(setTimeout(() => this.showGreetMSG(), 3000));
        })
    },
    showErorMSG(){
      this.seenGreet = false;
      this.seenError = true;

    },
    showGreetMSG(){
      this.seenGreet = true;
      this.seenError = false;
    }
  }
}
</script>

<style lang="scss" scoped>

.content-body {
  height: 100vh;
}

.slide-fade-enter-active {
  transition: all .3s ease;
}
.slide-fade-leave-active {
  transition: all .8s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.slide-fade-enter, .slide-fade-leave-to
  /* .slide-fade-leave-active below version 2.1.8 */ {
  transform: translateX(10px);
  opacity: 0;
}

</style>
