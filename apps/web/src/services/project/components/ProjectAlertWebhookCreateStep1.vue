<script setup lang="ts">
import { onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import { isEmpty } from 'lodash';

import {
    PSelectCard, PButton, PLink, PLazyImg, PDataLoader,
} from '@cloudforet/mirinae';

import type { PluginModel } from '@/schema/repository/plugin/model';

import { assetUrlConverter } from '@/lib/helper/asset-helper';

import { PROJECT_ROUTE } from '@/services/project/routes/route-constant';
import { useProjectDetailPageStore } from '@/services/project/stores/project-detail-page-store';
import type { WebhookType } from '@/services/project/types/project-alert-type';

const projectDetailPageStore = useProjectDetailPageStore();

const router = useRouter();

const emit = defineEmits<{(e: 'update:currentStep', step: number, item: PluginModel): void; }>();

const state = reactive({
    loading: true,
    showValidation: false,
    selectedWebhookType: {} as WebhookType,
    webhookTypeList: [] as WebhookType[],
});

const handleClickNextStep = () => {
    emit('update:currentStep', 2, state.selectedWebhookType);
};
const handleClickGoBack = () => {
    router.push({ name: PROJECT_ROUTE.DETAIL.TAB.ALERT._NAME, query: { tab: 'webhook' } });
};

onMounted(async () => {
    try {
        state.webhookTypeList = await projectDetailPageStore.getListWebhookType();
    } finally {
        state.loading = false;
    }
});
</script>

<template>
    <p-data-loader class="project-alert-webhook-create-step-1"
                   :data="state.webhookTypeList"
                   :loading="state.loading"
                   loader-backdrop-color="0"
    >
        <div class="card-wrapper">
            <p-select-card
                v-for="(item, index) in state.webhookTypeList"
                :key="index"
                v-model="state.selectedWebhookType"
                :tab-index="index"
                :image-url="item.tags?.icon"
                icon="ic_webhook"
                :value="item"
                :label="item.name"
                :invalid="state.showValidation"
                class="card"
            >
                <div class="card-item">
                    <p-lazy-img :src="assetUrlConverter(item.tags?.icon)"
                                width="2.5rem"
                                height="2.5rem"
                                error-icon="ic_webhook"
                                class="image"
                    />
                    <div class="info">
                        <p>{{ item.name }}</p>
                        <p class="desc">
                            {{ item.tags?.long_description || item.tags?.description }}
                        </p>
                    </div>
                    <!-- TODO: will be updated field name -->
                    <p-link v-if="item.tags.url"
                            new-tab
                            highlight
                            action-icon="external-link"
                            :href="item.tags.url"
                            class="learn-more-button"
                    >
                        {{ $t('PROJECT.DETAIL.LEARN_MORE') }}
                    </p-link>
                </div>
            </p-select-card>
        </div>
        <div class="buttons-wrapper">
            <p-button style-type="transparent"
                      size="lg"
                      icon-left="ic_arrow-left"
                      @click="handleClickGoBack"
            >
                {{ $t('COMMON.ERROR.GO_BACK') }}
            </p-button>
            <p-button class="select-button"
                      size="lg"
                      :disabled="isEmpty(state.selectedWebhookType)"
                      @click="handleClickNextStep"
            >
                {{ $t('INVENTORY.COLLECTOR.CREATE.SELECT') }}
            </p-button>
        </div>
    </p-data-loader>
</template>

<style scoped lang="postcss">
.project-alert-webhook-create-step-1 {
    @apply flex flex-col;
    min-width: 59.5625rem;
    width: 100%;
    min-height: 22.5rem;
    overflow: visible;
    .card-wrapper {
        @apply grid grid-cols-2 overflow-y-auto;
        max-height: 23.875rem;
        grid-column-gap: 0.5rem;
        grid-row-gap: 0.5rem;
        .card {
            padding: 1rem;
            max-width: 29.5rem;
            min-height: initial;
            height: 5.25rem;
            border-radius: 0.375rem;
            .card-item {
                @apply flex relative;
                width: 100%;
                gap: 0.75rem;
                .info {
                    @apply flex flex-col text-label-md;
                    flex: 1;
                    max-width: calc(100% - 3.25rem);
                    gap: 0.125rem;
                    .desc {
                        @apply text-label-sm text-gray-500;
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                }
                .learn-more-button {
                    @apply absolute text-label-sm;
                    top: 0;
                    right: 0;
                }
            }
        }
    }
    .buttons-wrapper {
        @apply flex items-center justify-end;
        margin-top: 2rem;
        gap: 1rem;
    }

    /* custom design-system component - p-select-card */
    :deep(.p-select-card) {
        &.selected {
            @apply bg-blue-200 border-2 text-gray-900;
        }
        .marker {
            @apply hidden;
            opacity: 0;
        }
    }

    @screen tablet {
        min-width: 30rem;
        .card-wrapper {
            @apply grid-cols-1;
            .card {
                max-width: initial;
            }
        }
    }

    @screen mobile {
        min-width: 20rem;
    }
}
</style>
