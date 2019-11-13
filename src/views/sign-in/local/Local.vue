<template>
    <div class="background-cover">
        <div class="row">
            <div class="container fade-in">
                <div class="row d-flex justify-content-center">
                    <div class="col-md-8">
                        <div class="card-group">
                            <div class="card col-7 card-left-container">
                                <div class="signIn-title">
                                    {{ $t('COMMON.SIGN_IN') }}
                                </div>
                                <div v-show.visible="seenGreet" class="signIn-sub-title">
                                    {{ $t('COMMON.SIGN_IN_MSG') }}
                                </div>
                                <div v-show.visible="seenError" class="signIn-sub-title">
                                    <div class="sign-in-alert">
                                        {{ $t('COMMON.SIGN_FAIL_BODY') }}
                                    </div>
                                </div>
                                <form class="form-binder">
                                    <div class="form-group">
                                        <p-label class="input-title">
                                            User ID
                                        </p-label>
                                        <input v-model="userId" class="form-control input-content is-invalid"
                                               type="text"
                                               placeholder="  user ID"
                                               @keyup.enter="signIn"
                                               required
                                        ><!--<div class="invalid-feedback">
                                        User ID is Required field
                                    </div>-->
                                    </div>
                                    <div class="form-group">
                                        <p-label class="input-title">
                                            Password
                                        </p-label>
                                        <input v-model="password" type="password" class="form-control input-content is-invalid"
                                               placeholder="  password"
                                               @keyup.enter="signIn"
                                               required
                                        ><!--<div class="invalid-feedback">
                                        User ID is Required field
                                    </div>-->
                                    </div>
                                    <div class="row">
                                        <b-col class="col-11 col-xs-11 col-sm-11 col-md-10 col-lg-12 col-xl-12">
                                            <div @click="directToAdmin">
                                                <span class="root-sign">{{ $t('SIGNIN.ROOT_CREDENTIALS') }}</span>
                                            </div>
                                        </b-col>
                                    </div>
                                    <div class="row mt-3">
                                        <div class="col-md-4 ml-auto col-xs-12 col-sm-12">
                                            <b-button type="button" block class="signIn-btn"
                                                      @click="signIn"
                                            >
                                                {{ $t('COMMON.SIGN_IN') }}
                                            </b-button>

                                            <!--<p-button style="display: inline-block;"
                                                      :style-type="'primary'"
                                                      :size="'md'"
                                                      @click="signIn"
                                            >
                                                {{ $t('COMMON.SIGN_IN') }}
                                            </p-button>-->
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div class="card card-right-container">
                                <img class="card-img" src="@/assets/images/landing/cloudone_console_sign-in_bg--sm.svg" alt="Bologna">
                                <div class="card-img-overlay text-white d-flex flex-column justify-content-center">
                                    <div class="text-center">
                                        <p style="margin-bottom: 10px">
                                            <img src="@/assets/images/brand/dcos.png" width="100vh" height="100vh">
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
import { mapGetters } from 'vuex';
import url from 'url';

import PLabel from '@/components/atoms/labels/Label';
import PButton from '@/components/atoms/buttons/Button';


export default {
    name: 'LocalSignIn',
    components: {
        PLabel,
        PButton,
    },
    data() {
        return {
            rememberStatus: false,
            seenGreet: true,
            seenError: false,
            userId: '',
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
                console.log(localStorage.getItem('common.toNextPath'));
                if (localStorage.getItem('common.toNextPath') === '/sign-in' || localStorage.getItem('common.toNextPath') === null) {
                    localStorage.setItem('common.toNextPath', '/');
                }
                this.$router.push({ path: localStorage.getItem('common.toNextPath') });
            }).catch((error) => {
                this.showErorrMSG();
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

    .card-left-container {
        padding: 1.5rem;
    }

    .card-right-container {
        border: none;
        background: transparent linear-gradient(220deg, #5541B0 0%, #5A55AA00 100%) 0% 0% no-repeat padding-box;
        opacity: 1;
        > img {
            border-radius: 0;
            border-top-right-radius: 7px;
            border-bottom-right-radius: 7px;
        }
    }

    .form-binder {
        margin-top: 1.5rem;
    }

    .input-title {
        background: #FFFFFF 0% 0% no-repeat padding-box;
        box-shadow: 0px 0px 8px #4D49B614;
        opacity: 1;
    }
    .input-content {
        background: #FFFFFF 0% 0% no-repeat padding-box;
        border: 1px solid $gray2;
        border-radius: 2px;
        opacity: 1;
    }

    span.root-sign:hover {
        text-decoration: underline;
        cursor: pointer
    }

    .root-sign {
        text-align: left;
        text-decoration: underline;
        font: Regular 14px/16px Arial;
        letter-spacing: 0;
        color: #8185D1;
        opacity: 1;
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
</style>


<p-button style="display: inline-block;"
          :style-type="'primary'"
          :size="'md'"
          @click="signIn"
>
    {{ $t('COMMON.SIGN_IN') }}
</p-button>
