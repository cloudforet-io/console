<template>
    <div class="background-cover">
        <div class="row">
            <div class="container fade-in">
                <div class="row d-flex justify-content-center">
                    <div class="col-md-8">
                        <div class="card-group">
                            <div class="card col-7 card-left-container">
                                <div class="signIn-title">
                                    {{ $t('COMMON.ADMIN_USER') }} {{ $t('COMMON.SIGN_IN') }}
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
                                        <p-text-input ref="userId" v-model="adminUserId"
                                                      :style="{'border': `${getIsInvalidUser}`, 'boxShadow': 'none' } "
                                                      class="form-control"
                                                      type="text"
                                                      placeholder="  user ID"
                                                      required
                                                      @keyup="removeCSS('userId')"
                                                      @keyup.enter="signIn"
                                        />
                                    </div>
                                    <div v-show="validatorUser" style="display:block" class="invalid-feedback">
                                        * {{ $t('SIGNIN.USER_EMPTY') }}
                                    </div>
                                    <div class="form-group">
                                        <p-label class="input-title">
                                            Password
                                        </p-label>
                                        <p-text-input ref="password" v-model="password" type="password"
                                                      :style="{'border': `${getIsInvalidPassword}`, 'boxShadow': 'none' } "
                                                      class="form-control"
                                                      placeholder="  password"
                                                      required
                                                      @keyup="removeCSS('password')"
                                                      @keyup.enter="signIn"
                                        />
                                        <div v-show="validatorPassword" style="display:block" class="invalid-feedback">
                                            * {{ $t('SIGNIN.PASS_EMPTY') }}
                                        </div>
                                    </div>
                                    <div class="row mt-4">
                                        <div class="col-md-12 col-xs-12 col-sm-12">
                                            <p-button class="button-cover"
                                                      :size="'lg'"
                                                      :style-type="'primary1'"
                                                      @click="signIn"
                                            >
                                                {{ $t('COMMON.SIGN_IN') }}
                                            </p-button>
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
                                        <p />
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
import PButton from '@/components/atoms/buttons/Button';
import PLabel from '@/components/atoms/labels/Label';
import PTextInput from '@/components/atoms/inputs/TextInput';

export default {
    components: {
        PButton,
        PLabel,
        PTextInput,
    },
    data() {
        return {
            adminRememberStatus: false,
            seenGreet: true,
            seenError: false,
            adminUserId: '',
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
        ...mapGetters('domain', [
            'authType',
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
        getCurrentHostname() {
            const hostName = url.parse(window.location.href).host;
            return hostName.substring(0, hostName.indexOf('.')).toUpperCase();
        },
    },
    methods: {
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
        async signIn() {
            this.showGreetMSG();
            const credentials = {
                user_id: this.adminUserId,
                password: this.password,
                user_type: 'DOMAIN_OWNER',
            };

            if (this.isEmpty(credentials.user_id) || this.isEmpty(credentials.password)) {
                this.validateInput(credentials, 'user_id');
                this.validateInput(credentials, 'password');
                return;
            }

            await this.$store.dispatch('auth/signIn', credentials).then(() => {
                this.$router.push({ path: '/' });
            }).catch((e) => {
                this.isInvalid.userId = true;
                this.isInvalid.password = true;
                this.$refs.userId.focus();
                this.showErorrMSG();
                console.log(e);
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
        background:  $primary1;
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
        text-align: left;
        font: Bold 14px/28px Arial;
        letter-spacing: 0;
        color: $dark;
        margin-bottom: 0px;
    }
    .form-control:focus{
        border-color: red;
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

    .button-cover{
        display: inline-block;
        text-align: center;
        float: right;
        font: 16px/18px Arial;
        letter-spacing: 0;
        color: #FFFFFF;
        opacity: 1;
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
