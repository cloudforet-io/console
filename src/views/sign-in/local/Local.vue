<template>
    <div class="background-cover">
        <div class="row">
            <div class="container fade-in">
                <div class="row d-flex justify-content-center">
                    <div class="col-md-8">
                        <div class="card-group">
                            <div class="card col-7 card-left-container">
                                <div class="signIn-title">
                                    {{ $t('SIGNIN.SIGN_IN') }}
                                </div>
                                <div v-show.visible="greeting" class="signIn-sub-title">
                                    {{ $t('SIGNIN.SIGN_IN_MSG') }}
                                </div>
                                <div v-show.visible="!greeting" class="signIn-sub-title">
                                    <div class="sign-in-alert">
                                        {{ $t('SIGNIN.SIGN_FAIL_BODY') }}
                                    </div>
                                </div>
                                <form class="form-binder novalidate">
                                    <div class="form-group">
                                        <p-label class="input-title">
                                            User ID
                                        </p-label>
                                        <p-text-input ref="userId" v-model="userId"
                                                      :style="{'border': `${getIsInvalidUser}`, 'boxShadow': 'none' } "
                                                      class="form-control"
                                                      type="text"
                                                      placeholder="  User ID"
                                                      required
                                                      @keyup="removeCSS('userId')"
                                                      @keyup.enter="signIn"
                                        />
                                        <div v-show="validatorUser" style="display:block" class="invalid-feedback">
                                            * {{ $t('SIGNIN.USER_EMPTY') }}
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <p-label class="input-title">
                                            Password
                                        </p-label>
                                        <p-text-input ref="password" v-model="password" type="password"
                                                      :style="{'border': `${getIsInvalidPassword}`, 'boxShadow': 'none' } "
                                                      class="form-control"
                                                      placeholder="  Password"
                                                      required
                                                      @keyup="removeCSS('password')"
                                                      @keyup.enter="signIn"
                                        />
                                        <div v-show="validatorPassword" style="display:block" class="invalid-feedback">
                                            * {{ $t('SIGNIN.PASS_EMPTY') }}
                                        </div>
                                    </div>
                                    <div class="row mt-3">
                                        <div class="col-md-12 col-xs-12 col-sm-12">
                                            <p-button class="button-cover btn-lg"
                                                      :size="'lg'"

                                                      :style-type="'primary'"
                                                      @click="signIn"
                                            >
                                                {{ $t('SIGNIN.SIGN_IN') }}
                                            </p-button>
                                        </div>
                                    </div>
                                    <div class="row mt-4">
                                        <b-col class="col-11 col-xs-11 col-sm-11 col-md-10 col-lg-12 col-xl-12">
                                            <div @click="directToAdmin">
                                                <span class="root-sign">{{ $t('SIGNIN.ROOT_CREDENTIALS') }}</span>
                                            </div>
                                        </b-col>
                                    </div>
                                </form>
                            </div>
                            <div class="card card-right-container">
                                <img class="card-img" src="@/assets/images/landing/cloudone_console_sign-in_bg--sm.svg" alt="Bologna">
                                <div class="card-img-overlay text-white d-flex flex-column justify-content-center">
                                    <div class="text-center">
                                        <p style="margin-bottom: 10px">
                                            <img src="@/assets/images/brand/brand_logo.png" width="100vh" height="100vh">
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
import PTextInput from '@/components/atoms/inputs/TextInput';

