<template>
    <div class="user-info">
        <div id="sign-in-info" class="field-group text-left ">
            <form class="form">
                <div class="flex flex-col w-full">
                    <p class="input-title">
                        {{ $t('COMMON.SIGN_IN.USER_ID') }}
                    </p>
                    <PFieldGroup :invalid-text="idInvalidText" :invalid="!isIdValid">
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
                    <PFieldGroup :invalid-text="passwordInvalidText" :invalid="!isPasswordValid">
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
import { TranslateResult } from 'vue-i18n';

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
            userId: '' as string | undefined,
            password: '',
        });

        const validationState = reactive({
            isIdValid: undefined as undefined | boolean,
            idInvalidText: '' as TranslateResult | string,
            isPasswordValid: undefined as undefined | boolean,
            passwordInvalidText: '' as TranslateResult | string,
            isPasswordCheckValid: undefined as undefined | boolean,
            passwordCheckInvalidText: '' as TranslateResult | string,
        });

        const checkUserId = async () => {
            if (!state.userId) {
                validationState.isIdValid = false;
                validationState.idInvalidText = vm.$t('COMMON.SIGN_IN.USER_ID_REQUIRED');
            } else {
                validationState.isIdValid = true;
                validationState.idInvalidText = '';
            }
        };

        const checkPassword = async () => {
            if ((state.password.replace(/ /g, '').length !== state.password.length)
            || !state.password) {
                validationState.isPasswordValid = false;
                validationState.passwordInvalidText = vm.$t('COMMON.SIGN_IN.PASSWORD_REQUIRED');
            } else {
                validationState.isPasswordValid = true;
                validationState.passwordInvalidText = '';
            }
        };

        const signIn = async () => {
            await checkUserId();
            await checkPassword();
            if (!validationState.isIdValid || !validationState.isPasswordValid) {
                return;
            }
            const credentials = {
                user_id: state.userId,
                password: state.password,
            };
            context.emit('on-sign-in', credentials);
        };
        const goToAdminSignIn = () => {
            context.emit('go-to-admin-sign-in');
        };
        return {
            ...toRefs(state),
            ...toRefs(validationState),
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
