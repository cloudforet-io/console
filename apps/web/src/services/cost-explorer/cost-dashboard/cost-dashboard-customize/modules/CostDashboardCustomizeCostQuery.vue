<script lang="ts" setup>

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PDataLoader, PIconButton, PButton, PFieldTitle,
} from '@spaceone/design-system';
import { reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

import { getUUID } from '@/lib/component-util/getUUID';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { CHART_TYPE } from '@/services/cost-explorer/cost-analysis/type';
import type { WidgetInfo } from '@/services/cost-explorer/cost-dashboard/type';
import { GRANULARITY } from '@/services/cost-explorer/lib/config';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import type { CostQuerySetModel } from '@/services/cost-explorer/type';


const LAYOUT = 100;

interface Props {
    selectedQuery: CostQuerySetModel;
    widgetList: WidgetInfo[];
}

withDefaults(defineProps<Props>(), {
    selectedQuery: () => ({}) as CostQuerySetModel,
    widgetList: () => [],
});
const emit = defineEmits<{(e: 'create-custom-widget', value?: WidgetInfo): void;
    (e: 'update:selected-query', value: CostQuerySetModel): void;
}>();
const router = useRouter();
const { t } = useI18n();
const store = useStore();

const state = reactive({
    loading: true,
    costQuerySetList: [] as CostQuerySetModel[],
});

/* Api */
const listQuerySet = async () => {
    try {
        state.loading = true;
        const { results } = await SpaceConnector.client.costAnalysis.costQuerySet.list({
            query: {
                filter: [{ k: 'user_id', v: store.state.user.userId, o: 'eq' }],
            },
        });
        state.costQuerySetList = results;
    } catch (e) {
        ErrorHandler.handleError(e);
        state.costQuerySetList = [];
    } finally {
        state.loading = false;
    }
};
const createCustomWidget = async (query: CostQuerySetModel): Promise<WidgetInfo|undefined> => {
    try {
        return await SpaceConnector.client.costAnalysis.customWidget.create({
            name: `${query.name}-${getUUID().slice(0, 23)}`,
            options: {
                granularity: query.options?.granularity,
                group_by: query.options?.group_by?.[0],
                stack: query.options?.stack,
                filters: query.options?.filters,
                chart_type: query.options?.granularity === GRANULARITY.ACCUMULATED ? CHART_TYPE.DONUT : CHART_TYPE.STACKED_COLUMN,
                layout: LAYOUT,
            },
        });
    } catch (e) {
        ErrorHandler.handleError(e);
        return undefined;
    }
};

/* Event */
const handleAddToCustomWidget = async (query: CostQuerySetModel) => {
    const createdCustomWidget = await createCustomWidget(query);
    emit('create-custom-widget', createdCustomWidget);
};
const handleRefresh = () => {
    listQuerySet();
};
const handleClickQueryItem = (query: CostQuerySetModel) => {
    emit('update:selected-query', query);
};
const handleClickCreateQuery = () => {
    const route = router.resolve({ name: COST_EXPLORER_ROUTE.COST_ANALYSIS._NAME });
    window.open(route.href, '_blank');
};

/* Init */
(() => {
    listQuerySet();
})();

</script>

<template>
    <div class="cost-dashboard-customize-cost-query">
        <div class="title-wrapper">
            <p-field-title>{{ t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE.ADD_WIDGET_MODAL.COST_ANALYSIS_QUERY') }}</p-field-title>
            <template v-if="!state.loading && state.costQuerySetList.length">
                <p-icon-button name="ic_refresh"
                               class="refresh-button"
                               @click="handleRefresh"
                />
                <p-button style-type="substitutive"
                          icon-left="ic_plus_bold"
                          @click="handleClickCreateQuery"
                >
                    {{ t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE.ADD_WIDGET_MODAL.CREATE_QUERY') }}
                </p-button>
            </template>
        </div>
        <div class="content-wrapper">
            <p-data-loader :loading="state.loading"
                           :data="state.costQuerySetList"
            >
                <div class="query-list-wrapper">
                    <div v-for="(query, idx) in state.costQuerySetList"
                         :key="`query-${idx}-${query.cost_query_set_id}`"
                         class="query-item"
                         :class="{ selected: query.cost_query_set_id === selectedQuery.cost_query_set_id }"
                         @click="handleClickQueryItem(query)"
                    >
                        <p class="name">
                            {{ query.name }}
                        </p>
                        <p-button style-type="tertiary"
                                  icon-left="ic_plus_bold"
                                  size="sm"
                                  @click="handleAddToCustomWidget(query)"
                        >
                            <span>{{ t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE.ADD_WIDGET_MODAL.ADD_TO_CUSTOM_WIDGET') }}</span>
                        </p-button>
                    </div>
                </div>
                <template #no-data>
                    <div class="refresh-wrapper">
                        <span class="text">{{ t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE.ADD_WIDGET_MODAL.NO_SAVED_QUERY') }}</span>
                        <p-icon-button name="ic_refresh"
                                       @click="handleRefresh"
                        />
                    </div>
                    <p class="help-text">
                        {{ t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE.ADD_WIDGET_MODAL.NO_SAVED_QUERY_HELP_TEXT') }}
                    </p>
                    <p-button style-type="substitutive"
                              icon-left="ic_plus_bold"
                              @click="handleClickCreateQuery"
                    >
                        <span>{{ t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE.ADD_WIDGET_MODAL.CREATE_QUERY') }}</span>
                    </p-button>
                </template>
            </p-data-loader>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.cost-dashboard-customize-cost-query {
    @apply bg-gray-100 rounded-sm;
    padding: 1rem;

    .title-wrapper {
        @apply flex items-center;
        .refresh-button {
            margin-right: 1rem;
        }
        .p-field-title {
            @apply mr-auto;
        }

        /* custom design-system component - p-anchor */
        :deep(.p-anchor) {
            @apply ml-4;
            &:hover .text {
                text-decoration: none;
            }
        }
    }

    .content-wrapper {
        /* custom design-system component - p-data-loader */
        .p-data-loader {
            :deep(.no-data-wrapper) {
                @apply block;
                font-size: 0.875rem;
            }
            .refresh-wrapper {
                @apply align-top;
                .text {
                    @apply inline-block text-primary-2 font-bold;
                    line-height: 2rem;
                }
            }
            .help-text {
                @apply mt-4 mb-4;
            }
        }
        .query-list-wrapper {
            @apply grid grid-cols-12 grid-cols-3 gap-2 mt-4;
            .query-item {
                @apply flex flex-col bg-white border border-gray-300 rounded-lg cursor-pointer;
                min-height: 7rem;
                padding: 0.5rem 1rem 1.5rem;
                &.selected {
                    @apply border border-blue-600;
                }

                .name {
                    @apply flex-grow font-bold mb-6;
                    min-height: 2.25rem;
                    font-size: 0.875rem;
                    line-height: 1.25;
                }
                .p-icon-text-button {
                    @apply block ml-auto mr-auto;
                    max-width: 100%;
                }
            }
        }
    }
}
</style>
