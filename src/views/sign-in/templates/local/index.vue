<template>
    <div class="user-info">
        <div id="login-info" class="field-group text-left md:flex md:flex-wrap md:justify-between">
            <div class="form">
                <div class="flex flex-col md:w-full form">
                    <p class="input-title">
                        User ID
                    </p>
                    <PFieldGroup
                        :invalid-text="invalidMsg.user_id"
                        :invalid="invalidState.user_id"
                    >
                        <template #default="{invalid}">
                            <p-text-input
                                v-model="userId"
                                placeholder="User ID"
                                :class="{
                                    'form-control':true,
                                    'is-invalid':invalid
                                }"
                            />
                        </template>
                    </PFieldGroup>
                </div>
                <div class="flex flex-col mb-4 md:w-full form">
                    <p class="input-title">
                        Password
                    </p>
                    <PFieldGroup
                        :invalid-text="invalidMsg.password"
                        :invalid="invalidState.password"
                    >
                        <template v-slot:default="{invalid}">
                            <p-text-input
                                v-model="password"
                                type="password"
                                placeholder="Password"
                                :class="{
                                    'form-control':true,
                                    'is-invalid':invalid
                                }"
                            />
                        </template>
                    </PFieldGroup>
                </div>
            </div>
        </div>
        <div class="flex flex-col mb-10 md:w-full">
            <p-button style-type="primary"
                      type="submit"
                      size="lg"
                      @click="login"
            >
                Login
            </p-button>
        </div>
        <div class="btn-divider">
            OR
        </div>
        <div class="flex flex-col mb-4 md:w-full">
            <p-button outline
                      style-type="gray"
                      type="submit"
                      size="lg"
                      @click="goToAdmin"
            >
                Sign-in using root account credentials
            </p-button>
        </div>
    </div>
</template>

<script lang="ts">
import {
    getCurrentInstance, reactive, toRefs, defineComponent,
} from '@vue/composition-api';
import PButton from '@/components/atoms/buttons/Button.vue';
import PTextInput from '@/components/atoms/inputs/TextInput.vue';
import PFieldGroup from '@/components/molecules/forms/field-group/FieldGroup.vue';
import {
    formValidation, lengthMaxValidation, lengthMinValidation,
    requiredValidation,
    userIDValidation,
    Validation,
} from '@/lib/compostion-util';

export default defineComponent({
    name: 'Local',
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
        });

        const requireFieldValidations = {
            userId: [requiredValidation('Please enter user ID')], // user_id여야 적용
            password: [requiredValidation('Please enter password')],
        };
        const validateAPI = formValidation(state, requireFieldValidations);

        const login = async () => {
            console.log('start login');
            const data = {};
            const result = await validateAPI.allValidation();
            if (result) {
                const response = await vm.$http.post('/identity/token/issue', {
                    credentials: {
                        // eslint-disable-next-line camelcase
                        user_type: 'USER',
                        // eslint-disable-next-line camelcase
                        user_id: state.userId,
                        password: state.password,
                    },
                    domain_id: vm.$ls.domain.state.domainId,
                });

                ['userId', 'password'].forEach((key) => {
                    if (state[key]) {
                        data[key] = state[key];
                    }
                });

                context.emit('onLogin', state.userId, response.data);
            }
        };
        const goToAdmin = () => {
            vm.$router.push({ name: 'AdminLogin' });
        };
        return {
            ...toRefs(state),
            ...validateAPI,
            login,
            goToAdmin,
        };
    },
});
</script>

<style lang="postcss" scoped>
    .input-title {
        font-size: 0.875rem;
        font-weight: bold;
        padding: 4px;
    }

    .btn-divider {
        display: flex;
        flex-basis: 100%;
        align-items: center;
        color: #DCDDE2;
        font-style: normal;
        font-weight: bold;
        font-size: 14px;
        /*padding-top: 41px;*/
        margin-bottom: 1.5rem;
    }
    .btn-divider::before,
    .btn-divider::after {
        content: "";
        flex-grow: 1;
        background: #DCDDE2;
        height: 1px;
        font-size: 0px;
        line-height: 0px;
        margin: 0px 8px;
    }
</style>
