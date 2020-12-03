<template>
    <div class="user-info">
        <div id="sign-in-info" class="field-group text-left md:flex md:flex-wrap md:justify-between">
            <form class="form w-full">
                <div class="flex flex-col form">
                    <p class="input-title">
                        {{ $t('COMMON.SIGN_IN.ADMIN_ID') }}
                    </p>
                    <p-field-group :invalid-text="invalidMsg.userId" :invalid="invalidState.userId">
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
                    </p-field-group>
                </div>
                <div class="flex flex-col mb-9 md:w-full">
                    <p class="input-title">
                        {{ $t('COMMON.SIGN_IN.PASSWORD') }}
                    </p>
                    <p-field-group :invalid-text="invalidMsg.password" :invalid="invalidState.password">
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
                    </p-field-group>
                </div>
            </form>
        </div>
        <div class="flex flex-col md:w-full">
            <p-button style-type="primary" type="submit" size="lg"
                      class="mb-8" @click="signIn"
            >
                <span id="button-msg">{{ $t('COMMON.SIGN_IN.ADMIN_SIGN_IN') }}</span>
            </p-button>
            <span class="user-sign-in-btn" @click="goToUserSignIn">{{ $t('COMMON.SIGN_IN.MEMBER_SIGN_IN') }}</span>
        </div>
    </div>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import {
    ComponentRenderProxy,
    defineComponent, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import PButton from '@/components/atoms/buttons/PButton.vue';
import PTextInput from '@/components/atoms/inputs/PTextInput.vue';
import PFieldGroup from '@/components/molecules/forms/field-group/PFieldGroup.vue';
import {
    formValidation,
    requiredValidation,
} from '@/lib/compostion-util';

export default defineComponent({
    name: 'AdminSignIn',
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
                    user_type: 'DOMAIN_OWNER',
                    user_id: state.userId,
                    password: state.password,
                };
                context.emit('on-sign-in', credentials);
            }
        };
        const goToUserSignIn = () => {
            context.emit('go-to-user-sign-in');
        };
        return {
            ...toRefs(state),
            ...validateAPI,
            signIn,
            goToUserSignIn,
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

.user-sign-in-btn {
    @apply text-gray-400 text-sm cursor-pointer;
    &:hover {
        @apply text-blue-500;
    }
    &:active {
        @apply text-blue-600;
    }
}

#button-msg {
    font-size: 0.875rem;
}

</style>
