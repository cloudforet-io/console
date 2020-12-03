<template>
    <div class="user-info">
        <div id="sign-in-info" class="field-group text-left ">
            <form class="form">
                <div class="flex flex-col w-full">
                    <p class="input-title">
                        {{ $t('COMMON.SIGN_IN.USER_ID') }}
                    </p>
                    <PFieldGroup :invalid-text="invalidMsg.userId" :invalid="invalidState.userId">
                        <template #default="{invalid}">
                            <p-text-input
                                v-model="userId"
                                placeholder="User ID"
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
                <div class="flex flex-col mb-4 w-full">
                    <p class="input-title">
                        {{ $t('COMMON.SIGN_IN.PASSWORD') }}
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
                                @keyup.enter="signIn"
                            />
                        </template>
                    </PFieldGroup>
                </div>
            </form>
        </div>
        <div class="flex flex-col mb-10 md:w-full">
            <p-button style-type="primary" type="submit" size="lg"
                      @click="signIn"
            >
                {{ $t('COMMON.SIGN_IN.SIGN_IN') }}
            </p-button>
        </div>
        <div class="btn-divider">
            <span>{{ $t('COMMON.SIGN_IN.OR') }}</span>
        </div>
        <div class="flex flex-col mb-4 w-full">
            <p-button
                :outline="true"
                style-type="gray"
                type="submit"
                size="lg"
                @click="goToAdminSignIn"
            >
                {{ $t('COMMON.SIGN_IN.ROOT_ACCOUNT') }}
            </p-button>
        </div>
    </div>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import {
    getCurrentInstance,
    reactive,
    toRefs,
    defineComponent, ComponentRenderProxy,
} from '@vue/composition-api';
import PButton from '@/components/atoms/buttons/PButton.vue';
import PTextInput from '@/components/atoms/inputs/PTextInput.vue';
import PFieldGroup from '@/components/molecules/forms/field-group/PFieldGroup.vue';
import {
    formValidation,
    requiredValidation,
} from '@/lib/compostion-util';

export default defineComponent({
    name: 'LocalSignIn',
    components: {
        PButton,
        PTextInput,
        PFieldGroup,
    },
    setup(props, context) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            userId: '',
            password: '',
        });
        const requireFieldValidations = {
            userId: [requiredValidation(vm.$t('COMMON.SIGN_IN.USER_ID_REQUIRED'))],
            password: [requiredValidation(vm.$t('COMMON.SIGN_IN.PASSWORD_REQUIRED'))],
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
        const signIn = async () => {
            const result = await validateAPI.allValidation();
            if (result) {
                const credentials = {
                    user_id: state.userId,
                    password: state.password,
                };
                context.emit('on-sign-in', credentials);
            }
        };
        const goToAdminSignIn = () => {
            context.emit('go-to-admin-sign-in');
        };
        return {
            ...toRefs(state),
            ...validateAPI,
            signIn,
            goToAdminSignIn,
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

.user-info {
    margin-top: 1.125rem;
    @screen md {
        min-width: 18rem;
    }
}

.btn-divider {
    @apply text-gray-200;
    display: flex;
    flex-basis: 100%;
    align-items: center;
    font-style: normal;
    font-weight: bold;
    font-size: 0.875rem;
    margin-bottom: 1em;
}
.btn-divider > span {
    margin: 0.5rem;
}
.btn-divider::before,
.btn-divider::after {
    @apply bg-gray-200;
    content: "";
    flex-grow: 1;
    height: 1px;
}
</style>
