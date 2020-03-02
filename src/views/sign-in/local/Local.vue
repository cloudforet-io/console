<template>
    <div class="background-cover">
        <div class="flex flex-wrap">
            <div class="container mx-auto">
                <div class="flex flex-wrap flex justify-content-center">
                    <div class="md:w-2/3 pr-4 pl-4">
                        <div class="flex flex-col">
                            <div class="relative flex flex-col min-w-0 rounded break-words border bg-white border-1 border-grey-light w-3/5 card-left-container">
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
                                <div class="form-binder novalidate">
                                    <div class="mb-4">
                                        <p-label class="input-title">
                                            User ID
                                        </p-label>
                                        <p-text-input ref="userId" v-model="userId"
                                                      autocomplete="on"
                                                      :style="{'border': `${getIsInvalidUser}`, 'boxShadow': 'none' } "
                                                      class="block appearance-none w-full mb-1 text-base px-2 leading-normal bg-white text-grey-darker border border-grey rounded-sm"
                                                      type="text"
                                                      placeholder="User ID"
                                                      required
                                                      @keyup="removeCSS('userId')"
                                                      @keyup.enter="signIn"
                                        />
                                        <div v-show="validatorUser" style="display:block" class="invalid-feedback">
                                            * {{ $t('SIGNIN.USER_EMPTY') }}
                                        </div>
                                    </div>
                                    <div class="mb-4">
                                        <p-label class="input-title">
                                            Password
                                        </p-label>
                                        <p-text-input ref="password" v-model="password" type="password"
                                                      autocomplete="on"
                                                      :style="{'border': `${getIsInvalidPassword}`, 'boxShadow': 'none' } "
                                                      class="block appearance-none w-full mb-1 text-base px-2 leading-normal bg-white text-grey-darker border border-grey rounded-sm"
                                                      placeholder="Password"
                                                      required
                                                      @keyup="removeCSS('password')"
                                                      @keyup.enter="signIn"
                                        />
                                        <div v-show="validatorPassword" style="display:block" class="invalid-feedback">
                                            * {{ $t('SIGNIN.PASS_EMPTY') }}
                                        </div>
                                    </div>
                                    <div class="flex flex-wrap mt-3">
                                        <div class="md:w-1/6 pr-4 pl-42 sm:w-1/6 pr-4 pl-42 sm:w-1/6 pr-4 pl-42">
                                            <p-button class="py-3 px-4 text-xl leading-tight"
                                                      size="lg"
                                                      style-type="primary"
                                                      @click="signIn"
                                            >
                                                {{ $t('SIGNIN.SIGN_IN') }}
                                            </p-button>
                                        </div>
                                    </div>
                                    <div class="flex flex-wrap mt-4">
                                        <b-col class="w-1/61 sm:w-1/6 pr-4 pl-41 sm:w-1/6 pr-4 pl-41 md:w-1/6 pr-4 pl-40 lg:w-1/6 pr-4 pl-42 xl:w-1/6 pr-4 pl-42">
                                            <div @click="directToAdmin">
                                                <span class="root-sign">{{ $t('SIGNIN.ROOT_CREDENTIALS') }}</span>
                                            </div>
                                        </b-col>
                                    </div>
                                </div>
                            </div>
                            <div class="relative flex flex-col min-w-0 rounded break-words border bg-white border-1 border-grey-light card-right-container">
                                <img class="w-full rounded" src="@/assets/images/landing/cloudone_console_sign-in_bg--sm.svg" alt="Bologna">
                                <div class="absolute pin-y pin-x p-6 text-white flex flex-column justify-content-center">
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
import url from 'url';
import _ from 'lodash';
import PLabel from '@/components/atoms/labels/Label.vue';
import PButton from '@/components/atoms/buttons/Button.vue';
import PTextInput from '@/components/atoms/inputs/TextInput.vue';

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
            return !this.isEmpty(companyTitle) ? companyDesc : !this.isEmpty(companyTitle) ? this.$t('SIGNIN.WELCOME_MSG_P', [companyTitle]) : this.$t('SIGNIN.WELCOME_MSG_P', [hostName]);
        },
        getCurrentHostname() {
            const companyTitle = this.$store.getters['domain/companyTitle'];
            const hostName = this.getWindowHostName();
            return !this.isEmpty(companyTitle) ? companyTitle : hostName;
        },
    },
    mounted() {
        this.$refs.userId.focus();
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
            }).catch(() => {
                console.log('error');
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
        background-image: url("~@/assets/images/landing/cloudone_console_sign-in_bg.jpg");
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

    .signIn-btn {
        border: 0;
        background: $primary;
        color: $white;
        &:hover {
            color: $white;
        }
    }

</style>
