<template>
    <div class="local-wrapper">
        <form class="form">
            <p v-if="isAdmin" class="input-label">
                {{ $t('COMMON.SIGN_IN.ADMIN_ID') }}
            </p>
            <p v-else class="input-label">
                {{ $t('COMMON.SIGN_IN.USER_ID') }}
            </p>
            <PFieldGroup :invalid="isIdValid === false">
                <template #default="{invalid}">
                    <p-text-input
                        v-model="userId"
                        placeholder="E-mail Address"
                        autocomplete="username"
                        :invalid="invalid"
                        class="input-box"
                        @input="checkUserId"
                    />
                </template>
            </PFieldGroup>
            <p class="input-label">
                {{ $t('COMMON.SIGN_IN.PASSWORD') }}
            </p>
            <PFieldGroup :invalid="isPasswordValid === false">
                <template v-slot:default="{invalid}">
                    <p-text-input
                        v-model="password"
                        type="password"
                        placeholder="Password"
                        autocomplete="current-password"
                        :invalid="invalid"
                        class="input-box"
                        @input="checkPassword"
                        @keyup.enter="signIn"
                    />
                </template>
            </PFieldGroup>
        </form>
        <p-button :style-type="buttonStyleType" type="submit" size="lg"
                  class="sign-in-btn"
                  @click="signIn"
        >
            {{ $t('COMMON.SIGN_IN.SIGN_IN') }}
        </p-button>
    </div>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import {
    getCurrentInstance,
    reactive,
    toRefs,
    defineComponent, ComponentRenderProxy, computed,
} from '@vue/composition-api';
import PButton from '@/components/atoms/buttons/PButton.vue';
import PTextInput from '@/components/atoms/inputs/PTextInput.vue';
import PFieldGroup from '@/components/molecules/forms/field-group/PFieldGroup.vue';
import { TranslateResult } from 'vue-i18n';

export default defineComponent({
    name: 'IDPWSignIn',
    components: {
        PButton,
        PTextInput,
        PFieldGroup,
    },
    props: {
        isAdmin: {
            type: Boolean,
            default: false,
        },
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
                password: state.password.trim(),
            };
            context.emit('on-sign-in', state.userId, credentials);
        };

        const buttonStyleType = computed(() => (props.isAdmin ? 'primary-dark' : 'primary1'));

        return {
            ...toRefs(state),
            ...toRefs(validationState),
            signIn,
            checkUserId,
            checkPassword,
            buttonStyleType,
        };
    },
});
</script>

<style lang="postcss" scoped>
.local-wrapper {
    margin: auto;
    width: 100%;
    .input-label {
        @apply font-bold text-gray-900 mt-2;
        font-size: 0.875rem;
        line-height: 140%;
        margin-bottom: 0.375rem;
    }
    .input-box {
        width: 100%;
        margin-bottom: 0.625rem;
    }
    .sign-in-btn {
        width: 100%;
        margin-top: 2.5rem;
    }

    @media screen and (width < 478px) {
        width: 15rem;
        .form {
            margin-top: 0.5rem;
        }
        .input-label {
            display: none;
        }
    }
}
</style>
