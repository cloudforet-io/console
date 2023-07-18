<script lang="ts" setup>
import { QueryHelper } from '@cloudforet/core-lib/query';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PI } from '@spaceone/design-system';
import { findKey } from 'lodash';
import {
    computed, reactive,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

import type { CloudServiceTypeReferenceMap } from '@/store/modules/reference/cloud-service-type/type';
import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';

import WidgetLayout from '@/common/components/layouts/WidgetLayout.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { green, red, yellow } from '@/styles/colors';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';


const TRUSTED_ADVISOR = 'Check';
enum STATUS {
    error = 'error',
    warning = 'warning',
    ok = 'ok',
}
enum CATEGORY {
    costOptimizing = 'cost_optimizing',
    performance = 'performance',
    security = 'security',
    faultTolerance = 'fault_tolerance',
    serviceLimits = 'service_limits',
}

const CLOUD_SERVICE_GROUP = 'TrustedAdvisor';
const CLOUD_SERVICE_NAME = 'Check';
const ERROR_COLOR = red[500];
const WARNING_COLOR = yellow[500];
const OK_COLOR = green[500];

interface Props {
    projectId: string;
}

const props = defineProps<Props>();
const store = useStore();
const { t } = useI18n();

const queryHelper = new QueryHelper();

const state = reactive({
    loading: false,
    providers: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
    cloudServiceTypes: computed<CloudServiceTypeReferenceMap>(() => store.getters['reference/cloudServiceTypeItems']),
    trustedAdvisorId: computed<string>(() => {
        const trustedAdvisorId = findKey(state.cloudServiceTypes, { name: TRUSTED_ADVISOR });
        return trustedAdvisorId || '';
    }),
    legends: computed(() => ([
        {
            name: STATUS.error,
            label: t('COMMON.WIDGETS.TRUSTED_ADVISOR.LABEL_ERROR'),
            color: ERROR_COLOR,
        },
        {
            name: STATUS.warning,
            label: t('COMMON.WIDGETS.TRUSTED_ADVISOR.LABEL_WARNING'),
            color: WARNING_COLOR,
        },
        {
            name: STATUS.ok,
            label: t('COMMON.WIDGETS.TRUSTED_ADVISOR.LABEL_OK'),
            color: OK_COLOR,
        },
    ])),
    categories: computed(() => ([
        {
            label: t('COMMON.WIDGETS.TRUSTED_ADVISOR.LABEL_COST_OPTIMIZATION'),
            name: CATEGORY.costOptimizing,
            icon: 'ic_coin-filled',
        },
        {
            label: t('COMMON.WIDGETS.TRUSTED_ADVISOR.LABEL_PERFORMANCE'),
            name: CATEGORY.performance,
            icon: 'ic_performance-filled',
        },
        {
            label: t('COMMON.WIDGETS.TRUSTED_ADVISOR.LABEL_SECURITY'),
            name: CATEGORY.security,
            icon: 'ic_lock-filled',
        },
        {
            label: t('COMMON.WIDGETS.TRUSTED_ADVISOR.LABEL_FAULT_TOLERANCE'),
            name: CATEGORY.faultTolerance,
            icon: 'ic_spanner-filled',
        },
        {
            label: t('COMMON.WIDGETS.TRUSTED_ADVISOR.LABEL_SERVICE_LIMITS'),
            name: CATEGORY.serviceLimits,
            icon: 'ic_limit-filled',
        },
    ])),
    data: null as any,
    awsProvider: computed(() => state.providers.aws),
});

const linkFormatter = (category, status) => {
    if (!state.trustedAdvisorId) return '';

    const filters: ConsoleFilter[] = [];
    filters.push({ k: 'project_id', o: '=', v: props.projectId });
    filters.push({ k: 'data.status', o: '=', v: status });
    filters.push({ k: 'data.category', o: '=', v: category });

    return {
        name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
        query: {
            filters: queryHelper.setFilters(filters).rawQueryStrings,
        },
        params: {
            provider: 'aws',
            group: CLOUD_SERVICE_GROUP,
            name: CLOUD_SERVICE_NAME,
        },
    };
};
const countFormatter = (category, status) => {
    const categoryData = state.data[category];
    if (!categoryData) return 0;
    const statusData = categoryData[`${status}_count`];
    if (!statusData) return 0;
    return statusData;
};
const getData = async () => {
    state.loading = true;
    try {
        const res = await SpaceConnector.client.statistics.topic.trustedAdvisorByProject({
            project_id: props.projectId,
        });
        state.data = res[props.projectId];
    } catch (e) {
        ErrorHandler.handleError(e);
        state.data = null;
    } finally {
        state.loading = false;
    }
};

const init = () => {
    getData();
};
init();

// LOAD REFERENCE STORE
(async () => {
    await Promise.allSettled([
        store.dispatch('reference/cloudServiceType/load'),
        store.dispatch('reference/provider/load'),
    ]);
})();

</script>

<template>
    <widget-layout class="simplified-trusted-advisor">
        <template v-if="state.awsProvider"
                  #title
        >
            <div class="title">
                <span :style="{ color: state.awsProvider ? state.awsProvider.color : '' }">AWS </span>
                <span>{{ t('COMMON.WIDGETS.TRUSTED_ADVISOR.TITLE') }}</span>
            </div>
        </template>
        <template v-if="state.awsProvider">
            <div v-if="state.loading" />
            <div v-else-if="!state.data"
                 class="no-data-wrapper"
            >
                <img alt="no-data-image"
                     src="@/assets/images/illust_star.svg"
                >
                <div class="text">
                    {{ t('COMMON.WIDGETS.TRUSTED_ADVISOR.NO_DATA') }}
                </div>
            </div>
            <template v-else>
                <div class="content-wrapper">
                    <div v-for="(category, cIdx) in state.categories"
                         :key="cIdx"
                         class="data-row"
                    >
                        <div class="left-part">
                            <p-i :name="category.icon"
                                 width="0.875rem"
                                 height="0.875rem"
                                 color="inherit transparent"
                            />
                            <span class="text">{{ category.label }}</span>
                        </div>
                        <div class="right-part grid grid-cols-12 gap-2">
                            <router-link v-for="(legend, lIdx) in state.legends"
                                         :key="lIdx"
                                         class="box col-span-4"
                                         :class="legend.name"
                                         :to="linkFormatter(category.name, legend.name)"
                            >
                                <span class="text">{{ countFormatter(category.name, legend.name) }}</span>
                            </router-link>
                        </div>
                    </div>
                </div>
                <div class="legend-wrapper">
                    <div v-for="(legend, index) in state.legends"
                         :key="index"
                         class="legend"
                         :class="legend.name"
                    >
                        <div class="box" />
                        <span class="text">{{ legend.label }}</span>
                    </div>
                </div>
            </template>
        </template>
    </widget-layout>
</template>

<style lang="postcss" scoped>
.simplified-trusted-advisor {
    min-height: 18.75rem;
}

.content-wrapper {
    margin-top: 1rem;
    .data-row {
        @apply text-gray-400;
        display: flex;
        font-size: 0.75rem;
        padding: 6px 0;
        .text {
            @apply text-gray-900;
            white-space: nowrap;
            margin-left: 0.25rem;
        }
    }
    .left-part {
        width: 55%;
        white-space: nowrap;
    }
    .right-part {
        width: 45%;
        .box {
            text-align: center;
            &:hover {
                text-decoration: underline;
            }
            &.error {
                @apply bg-coral-100 border border-red-500 text-red-500;
                .text {
                    @apply text-red-500;
                }
            }
            &.warning {
                @apply bg-yellow-100 border border-yellow-500 text-yellow-500;
            }
            &.ok {
                @apply bg-green-100 border border-green-500 text-green-500;
            }
        }
        .text {
            margin-left: 0;
        }
    }
}
.legend-wrapper {
    margin-top: 1rem;
    .legend {
        display: flex;
        padding: 0.25rem 0;
        &.error {
            .box {
                @apply bg-coral-100 border border-red-500;
            }
            .text {
                @apply text-red-500;
            }
        }
        &.warning {
            .box {
                @apply bg-yellow-100 border border-yellow-500;
            }
            .text {
                @apply text-yellow-500;
            }
        }
        &.ok {
            .box {
                @apply bg-green-100 border border-green-500;
            }
            .text {
                @apply text-green-500;
            }
        }
        .box {
            @apply border rounded-xs;
            width: 10px;
            height: 10px;
            margin-right: 0.375rem;
        }
        .text {
            @apply text-gray-700;
            font-size: 0.75rem;
            line-height: 1;
        }
    }
}
.no-data-wrapper {
    @apply flex w-full h-full flex-col justify-center items-center;
    .text {
        @apply mt-5 text-center text-primary2;
        font-weight: bold;
        font-size: 0.875rem;
        line-height: 1.6;
    }
}
</style>