export default {
    name: 'LocalSignIn',
    components: {
        PLabel,
        PButton,
        PTextInput,
    },
    data() {
        return {
            rememberStatus: false,
            greeting: true,
            userId: '',
            password: '',
            styler: {
                border: '1px solid #EF3817',
            },
            validator: {
                userId: false,
                password: false,
            },
            isInvalid: {
                userId: false,
                password: false,
            },
        };
    },
    computed: {
        ...mapGetters('auth', [
            'nextPath',
        ]),
        validatorUser() {
            return this.validator.userId;
        },
        validatorPassword() {
            return this.validator.password;
        },
        getIsInvalidUser() {
            return this.isInvalid.userId ? this.styler.border : '';
        },
        getIsInvalidPassword() {
            return this.isInvalid.password ? this.styler.border : '';
        },
        getGreetMessage() {
            const companyTitle = this.$store.getters['domain/companyTitle'];
            const companyDesc = this.$store.getters['domain/description'];
            const hostName = this.getWindowHostName();
            return !this.isEmpty(companyTitle) ? companyDesc: !this.isEmpty(companyTitle) ? this.tr('SIGNIN.WELCOME_MSG_P', [companyTitle]) : this.tr('SIGNIN.WELCOME_MSG_P', [hostName]);
            /*return !this.isEmpty(companyTitle) ? this.tr('SIGNIN.WELCOME_MSG', [companyDesc]) : !this.isEmpty(companyTitle) ? this.tr('SIGNIN.WELCOME_MSG_P', [companyTitle]) : this.tr('SIGNIN.WELCOME_MSG_P', [hostName]);*/
        },
        getCurrentHostname() {
            const companyTitle = this.$store.getters['domain/companyTitle'];
            const hostName = this.getWindowHostName();
            return !this.isEmpty(companyTitle) ? companyTitle : hostName;
        },
    },
    methods: {
        getWindowHostName() {
            const hostName = url.parse(window.location.href).host;
            return hostName.substring(0, hostName.indexOf('.')).toUpperCase();
        },
        removeCSS(type) {
            this.validator[type] = false;
            this.isInvalid[type] = false;
        },
        validateInput(param, key) {
            const _key = _.camelCase(key);
            if (this.isEmpty(param[_key])) {
                this.validator[_key] = true;
                this.isInvalid[_key] = true;
                this.$refs[_key].focus();
            }
        },
        async directToAdmin() {
            this.$router.push({ name: 'Admin-SignIn' });
            this.$router.push({ path: '/admin-sign-in' });
        },

        async signIn() {
            this.displayGreetingMSG(true);
            const credentials = {
                user_id: this.userId,
                password: this.password,
            };

            if (this.isEmpty(credentials.user_id) || this.isEmpty(credentials.password)) {
                this.validateInput(credentials, 'user_id');
                this.validateInput(credentials, 'password');
                return;
            }

            await this.$store.dispatch('auth/signIn', credentials).then(() => {
                if (localStorage.getItem('common.toNextPath') === '/sign-in' || localStorage.getItem('common.toNextPath') === null) {
                    localStorage.setItem('common.toNextPath', '/');
                }
                this.$router.push({ path: localStorage.getItem('common.toNextPath') });
            }).catch((error) => {
                this.isInvalid.userId = true;
                this.isInvalid.password = true;
                this.$refs.userId.focus();
                this.displayGreetingMSG(false);
            });
        },
        displayGreetingMSG(flag) {
            this.greeting = flag;
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

    .card-right-container {
        border: none;
        background:  $primary;
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
        text-align: left;
        font: Bold 14px/28px Arial;
        letter-spacing: 0;
        color: $dark;
        margin-bottom: 0px;
    }

    .input-content {
        background: #FFFFFF 0% 0% no-repeat padding-box;
        border: 1px solid $gray2;
        border-radius: 2px;
        opacity: 1;
    }

    .input-alert {
        background: #FFFFFF 0% 0% no-repeat padding-box;
        border: 1px solid #EF3817;
        border-radius: 2px;
    }

    .root-sign {
        text-align: left;
        font: Regular 14px/16px Arial;
        letter-spacing: 0;
        color: #8185D1;
        opacity: 1;
    }

    span.root-sign:hover {
        text-decoration: underline;
        cursor: pointer
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
        .form-control-alert{
            border: 1px solid $alert;
            box-shadow: unset;
        }

    }

    .button-cover{
        width: 50%;
        display: inline-block;
        text-align: center;
        float: left;
        font: 16px/18px Arial;
        letter-spacing: 0;
        color: #FFFFFF;
        opacity: 1;
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
