<template>
    <section class="page-wrapper">
        <article class="error-contents">
            <img class="error-img"
                 src="@/assets/images/error/error-octos.gif"
            >
            <h2 class="error-code">
                404
            </h2>
            <h3 class="error-message">
                {{ $t('COMMON.ERROR.404_MSG') }}
            </h3>
            <p-button class="go-back-button"
                      style-type="primary"
                      size="md"
                      @click="$router.go(-1)"
            >
                {{ $t('COMMON.ERROR.GO_BACK') }}
            </p-button>
        </article>
    </section>
</template>

<script>
import { PButton } from '@spaceone/design-system';

export default {
    name: 'ErrorPage',
    components: { PButton },
};
</script>

<style lang="postcss" scoped>
.page-wrapper {
    @apply bg-gray-100;
    display: flex;
    height: 100%;

    .error-contents {
        text-align: center;
        margin: auto;
        .error-img {
            @apply mx-auto align-middle;
            width: 20rem;
            padding-bottom: 3.5rem;
        }
        .error-code {
            @apply text-primary1;
            font-size: 4rem;
            font-weight: 700;
            line-height: 1.25;
            padding-bottom: 0.5rem;
        }
        .error-message {
            @apply text-gray-500;
            font-size: 1rem;
            line-height: 150%;
            padding-bottom: 2.25rem;
        }
        .go-back-button {
            height: 2.5rem;
        }
    }
}

@screen mobile {
    .page-wrapper {
        .error-contents {
            .error-img {
                width: 60%;
            }
        }
    }
}
</style>
