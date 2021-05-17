<template>
    <section class="page-wrapper">
        <div class="error-wrapper">
            <article class="error-contents">
                <p-lottie name="lottie_whoops" class="error-img"
                          auto
                          :size="16"
                />
                <h2 class="error-code">
                    404
                </h2>
                <h3 class="error-message">
                    {{ $t('COMMON.ERROR.404_MSG') }}
                </h3>
            </article>
        </div>
        <footer><img src="@/assets/images/SpaceONE_logo_bottom.png" class="footer-img"></footer>
    </section>
</template>

<script>
import { PLottie } from '@spaceone/design-system';

export default {
    name: 'ErrorPage',
    components: { PLottie },
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
