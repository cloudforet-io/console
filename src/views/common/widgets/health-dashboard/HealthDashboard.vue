<template>
    <p-widget-layout ref="widgetRef" class="health-dashboard" :title="$t('COMMON.WIDGETS.HEALTH_DASHBOARD_TITLE')"
                     :help="$t('COMMON.WIDGETS.HEALTH_DASHBOARD_HELP')"
    >
        <template #default>
            <div v-if="loading" class="flex items-center overflow-hidden">
                <p-skeleton width="2rem" height="2rem" class="mr-4" />
                <div class="grid grid-cols-1 gap-1 w-full">
                    <p-skeleton width="80%" height="0.625rem" />
                    <p-skeleton width="100%" height="0.625rem" />
                </div>
            </div>
            <div v-else-if="data.length === 0" class="empty-content">
                <div class="info-text">
                    <p>
                        {{$t('COMMON.WIDGETS.HEALTH_DASHBOARD_DESC_1')}}
                    </p>
                    <br>
                    <p>
                        {{$t('COMMON.WIDGETS.HEALTH_DASHBOARD_DESC_2')}}<br>
                        <a target="_blank" href="mailto:support@spaceone.dev">support@spaceone.dev</a>
                    </p>
                </div>
                <div class="background-wrapper">
                    <img class="logo" src="@/assets/icons/ic_provider_aws.svg">
                    <p class="text">
                        {{$t('COMMON.WIDGETS.HEALTH_DASHBOARD_DESC_3')}}
                    </p>
                </div>
            </div>
            <p-grid-layout v-else :items="data"
                           row-gap="0.5rem" column-gap="0"
                           :fix-column="1" card-height="auto"
                           card-min-width="0"
                           :card-class="() => []"
            >
                <template #card="{item, index}">
                    <p-selectable-item theme="card" @click="onItemClick(item.reference.external_link)">
                        <template #side>
                            &zwnj;
                        </template>
                        <template #contents>
                            <div v-tooltip.bottom="{content: item.group, delay: {show: 500}}" class="group-name">
                                {{ item.eventTypeCode }}
                                <p-i name="ic_external-link" width=".7rem" height=".7rem" />
                            </div>
                            <div v-tooltip.bottom="{content: item.name, delay: {show: 500}}" class="name">
                                <p-i v-if="item.eventTypeCategory === 'issue' || item.eventTypeCategory === 'investigation'" name="ic_wrench" width=".8rem"
                                     height=".8rem"
                                />
                                <p-i v-else name="ic_notification" width=".8rem"
                                     height=".8rem"
                                />
                                {{ item.eventTypeCategory }} / {{ item.region }}
                            </div>
                        </template>
                        <template #extra>
                            <div class="items-center">
                                <div v-tooltip.bottom="{content: item.name, delay: {show: 500}}" class="Affected Resource Entities">
                                    <p class="count">
                                        {{ Math.abs(item.count) }}
                                    </p>
                                </div>
                                <p class="count-info">
                                    affected
                                </p>
                            </div>
                        </template>
                    </p-selectable-item>
                </template>
            </p-grid-layout>
        </template>
    </p-widget-layout>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import { reactive, toRefs, UnwrapRef } from '@vue/composition-api';

import PWidgetLayout from '@/components/organisms/layouts/widget-layout/PWidgetLayout.vue';
import PI from '@/components/atoms/icons/PI.vue';
import PGridLayout from '@/components/molecules/layouts/grid-layout/PGridLayout.vue';
import PSelectableItem from '@/components/molecules/selectable-item/PSelectableItem.vue';
import PSkeleton from '@/components/atoms/skeletons/PSkeleton.vue';

import { SpaceConnector } from '@/lib/space-connector';

interface Data {
    eventTypeCode: string;
    eventTypeCategory: string;
    region: string;
    count: number;
}

interface StateInterface {
    data: Data[];
    loading: boolean;
}

interface Props {
    projectId: string;
}

export default {
    name: 'HealthDashboard',
    components: {
        PWidgetLayout,
        PI,
        PGridLayout,
        PSelectableItem,
        PSkeleton,
    },
    props: {
        projectId: {
            type: String,
            default: '',
        },
    },
    setup(props: Props) {
        const state: UnwrapRef<StateInterface> = reactive({
            data: [],
            loading: true,
        });

        const getData = async (): Promise<void> => {
            state.loading = true;
            state.data = [];
            try {
                const res = await SpaceConnector.client.addOns.awsHealth.list({
                    project_id: props.projectId,
                    date_subtractor: 10,
                });
                state.data = res.logs.map(item => ({
                    eventTypeCode: item.eventTypeCode,
                    eventTypeCategory: item.eventTypeCategory,
                    region: item.region,
                    count: item.count,
                    ...item,
                }));
            } catch (e) {
                console.error(e);
            } finally {
                state.loading = false;
            }
        };

        setTimeout(() => {
            getData();
        }, 1000);

        return {
            ...toRefs(state),
            onItemClick(item) {
                window.open(item);
            },
        };
    },
};
</script>

<style lang="postcss" scoped>
.health-dashboard {
    background-color: rgba(theme('colors.white'), 0.8);
    &::v-deep {
        .widget-contents {
            overflow-y: auto;
        }
        .title {
            @apply text-sm leading-normal;
        }
        .top {
             @apply mt-6;
        }
    }

    .empty-content {
        position: relative;
        height: 100%;

        .info-text {
            @apply text-gray-900;
            position: absolute;
            top: 0;
            z-index: 1;
            font-size: 0.875rem;
            line-height: 120%;
            a {
                @apply text-blue-600;
                text-decoration: underline;
            }
        }
        .background-wrapper {
            position: absolute;
            display: flex;
            width: 100%;
            height: 100%;
            left: 0;
            top: 0;
            flex-direction: column;
            justify-content: center;
            .logo {
                opacity: 0.3;
                width: 5.5rem;
                margin: 0 auto;
            }
            .text {
                @apply text-gray-300 text-center;
                font-size: 1rem;
            }
        }
    }
}
.group-name {
    @apply text-base font-bold text-blue-700 mb-1 truncate leading-tight;
}
.name {
    @apply text-xs text-gray truncate leading-tight;
}
.count {
    @apply text-lg text-center font-bold;
}

.count-info {
    @apply text-gray-400;
    font-size: .75rem;
}
.help {
    display: inline-flex;
    cursor: help;
}
</style>
