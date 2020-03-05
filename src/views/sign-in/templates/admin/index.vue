<template>
    <div class="user-info">
        <p v-if="!loginFail" class="subtitle">
            Welcome to SPACEONE Console
        </p>
        <p v-else-if="loginFail" id="errorMsg" class="subtitle">
            Please Confirm your ID or Password.
        </p>
        <div id="login-info" class="field-group text-left md:flex md:flex-wrap md:justify-between">
            <div class="form">
                <div class="flex flex-col md:w-full form">
                    <p class="input-title">
                        Admin User ID
                    </p>
                    <PFieldGroup :invalid-text="invalidMsg.userId" :invalid="invalidState.userId">
                        <template #default="{invalid}">
                            <p-text-input
                                v-model="userId"
                                placeholder="User ID"
                                class="w-full"
                                :class="{
                                    'is-invalid':invalid
                                }"
                                @input="checkUserId"
                            />
                        </template>
                    </PFieldGroup>
                </div>
                <div class="flex flex-col mb-4 md:w-full form">
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
                                :class="{
                                    'is-invalid':invalid
                                }"
                                @input="checkPassword"
                                @keyup.enter="login"
                            />
                        </template>
                    </PFieldGroup>
                </div>
            </div>
        </div>
        <div class="flex flex-col mb-10 md:w-full">
            <p-button style-type="primary" type="submit" size="lg"
                      @click="login"
            >
                Login
            </p-button>
        </div>
    </div>
</template>

<script lang="ts">
import {
    defineComponent, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import PButton from '@/components/atoms/buttons/Button.vue';
import PTextInput from '@/components/atoms/inputs/TextInput.vue';
import PFieldGroup from '@/components/molecules/forms/field-group/FieldGroup.vue';
import {
    formValidation,
    lengthMaxValidation,
    lengthMinValidation,
    requiredValidation,
    userIDValidation,
    Validation,
} from '@/lib/compostion-util';

export default defineComponent({
    name: 'Admin',
    components: {
        PButton,
        PTextInput,
        PFieldGroup,
    },
    setup(props, context) {
        const vm = getCurrentInstance() as any;
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
                const response = await vm.$http.post('/identity/token/issue', {
                    credentials: {
                        // eslint-disable-next-line camelcase
                        user_type: 'DOMAIN_OWNER',
                        // eslint-disable-next-line camelcase
                        user_id: state.userId,
                        password: state.password,
                    },
                    domain_id: vm.$ls.domain.state.domainId,
                }, { skipAuthRefresh: true }).catch(() => {
                    state.loginFail = true;
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
        padding-bottom: 24px;
    }

    #errorMsg {
        color: red;
    }

    .w-full {
        width: 22rem;
    }
</style>
