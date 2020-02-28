<template>
    <div class="wrapper default-theme">
        <div class="container w-16 md:w-32 lg:w-48 ">
            <p id="logo">
                <img src="@/assets/images/brand/brand_logo.png">
            </p>
            <div class="header">
                <p id="title">
                    Sign in to SPACEONE
                </p>
                <p id="subtitle">
                    Welcome to SPACEONE Console
                </p>
            </div>
            <div class="user-info">
                <component :is="component" />
                <div class="login-info">
                    <p class="input-title">
                        User ID
                    </p>
                    <p-text-input ref="userId"
                                  class="form-control"
                                  placeholder="User ID"
                                  required
                    /><br>
                    <p class="input-title">
                        Password
                    </p>
                    <p-text-input ref="password"
                                  type="password"
                                  class="form-control"
                                  placeholder="Password"
                                  required
                    />
                    <br>
                    <p-button style-type="primary"
                              type="submit"
                              size="lg"
                    >
                        Login
                    </p-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
/* eslint-disable camelcase, vue/prop-name-casing */
import {
    toRefs, reactive, ref, computed, createComponent, onMounted,
} from '@vue/composition-api';
import PButton from '@/components/atoms/buttons/Button.vue';
import PTextInput from '@/components/atoms/inputs/TextInput.vue';

interface State {
    component: any,
    loader: () => Promise<any>
}

export default createComponent({
    name: 'SignIn',
    components: {
        PButton,
        PTextInput,
    },
    props: {
        view_type: {
            type: String,
            required: true,
        },
        data_source: {
            type: Array,
            required: true,
        },
        data: {
            type: [Object, Array],
            default: () => ({}),
        },
        key_path: {
            type: String,
            default: '',
        },
        apiHandler: {
            type: Object,
            default: null,
        },
    },
    setup(props:any) {
        // noinspection TypeScriptCheckImport
        const state = reactive<any>({
            component: null,
            loader: computed<()=>Promise<any>>(() => () => import(`./templates/${props.view_type}/index.vue`)),
        });
        onMounted(():void => {
            state.loader()
                .then(() => {
                    state.component = () => state.loader();
                })
                .catch(() => {
                    // eslint-disable-next-line import/no-unresolved
                    state.component = () => import('./templates/local/index.vue');
                });
        });
        return {
            ...toRefs(state),
        };
    },
});

</script>

<style lang="scss" scoped>
    @mixin background-theme($theme, $background) {
        &.#{$theme} {
            background: $background;
        }
    }

    .wrapper {
        margin: auto;
        background-size: cover;
        @include background-theme('default-theme', $white);
        @include background-theme('color-theme', $gray);
        @include background-theme('image-theme', url('~@/assets/images/landing/cloudone_console_sign-in_bg.jpg'));
        @include background-theme('video-theme', url('https://www.pexels.com/video/changes-in-form-and-appearance-of-a-submerged-material-3163534/'));
    }

    .container {
        background-color: white;
        padding: 24px 16px;
    }

    .header{
        padding-top: 1.5rem;
        text-align: center;
        #title {
            font-weight: bold;
            font-size: 1.5rem;
        }
        #subtitle {
            padding-top: 0.5rem;
            font-weight: normal;
            font-size: 0.875rem;
            padding-bottom: 8px;
        }
    }

    #logo {
        text-align: center;
    }

    .input-title {
        font-size: 0.875rem;
        font-weight: bold;
        padding-top: 16px;
        padding-bottom: 4px;
    }

</style>
