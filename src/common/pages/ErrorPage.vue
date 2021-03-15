<template>
    <section class="page-wrapper">
        <div class="error-wrapper">
            <article class="error-contents">
                <!--                <div class="w-40 sm:w-40 md:w-40 lg:w-64 xl:w-64 error-img">-->
                <p-lottie name="lottie_whoops" class="error-img"
                          auto
                          :size="16"
                />
                <!--                </div>-->
                <!--                    <img src="@/assets/images/illust_whoops.png" class="w-40 sm:w-40 md:w-40 lg:w-64 xl:w-64 error-img">-->
                <h2 class="error-code">
                    404
                </h2>
                <h3 class="error-message">
                    {{ $t('COMMON.ERROR.404_MSG') }}
                </h3>
                <p-button />
            </article>
        </div>
        <footer><img src="@/assets/images/SpaceONE_logo_bottom.png" class="footer-img"></footer>
    </section>
</template>

<script>
import { reactive, toRefs } from '@vue/composition-api';
import { PButton, PLottie } from '@spaceone/design-system';

export default {
    name: 'ErrorPage',
    components: { PButton, PLottie },
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
.page-wrapper {
    @apply m-auto flex min-h-screen flex-col;
}

.error-wrapper {
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
