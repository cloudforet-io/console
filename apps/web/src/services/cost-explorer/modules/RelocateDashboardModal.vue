<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router/composables';

import { PButton, PDivider } from '@spaceone/design-system';

import { LocalStorageAccessor } from '@cloudforet/core-lib/local-storage-accessor';

import { store } from '@/store';

import { DASHBOARDS_ROUTE } from '@/services/dashboards/route-config';

interface Props {
    visible: boolean;
}

const router = useRouter();
withDefaults(defineProps<Props>(), {
    visible: false,
});
const userId = computed(() => store.state.user.userId);
const emit = defineEmits<{(e: 'update:visible', visible: boolean): void}>();

const handleClose = () => {
    emit('update:visible', false);
};

const handleReject = () => {
    const settings = LocalStorageAccessor.getItem(userId.value);
    settings.costExplorer.hideRelocateDashboardNotification = true;
    LocalStorageAccessor.setItem(userId.value, settings);
    emit('update:visible', false);
};

const handleRouteToDashboard = () => {
    const routeData = router.resolve({
        name: DASHBOARDS_ROUTE._NAME,
        query: {
            // TODO: refactor
            filters: ['[["Cost"],"label","="]'],
        },
    });
    window.open(routeData.href, '_blank');
};

</script>

<template>
    <section class="relocate-dashboard-modal">
        <transition v-if="visible"
                    name="modal"
        >
            <div class="modal-mask">
                <article class="modal-content">
                    <div class="image-wrapper">
                        <img src="@/assets/images/CA_db-disappear.png"
                             alt="relocate-dashboard-image"
                        >
                    </div>
                    <div class="main-content-wrapper">
                        <div class="update-badge">
                            <p class="text">
                                FEATURE UPDATED
                            </p>
                        </div>
                        <div class="title">
                            <p>We are thrilled to introduce a significant enhancement to your cost dashboard!</p>
                        </div>
                        <div class="description">
                            <p>
                                We have integrated the previous Cost Explore's Dashboard feature into a brand new standalone service called "Dashboards".
                                Therefore, the old dashboards are no longer supported.
                                Go to "Dashboards" menu and explore expanded widget options, advanced variables with much better visuals.
                            </p>
                        </div>
                        <p-button style-type="tertiary"
                                  icon-right="ic_arrow-right-up"
                                  @click="handleRouteToDashboard"
                        >
                            Go to Dashboard
                        </p-button>
                        <p-divider class="divider" />
                        <div class="footer">
                            <p-button style-type="tertiary"
                                      @click="handleReject"
                            >
                                Don't show me again
                            </p-button>
                            <p-button @click="handleClose">
                                Got it
                            </p-button>
                        </div>
                    </div>
                </article>
            </div>
        </transition>
    </section>
</template>

<style lang="postcss" scoped>
.relocate-dashboard-modal {
    display: inline-block;

    .modal-content {
        @apply bg-white border border-gray-200 rounded-lg;
        width: 30rem;
        padding: 0.5rem 0.5rem 2rem;
        display: flex;
        flex-direction: column;
        box-shadow: 0 0 0.5rem rgba(theme('colors.gray.900'), 0.32);

        .image-wrapper {
            @apply w-full;
            margin-bottom: 1.5rem;
        }

        .main-content-wrapper {
            padding: 0 1.5rem;
            .update-badge {
                @apply inline-flex justify-center items-center rounded-xs bg-violet-100;
                padding: 0.25rem 0.5rem;
                margin-bottom: 0.5rem;
                .text {
                    @apply font-bold text-label-md;
                    background: linear-gradient(90deg, theme('colors.violet.600') 0%, rgba(0, 128, 251, 1) 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
            }
            .title {
                @apply text-display-sm text-gray-900;
                margin-bottom: 1rem;
            }
            .description {
                @apply text-label-lg text-gray-900;
                margin-bottom: 1rem;
            }

            .divider {
                margin: 1.5rem 0;
            }

            .footer {
                @apply flex justify-between items-center;
            }
        }
    }
}

</style>
