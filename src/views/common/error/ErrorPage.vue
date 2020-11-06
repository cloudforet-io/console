<template>
    <div class="wrap">
        <div class="error">
            <div class="error-contents">
                <img src="@/assets/images/illust_whoops.png" class="w-40 sm:w-40 md:w-40 lg:w-64 xl:w-64 error-img">
                <p class="error-code">
                    404
                </p>
                <p class="error-message">
                    {{ $t('COMMON.ERROR.404_MSG') }}<br> {{ $t('COMMON.ERROR.404_GO_BACK_1') }} <a href="javascript:history.go(-1)">{{ $t('COMMON.ERROR.404_GO_BACK_2') }}</a>
                </p>
            </div>
        </div>
        <footer><img src="@/assets/images/SpaceONE_logo_bottom.png" class="footer-img"></footer>
    </div>
</template>

<script>
import { reactive, toRefs } from '@vue/composition-api';

export default {
    name: 'ErrorPage',
    setup() {
        const state = reactive({
            errorStatus: '404',
            errorMessage: 'Page Not Found',
        });

        return {
            ...toRefs(state),
        };
    },
};
</script>


<style lang="postcss" scoped>
.wrap {
    @apply m-auto flex min-h-screen flex-col;
}

.error {
    @apply flex-1 text-center;
    .error-contents {
        padding-top: calc(70% - 2.5rem);
        .error-img {
            @apply mx-auto align-middle;
        }
        .error-code {
            @apply font-bold text-6xl text-primary pb-4;
            line-height: 120%;
        }
        .error-message {
            @apply text-lg;
            line-height: 150%;
            a {
                @apply text-blue-700;
            }
        }
    }
}

.footer-img {
    @apply mx-auto w-24 align-middle pb-8;
}
</style>
