<template>
    <div class="user-info">
        <p v-if="!loginFail" class="subtitle">
            Multicloud Managed Service
        </p>
        <p v-else-if="loginFail" id="errorMsg" class="subtitle">
            Please Confirm your ID or Password.
        </p>
        <div id="login-info" class="field-group text-left md:flex md:flex-wrap md:justify-between">
            <form class="form w-full">
                <div class="flex flex-col form">
                    <p class="input-title">
                        Admin ID
                    </p>
                    <PFieldGroup :invalid-text="invalidMsg.userId" :invalid="invalidState.userId">
                        <template #default="{invalid}">
                            <p-text-input
                                v-model="userId"
                                placeholder="Admin ID"
                                class="w-full"
                                autocomplete="username"
                                :class="{
                                    'is-invalid':invalid
                                }"
                                @input="checkUserId"
                            />
                        </template>
                    </PFieldGroup>
                </div>
                <div class="flex flex-col mb-4 md:w-full">
                    <p class="input-title">
                        Password
                    </p>
                    <PFieldGroup :invalid-text="invalidMsg.password" :invalid="invalidState.password">
                        <template v-slot:default="{invalid}">
                            <p-text-input
                                v-model="password"
                                type="password"
                                class="w-full"
                                placeholder="Password"
                                autocomplete="current-password"
                                :class="{
                                    'is-invalid':invalid
                                }"
                                @input="checkPassword"
                                @keyup.enter="login"
                            />
                        </template>
                    </PFieldGroup>
                </div>
            </form>
        </div>
        <div class="flex flex-col mb-4 md:w-full">
            <p-button style-type="primary" type="submit" size="lg"
                      @click="login"
            >
                <span id="button-msg">Admin Sign in</span>
            </p-button>
        </div>
    </div>
</template>

<script lang="ts">
import {
    defineComponent, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import PButton from '@/components/atoms/buttons/PButton.vue';
import PTextInput from '@/components/atoms/inputs/PTextInput.vue';
import PFieldGroup from '@/components/molecules/forms/field-group/FieldGroup.vue';
import {
    formValidation,
    requiredValidation,
} from '@/lib/compostion-util';
import { useStore } from '@/store/toolset';

export default defineComponent({
    name: 'Admin',
    components: {
        PButton,
        PTextInput,
        PFieldGroup,
    },
    setup(props, context) {
        const vm = getCurrentInstance() as any;
        const store = useStore();
        const state = reactive({
            userId: '',
            password: '',
            loginFail: false,
        });
        const requireFieldValidations = {
            userId: [requiredValidation('Please enter user ID')],
            password: [requiredValidation('Please enter password')],
        };
        const validateAPI = formValidation(state, requireFieldValidations);
        const checkUserId = async () => {
            const result = await validateAPI.fieldValidation('userId');
            return result;
        };
        const checkPassword = async () => {
            const result = await validateAPI.fieldValidation('password');
            return result;
        };
        const login = async () => {
            state.loginFail = false;
            const data = {};
            const result = await validateAPI.allValidation();
            if (result) {
                await vm.$store.dispatch('user/signIn', {
                    domain_id: vm.$store.state.domain.domainId,
                    credentials: {
                        // eslint-disable-next-line camelcase
                        user_type: 'DOMAIN_OWNER',
                        // eslint-disable-next-line camelcase
                        user_id: state.userId,
                        password: state.password,
                    },
                }).catch(() => {
                    state.loginFail = true;
                    state.password = '';
                });

                const response = await vm.$http.post('/identity/token/issue', {
                    credentials: {
                        // eslint-disable-next-line camelcase
                        user_type: 'DOMAIN_OWNER',
                        // eslint-disable-next-line camelcase
                        user_id: state.userId,
                        password: state.password,
                    },
                    domain_id: store.domain.state.domainId,
                }, { skipAuthRefresh: true }).catch(() => {
                    state.loginFail = true;
                    state.password = '';
                });
                ['userId', 'password'].forEach((key) => {
                    if (state[key]) {
                        data[key] = state[key];
                    }
                });
                context.emit('onLogin', state.userId, response.data);
            }
        };
        const goToSignIn = () => {
            vm.$router.push({ name: 'Login' });
        };
        return {
            ...toRefs(state),
            ...validateAPI,
            login,
            goToSignIn,
            checkUserId,
            checkPassword,
        };
    },
});
</script>

<style lang="postcss" scoped>
    .input-title {
        font-size: 0.875rem;
        font-weight: bold;
        padding-bottom: 0.25rem;
    }
    .subtitle {
        padding-top: 0.5rem;
        font-weight: normal;
        font-size: 0.875rem;
        padding-bottom: 1.5rem;
    }

    #errorMsg {
        color: red;
    }

    .user-info {
        @screen md {
            min-width: 18rem;
        }
    }

    #button-msg {
        font-size: 0.875rem;
    }

</style>
