<template>
    <widget-layout class="simplified-trusted-advisor">
        <template v-show="awsProvider" #title>
            <div class="title">
                <span :style="{ color: awsProvider ? awsProvider.color : '' }">AWS </span>
                <span>{{ $t('COMMON.WIDGETS.TRUSTED_ADVISOR.TITLE') }}</span>
            </div>
        </template>
        <template v-show="awsProvider">
            <div v-if="loading" />
            <div v-else-if="!data" class="no-data-wrapper">
                <img src="@/assets/images/illust_star.svg">
                <div class="text">
                    {{ $t('COMMON.WIDGETS.TRUSTED_ADVISOR.NO_DATA') }}
                </div>
            </div>
            <template v-else>
                <div class="content-wrapper">
                    <div v-for="(category, cIdx) in categories" :key="cIdx" class="data-row">
                        <div class="left-part">
                            <p-i :name="category.icon"
                                 width="0.875rem" height="0.875rem"
                                 color="inherit transparent"
                            />
                            <span class="text">{{ category.label }}</span>
                        </div>
                        <div class="right-part grid grid-cols-12 gap-2">
                            <router-link v-for="(legend, lIdx) in legends" :key="lIdx"
                                         class="box col-span-4" :class="legend.name"
                                         :to="linkFormatter(category.name, legend.name)"
                            >
                                <span class="text">{{ countFormatter(category.name, legend.name) }}</span>
                            </router-link>
                        </div>
                    </div>
                </div>
                <div class="legend-wrapper">
                    <div v-for="(legend, index) in legends" :key="index"
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

<script lang="ts">
/* eslint-disable camelcase */
import { findKey } from 'lodash';

import {
    computed, reactive, toRefs,
    ComponentRenderProxy, getCurrentInstance,
} from '@vue/composition-api';

import { PI } from '@spaceone/design-system';

import WidgetLayout from '@/views/common/components/layouts/WidgetLayout.vue';

import { QueryHelper } from '@/lib/query';
import { SpaceConnector } from '@/lib/space-connector';
import { QueryStoreFilter } from '@/lib/query/type';
import { green, red, yellow } from '@/styles/colors';
import { store } from '@/store';


const TRUSTED_ADVISER = 'TrustedAdvisor';
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

export default {
    name: 'SimplifiedTrustedAdvisor',
    components: {
        PI,
        WidgetLayout,
    },
    props: {
        projectId: {
            type: String,
            default: undefined,
        },
    },
    setup(props) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const queryHelper = new QueryHelper();

        const state = reactive({
            loading: false,
            trustedAdvisorId: computed<string>(() => {
                const cloudServiceTypes = vm.$store.state.resource.cloudServiceType.items;
                const trustedAdvisorId = findKey(cloudServiceTypes, { name: TRUSTED_ADVISER });
                return trustedAdvisorId || '';
            }),
            legends: computed(() => ([
                {
                    name: STATUS.error,
                    label: vm.$t('COMMON.WIDGETS.TRUSTED_ADVISOR.LABEL_ERROR'),
                    color: ERROR_COLOR,
                },
                {
                    name: STATUS.warning,
                    label: vm.$t('COMMON.WIDGETS.TRUSTED_ADVISOR.LABEL_WARNING'),
                    color: WARNING_COLOR,
                },
                {
                    name: STATUS.ok,
                    label: vm.$t('COMMON.WIDGETS.TRUSTED_ADVISOR.LABEL_OK'),
                    color: OK_COLOR,
                },
            ])),
            categories: computed(() => ([
                {
                    label: vm.$t('COMMON.WIDGETS.TRUSTED_ADVISOR.LABEL_COST_OPTIMIZATION'),
                    name: CATEGORY.costOptimizing,
                    icon: 'ic_cost_optimization',
                },
                {
                    label: vm.$t('COMMON.WIDGETS.TRUSTED_ADVISOR.LABEL_PERFORMANCE'),
                    name: CATEGORY.performance,
                    icon: 'ic_performance',
                },
                {
                    label: vm.$t('COMMON.WIDGETS.TRUSTED_ADVISOR.LABEL_SECURITY'),
                    name: CATEGORY.security,
                    icon: 'ic_security',
                },
                {
                    label: vm.$t('COMMON.WIDGETS.TRUSTED_ADVISOR.LABEL_FAULT_TOLERANCE'),
                    name: CATEGORY.faultTolerance,
                    icon: 'ic_fault_tolerance',
                },
                {
                    label: vm.$t('COMMON.WIDGETS.TRUSTED_ADVISOR.LABEL_SERVICE_LIMITS'),
                    name: CATEGORY.serviceLimits,
                    icon: 'ic_service_limits',
                },
            ])),
            data: null as any,
            awsProvider: computed(() => store.state.resource.provider.items.aws),
        });

        const linkFormatter = (category, status) => {
            if (!state.trustedAdvisorId) return '';

            const filters: QueryStoreFilter[] = [];
            filters.push({ k: 'project_id', o: '=', v: props.projectId });
            filters.push({ k: 'data.status', o: '=', v: status });
            filters.push({ k: 'data.category', o: '=', v: category });

            return {
                name: 'cloudServicePage',
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
                state.data = null;
                console.error(e);
            } finally {
                state.loading = false;
            }
        };

        const init = () => {
            getData();
        };
        init();

        return {
            ...toRefs(state),
            countFormatter,
            linkFormatter,
        };
    },
};
</script>

<style lang="postcss" scoped>
@define-mixin data-box-theme $bg-color, $color {
    color: $color;
    background-color: $bg-color;
    border: 1px solid $color;
    &:hover {
        text-decoration: underline;
    }
    &.error .text {
        color: $color;
    }
}

@define-mixin legend-theme $bg-color, $border-color, $text-color {
    .box {
        background-color: $bg-color;
        border: 1px solid $border-color;
    }
    .text {
        color: $text-color;
    }
}

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
    }
    .right-part {
        width: 45%;
        .box {
            text-align: center;
            &.error {
                @mixin data-box-theme theme('colors.coral.100'), theme('colors.red.500');
            }
            &.warning {
                @mixin data-box-theme theme('colors.yellow.100'), theme('colors.yellow.500');
            }
            &.ok {
                @mixin data-box-theme theme('colors.green.100'), theme('colors.green.500');
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
            @mixin legend-theme theme('colors.coral.100'), theme('colors.red.500'), theme('colors.red.500');
        }
        &.warning {
            @mixin legend-theme theme('colors.yellow.100'), theme('colors.yellow.500');
        }
        &.ok {
            @mixin legend-theme theme('colors.green.100'), theme('colors.green.500');
        }
        .box {
            @apply border;
            width: 10px;
            height: 10px;
            border-radius: 0.125rem;
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
