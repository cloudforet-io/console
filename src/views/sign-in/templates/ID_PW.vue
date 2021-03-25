<template>
    <div class="local-wrapper">
        <form class="form">
            <p-field-group :label="isAdmin ? $t('COMMON.SIGN_IN.ADMIN_ID') : $t('COMMON.SIGN_IN.USER_ID')"
                           :invalid="isIdValid === false" required
            >
                <template #default="{invalid}">
                    <p-text-input v-model="userId"
                                  placeholder="User ID"
                                  autocomplete="username"
                                  :invalid="invalid"
                                  block
                                  @input="checkUserId"
                    />
                </template>
            </p-field-group>
            <p-field-group :label="$t('COMMON.SIGN_IN.PASSWORD')"
                           required
                           :invalid="isPasswordValid === false"
            >
                <template #default="{invalid}">
                    <p-text-input v-model="password"
                                  type="password"
                                  placeholder="Password"
                                  autocomplete="current-password"
                                  :invalid="invalid"
                                  block
                                  @input="checkPassword"
                                  @keyup.enter="signIn"
                    />
                </template>
            </p-field-group>
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

import { PButton, PTextInput, PFieldGroup } from '@spaceone/design-system';

import { TranslateResult } from 'vue-i18n';
import { SpaceAuth } from '@/views/sign-in/lib/authenticator/space-auth';
import { loadAuth } from '@/views/sign-in/lib/authenticator/loader';

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
            try {
                await loadAuth().signIn(state.userId, credentials, props.isAdmin ? 'DOMAIN_OWNER' : 'USER');
                context.emit('sign-in');
            } catch (e) {
                context.emit('sign-in-error');
                console.error(e);
            }
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

    .sign-in-btn {
        width: 100%;
        margin-top: 2.5rem;
    }

    @media screen and (width < 478px) {
        width: 15rem;
        .form {
            margin-top: 0.5rem;
        }
        .p-field-group::v-deep .label-box {
            display: none;
        }
    }
}
</style>
