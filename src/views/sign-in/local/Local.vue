<template>
    <div class="background-cover">
        <div class="row">
            <div class="container fade-in">
                <b-row class="justify-content-center">
                    <b-col md="8">
                        <b-card-group class="card-group">
                            <b-card no-body class="p-4">
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
                                        <b-input-group class="mb-3">
                                            <b-input-group-prepend>
                                                <b-input-group-text><i class="fal fa-user" /></b-input-group-text>
                                            </b-input-group-prepend>
                                            <b-form-input v-model="userId" type="text" placeholder="User ID"
                                                          @keyup.enter="signIn"
                                            />
                                        </b-input-group>
                                        <b-input-group class="mb-2">
                                            <b-input-group-prepend>
                                                <b-input-group-text><i class="fal fa-key" /></b-input-group-text>
                                            </b-input-group-prepend>
                                            <b-form-input v-model="password" type="password" placeholder="Password"
                                                          autocomplete="current-password" @keyup.enter="signIn"
                                            />
                                        </b-input-group>
                                        <b-row>
                                            <b-col class="col-11 col-xs-11 col-sm-11 col-md-10 col-lg-12 col-xl-12">
                                                <div @click="directToAdmin">
                                                    <span class="root-sign">{{ tr('SIGNIN.ROOT_CREDENTIALS') }}</span>
                                                </div>
                                            </b-col>
                                            <b-col class="col-1 col-xs-1 col-sm-1 col-md-1 col-lg-4 col-xl-4 signIn-check">
                                                <button v-b-tooltip.hover
                                                        type="button"
                                                        class="btn btn-link signIn-check"
                                                        title="Trouble to Log In?"
                                                        @click="popSignUpInstruction"
                                                />
                                            </b-col>
                                        </b-row>
                                        <!--<b-row class="row justify-content-end">
                            <b-col md="4" class="p-3 bg-info"> <b-button  sm variant="danger" size="sm">Admin</b-button></b-col>
                            <b-col class="col-xs-12 col-sm-12 col-md-12 col-lg-5 col-xl-4">
                            </b-col>
                          </b-row>-->
                                        <b-row class="mb-3">
                                            <!--<b-col md="4" class="col-xs-12 col-sm-12">
                              <b-button type="button" variant="danger" @click="directToAdmin">
                                {{ tr('MSG.ADMIN_USER') }}
                              </b-button>
                            </b-col>-->
                                            <b-col md="4" class="ml-auto col-xs-12 col-sm-12">
                                                <b-button type="button" block class="signIn-btn"
                                                          @click="signIn"
                                                >
                                                    {{ $t('COMMON.SIGN_IN') }}
                                                </b-button>
                                            </b-col>
                                        </b-row>
                                    </b-form>
                                </b-card-body>
                            </b-card>
                            <div class="card text-white card-right-container">
                                <img src="@/assets/images/landing/cloudone_console_sign-in_bg--sm.svg">
                                <div class="card-img-overlay">
                                    <div class="text-center">
                                        <p style="margin-bottom: 10px">
                                            <img src="@/assets/images/brand/dcos.png" width="100vh" height="100vh">
                                        </p><h1>{{ getCurrentHostname }}</h1></p>
                                        <p>{{ getGreetMessage }} </p>
                                    </div>
                                </div>
                            </div>
                            <!--<b-card class="background-info"
                                    overlay
                                    :img-src="require('../../../assets/images/landing/cloudone_console_sign-in_bg&#45;&#45;sm.svg')">
                                <b-card-body class="right-info-card-body">

                                </b-card-body>
                            </b-card>-->
                            <!--<b-card no-body class="text-white bg-primary" style="width:44%;">

                            </b-card>-->
                        </b-card-group>
                    </b-col>
                </b-row>
            </div>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import url from 'url';
import BaseSimpleModal from '@/components/base/modal/BaseSimpleModal';

const signupContents = 'We apologize for inconvenience. \'Sign up\', \'Password retrieval\' feature currently unavailable due to our policies.'
        + ' Please, contact System Administrator for following contacts: ' + '<br>'
        + '● e-mail: admin@mz.co.kr';
export default {
    name: 'LocalSignIn',
    components: {
        BaseSimpleModal,
    },
    data() {
        return {
            instructionContents: signupContents,
            rememberStatus: false,
            seenGreet: true,
            seenError: false,
            userId: 'admin',
            password: 'admin',
        };
    },
    computed: {
        ...mapGetters('auth', [
            'nextPath',
        ]),
        getGreetMessage() {
            const GreetingMsg = this.$store.getters['auth/greetDesc'];
            return !this.isEmpty(GreetingMsg) ? GreetingMsg : '';
        },
        getCurrentHostname() {
            const hostName = url.parse(window.location.href).host;
            return hostName.substring(0, hostName.indexOf('.')).toUpperCase();
        },
    },
    mounted() {
        this.isRemembered();
    },
    methods: {
        async directToAdmin() {
            this.$router.push({ name: 'Admin-SignIn' });
            this.$router.push({ path: '/admin-sign-in' });
        },
        async signIn() {
            this.showGreetMSG();
            const credentials = {
                user_id: this.userId,
                password: this.password,
            };

            if (this.isEmpty(credentials.user_id) || this.isEmpty(credentials.password)) {
                this.showErorrMSG();
                return;
            }

            await this.$store.dispatch('auth/signIn', credentials).then((response) => {
                if (localStorage.getItem('common.nextPath') === '/sign-in') {
                    localStorage.setItem('common.nextPath', '/');
                }
                this.$router.push({ path: localStorage.getItem('common.nextPath') });
            }).catch((error) => {
                if (error.message) {
                    try {
                        const errorConfig = JSON.parse(error.message);
                        const errorCode = errorConfig.error_code;
                        const errorMSG = errorConfig.error_dt_code;
                        if (errorMSG === 'ERROR_NOT_FOUND' && errorCode === 400) {
                            this.showErorrMSG();
                        }
                    } catch (e) {
                        return false;
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
        isRemembered() {
            localStorage.checkbox = (localStorage.checkbox === 'true');
            if (localStorage && !this.isEmpty(localStorage.userId)) {
                this.rememberStatus = true;
                this.userId = localStorage.userId;
            } else {
                this.rememberStatus = false;
                this.userId = '';
            }
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
        },
        async setTimeZone() {
            await this.$http.post('identity/user/get', {
                user_id: this.userId,
                domainId: sessionStorage.getItem('domainId'),
            }).then((response) => {
                const timeZone = this.isEmpty(response.data.timezone) ? 'Etc/GMT' : response.data.timezone;
                localStorage.timeZone = timeZone;
            }).catch(() => {
                this.showErorrMSG(setTimeout(() => this.showGreetMSG(), 3000));
            });
        },
    },
};
</script>

<style lang="scss" scoped>
    @import '../../../styles/css/slideShow.css';

    .background-cover {
        height: 100vh;
        width: 100vw;
        background-position: center bottom;
        background-size: cover;
        background-image: url("../../../assets/images/landing/cloudone_console_sign-in_bg.jpg");
    }

    .card-right-container {
        border: none;
        > img {
            border-top-right-radius: 7px;
            border-bottom-right-radius: 7px;
        }
    }

    span.root-sign:hover {
        text-decoration: underline;
        cursor: pointer
    }
    .root-sign {
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
        background: linear-gradient(to right, $blue, $violet);
        box-shadow: 0 0 5px 1px rgba($navy, 0.3);
        color: $white;
        &:hover {
            color: $white;
        }
    }
</style>
