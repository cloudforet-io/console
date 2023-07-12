<script lang="ts" setup>
import { PI, PCard } from '@spaceone/design-system';
import { useI18n } from 'vue-i18n';

interface Props {
    title: string;
    dataRange: number;
    widgetLink: string | object;
    noData: boolean;
    showTopText: boolean;
    printMode: boolean;
}

withDefaults(defineProps<Props>(), {
    title: 'Title',
    dataRange: 15,
    widgetLink: undefined,
    noData: false,
    showTopText: true,
    printMode: false,
});
const { t } = useI18n();

</script>

<template>
    <p-card class="cost-dashboard-card-widget-layout"
            style-type="white"
            size="lg"
            :class="{responsive: !printMode}"
    >
        <template #header>
            <div class="header">
                {{ title }}
                <p class="title-extra">
                    <span v-if="showTopText"
                          class="show-top-text mr-2"
                    >{{ t('BILLING.COST_MANAGEMENT.DASHBOARD.SHOWING_TOP_NUM', { num : dataRange }) }}
                        <!--                        <p-i name="ic_tooltip" width="1rem" height="1rem"-->
                        <!--                             color="inherit transparent" class="tooltip-button"-->
                        <!--                        />-->
                    </span>
                    <router-link v-if="widgetLink && !printMode"
                                 :to="widgetLink"
                                 class="anchor-button"
                    >
                        {{ t('BILLING.COST_MANAGEMENT.DASHBOARD.FULL_DATA') }}
                        <p-i name="ic_chevron-right"
                             width="1rem"
                             height="1rem"
                             color="inherit transparent"
                        />
                    </router-link>
                </p>
            </div>
        </template>
        <div v-if="noData"
             class="no-data"
        >
            No Item
        </div>
        <slot v-else />
    </p-card>
</template>

<style lang="postcss" scoped>
.cost-dashboard-card-widget-layout {
    @apply flex flex-col;
    min-height: 100%;
    .header {
        @apply flex items-center justify-between;
        line-height: 1.2;
    }
    .title-extra {
        @apply inline-flex;
        flex-shrink: 0;
        .show-top-text {
            @apply flex items-center text-gray-500;
            font-size: 0.875rem;
            line-height: 150%;
            white-space: nowrap;
            .tooltip-button {
                @apply text-gray-300 ml-1 mr-2;
            }
        }
        .anchor-button {
            @apply flex items-center flex-shrink-0 text-sm text-blue-700 font-normal cursor-pointer;
            font-size: 0.75rem;
            line-height: 150%;
            margin-top: 0.1rem;
            &:hover {
                @apply text-secondary underline;
            }
        }
    }

    /* custom design-system component - p-card */
    :deep(.body) {
        @apply bg-white;
        flex-grow: 1;
        padding: 1rem;
        .no-data {
            @apply flex text-center justify-center items-center text-violet-300 font-bold;
            height: calc(100% - 2rem);
            font-size: 0.875rem;
            line-height: 160%;
            z-index: 1;
        }
    }

    &.responsive {
        @screen mobile {
            .title-extra {
                .show-top-text {
                    @apply hidden;
                }
            }
        }
    }
}
</style>
