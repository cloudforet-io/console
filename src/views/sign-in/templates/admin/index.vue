<template>
    <div class="user-info">
        <div id="login-info" class="field-group text-left mb-4 md:flex md:flex-wrap md:justify-between">
            <p class="input-title">
                Admin User ID
            </p>
            <div class="flex flex-col mb-4 md:w-full">
                <p-text-input
                    v-model="userId"
                    class="form-control"
                    placeholder="User ID"
                    required
                />
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
        <div class="flex flex-col mb-3 md:w-full">
            <p-button style-type="primary"
                      type="submit"
                      size="lg"
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

export default defineComponent({
    name: 'Admin',
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
            console.debug('start admin login');
            const response = await vm.$http.post('/identity/token/issue', {
                credentials: {
                    // eslint-disable-next-line camelcase
                    user_type: 'DOMAIN_OWNER',
                    // eslint-disable-next-line camelcase
                    user_id: state.userId,
                    password: state.password,
                },
                domain_id: vm.$ls.domain.state.domainId,
            });
            context.emit('onLogin', state.userId, response.data);
        };
        const goToSignIn = () => {
            vm.$router.push({ name: 'Login' });
        };
        return {
            ...toRefs(state),
            login,
            goToSignIn,
        };
    },
});
</script>

<style lang="postcss" scoped>
    .input-title {
        font-size: 0.875rem;
        font-weight: bold;
    }
</style>
