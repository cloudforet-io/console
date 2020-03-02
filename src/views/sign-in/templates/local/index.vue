<template>
    <div class="user-info">
        <div id="login-info" class="field-group text-left mb-4 md:flex md:flex-wrap md:justify-between">
            <p class="input-title">
                User ID
            </p>
            <div class="flex flex-col mb-4 md:w-full">
                <p-text-input
                    v-model="userId"
                    class="form-control"
                    placeholder="User ID"
                    required
                /><br>
            </div>
            <p class="input-title">
                Password
            </p>
            <div class="flex flex-col mb-4 md:w-full">
                <p-text-input
                    v-model="password"
                    type="password"
                    class="form-control"
                    placeholder="Password"
                    required
                />
            </div>
        </div>
        <div class="flex flex-col mb-4 md:w-full">
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
import { getCurrentInstance, reactive, toRefs } from '@vue/composition-api';
import PButton from '@/components/atoms/buttons/Button.vue';
import PTextInput from '@/components/atoms/inputs/TextInput.vue';

export default {
    name: 'Local',
    components: {
        PButton,
        PTextInput,
    },
    setup(props, context) {
        const vm = getCurrentInstance() as any;
        const state = reactive({
            userId: '',
            password: '',
        });
        const login = async () => {
            console.log('start login');
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
            context.emit('onLogin', state.userId, response.data);
        };
        const goToAdmin = () => {
            vm.$router.push({ name: 'AdminLogin' });
        };
        return {
            ...toRefs(state),
            login,
            goToAdmin,
        };
    },
};
</script>

<style lang="postcss" scoped>
    .input-title {
        font-size: 0.875rem;
        font-weight: bold;
        padding-top: 16px;
        padding-bottom: 4px;
    }

    .btn-divider {
        display: flex;
        flex-basis: 100%;
        align-items: center;
        color: #A5ACCE;
        font-style: normal;
        font-weight: bold;
        font-size: 14px;
        margin: 8px 0px;
    }
    .btn-divider::before,
    .btn-divider::after {
        content: "";
        flex-grow: 1;
        background: #A5ACCE;
        height: 1px;
        font-size: 0px;
        line-height: 0px;
        margin: 0px 16px;
    }
</style>
