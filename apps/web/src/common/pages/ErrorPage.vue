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
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import { PButton } from '@spaceone/design-system';

/* eslint-disable import/no-cycle */
import { store } from '@/store';

import { HOME_DASHBOARD_ROUTE } from '@/services/home-dashboard/routes/route-constant';

interface Props {
    statusCode: string;
}

const props = withDefaults(defineProps<Props>(), {
    statusCode: '404',
});

const domainName = computed(() => store.state.domain.name);

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
    router.push({ name: HOME_DASHBOARD_ROUTE._NAME });
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
                    {{ $t('COMMON.ERROR.404_MSG') }}
                </template>
                <template v-else>
                    {{ $t('COMMON.ERROR.404_MSG') }}
                </template>
            </h3>
            <div v-if="domainName"
                 class="utils-button"
            >
                <p-button style-type="transparent"
                          size="lg"
                          icon-left="ic_arrow-left"
                          @click="handleClickBack"
                >
                    {{ $t('COMMON.ERROR.GO_BACK') }}
                </p-button>
                <p-button style-type="primary"
                          size="lg"
                          @click="handleClickHome"
                >
                    {{ $t('COMMON.ERROR.HOME') }}
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
