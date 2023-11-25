<script lang="ts">
// eslint-disable-next-line import/order,import/no-duplicates
import { defineComponent } from 'vue';

export default defineComponent({
    beforeRouteEnter(to, from, next) {
        next((vm) => {
            vm.$router.replace({
                query: { previousPage: from.fullPath },
            }).catch(() => {});
        });
    },
});
</script>

<script setup lang="ts">
/* eslint-disable import/first */
// eslint-disable-next-line import/no-duplicates
import { useRoute, useRouter } from 'vue-router/composables';

import { PButton } from '@spaceone/design-system';

import { ROUTES } from '@/router/constant';



interface Props {
    statusCode: string;
}

const props = withDefaults(defineProps<Props>(), {
    statusCode: '404',
});


const route = useRoute();
const router = useRouter();

const handleClickBack = () => {
    const previousPage = route.query.previousPage as string;
    if (previousPage === '/') {
        handleClickHome();
    } else {
        router.go(-1);
    }
};
const handleClickHome = () => {
    router.push({ name: ROUTES.MAIN._NAME });
};
</script>

<template>
    <section class="page-wrapper">
        <article class="error-contents">
            <img class="error-img"
                 alt="error-img"
                 src="/images/error-octos.gif"
            >
            <h2 class="error-code">
                {{ props.statusCode }}
            </h2>
            <h3 class="error-message">
                <template v-if="props.statusCode === '403'">
                    Sorry, we can’t seem to find what you’re looking for.
                </template>
                <template v-else>
                    Sorry, we can’t seem to find what you’re looking for.
                </template>
            </h3>
            <div class="utils-button">
                <p-button style-type="transparent"
                          size="lg"
                          icon-left="ic_arrow-left"
                          @click="handleClickBack"
                >
                    Go Back
                </p-button>
                <p-button style-type="primary"
                          size="lg"
                          @click="handleClickHome"
                >
                    Home
                </p-button>
            </div>
        </article>
    </section>
</template>

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
            @apply text-violet-400 text-display-sm m-auto;
            width: 18rem;
            padding-bottom: 2.25rem;
        }
        .utils-button {
            @apply flex items-center justify-center;
            gap: 1rem;
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
