<template>
    <div>
        <div class="collector-item">
            <div v-if="props.type === COLLECTOR_ITEM_INFO_TYPE.PLUGIN"
                 class="info-item"
            >
                <p class="info-label">
                    {{ props.label }}
                </p>
                <div class="plugin">
                    <p-lazy-img :src="props.item.plugin.icon"
                                width="1.25rem"
                                height="1.25rem"
                    />
                    <div class="plugin-info">
                        <span class="plugin-name">{{ state.plugin.name }}</span>
                        <span class="plugin-version">{{ state.plugin.version }}</span>
                    </div>
                </div>
            </div>
            <div
                v-else-if="props.type === COLLECTOR_ITEM_INFO_TYPE.STATUS"
                class="info-item"
            >
                <p class="info-label">
                    {{ props.label }}
                </p>
                <div class="label-description">
                    <div v-if="props.item.schedule">
                        <div v-if="props.item.schedule.hours && props.item.schedule.hours.length > 0"
                             class="scheduled"
                        >
                            <p-i
                                name="ic_alarm-clock"
                                class="alarm-icon"
                                height="1.25rem"
                                width="1.25rem"
                                color="inherit"
                            />
                            <p class="description">
                                {{ $t('INVENTORY.COLLECTOR.MAIN.SCHEDULED') }}
                                <span class="emphasis">
                                    {{ $t('INVENTORY.COLLECTOR.MAIN.SCHEDULED_TIME', {hr: state.diffSchedule.diffHour, m: state.diffSchedule.diffMin }) }}
                                </span>
                            </p>
                        </div>
                        <span v-else-if="props.item.recentJobAnalyze[props.item.recentJobAnalyze.length - 1].status === JOB_STATE.IN_PROGRESS">
                            {{ $t('INVENTORY.COLLECTOR.MAIN.IN_PROGRESS') }}
                        </span>
                        <span v-else>
                            {{ $t('INVENTORY.COLLECTOR.MAIN.NO_SCHEDULE') }}
                        </span>
                    </div>
                    <span v-else>
                        {{ $t('INVENTORY.COLLECTOR.MAIN.NO_SCHEDULE') }}
                    </span>
                </div>
            </div>
            <div
                v-else-if="props.type === COLLECTOR_ITEM_INFO_TYPE.JOBS"
                class="info-item"
            >
                <p class="info-label">
                    {{ props.label }}
                </p>
                <div class="jobs-wrapper">
                    <div v-for="(jobStatus, index) in props.item.recentJobAnalyze"
                         :key="`job-item-${index}`"
                         class="jobs-contents"
                         @click.stop
                    >
                        <p-tooltip v-if="jobStatus.status === JOB_STATE.SUCCESS"
                                   class="icon-fill-wrapper success"
                                   :contents="$t('INVENTORY.COLLECTOR.MAIN.JOB_SUCCESS', {date: 'yyyy-mm-dd hh:mm:ss'})"
                                   position="top"
                        >
                            <router-link :to="{ name: ASSET_INVENTORY_ROUTE.COLLECTOR.HISTORY.JOB._NAME, params: { jobId: jobStatus.job_id} }">
                                <p-i
                                    name="ic_check"
                                    class="icon success"
                                    height="1rem"
                                    width="1rem"
                                    color="inherit"
                                />
                            </router-link>
                        </p-tooltip>
                        <p-tooltip v-else-if="jobStatus.status === JOB_STATE.IN_PROGRESS"
                                   class="icon-fill-wrapper progress"
                                   :contents="$t('INVENTORY.COLLECTOR.MAIN.JOB_PROGRESS')"
                                   position="top"
                        >
                            <p-i
                                name="ic_settings-filled"
                                class="icon progress"
                                height="1rem"
                                width="1rem"
                                color="inherit"
                            />
                        </p-tooltip>
                        <p-tooltip v-else-if="jobStatus.status === JOB_STATE.NONE"
                                   class="icon-fill-wrapper none"
                                   :contents="$t('INVENTORY.COLLECTOR.MAIN.JOB_NONE')"
                                   position="top"
                        />
                        <p-tooltip v-else
                                   class="icon-fill-wrapper error"
                                   :contents="$t('INVENTORY.COLLECTOR.MAIN.JOB_ERROR', {date: 'yyyy-mm-dd hh:mm:ss'})"
                                   position="top"
                        />
                    </div>
                </div>
                <div class="to-history-detail">
                    <router-link :to="props.item.historyLink">
                        <span>{{ $t('INVENTORY.COLLECTOR.MAIN.VIEW_HISTORY_DETAIL') }}</span>
                        <p-i
                            name="ic_chevron-right"
                            width="0.75rem"
                            height="0.75rem"
                            color="inherit transparent"
                        />
                    </router-link>
                </div>
            </div>
            <div
                v-else-if="props.type === COLLECTOR_ITEM_INFO_TYPE.SCHEDULE"
                class="info-item"
            >
                <p class="info-label">
                    {{ props.label }}
                </p>
                <div @click.stop="handleChangeToggle">
                    <p-toggle-button
                        :value="state.isScheduleActivated"
                        :label="state.isScheduleActivated ? 'ON' : 'OFF'"
                        :class="state.isScheduleActivated ? 'toggle-active' : ''"
                        @change-toggle="handleChangeToggle"
                    />
                </div>
                <p-button style-type="transparent"
                          @click.stop="handleClickSchedule"
                >
                    <p-i v-if="state.isScheduleActivated"
                         name="ic_edit"
                         height="0.75rem"
                         width="0.75rem"
                         color="inherit"
                         class="icon-schedule"
                    />
                    <p-i v-else
                         name="ic_settings-filled"
                         height="0.75rem"
                         width="0.75rem"
                         color="inherit"
                         class="icon-schedule"
                    />
                    {{ state.isScheduleActivated ? $t('INVENTORY.COLLECTOR.MAIN.EDIT_SCHEDULE') : $t('INVENTORY.COLLECTOR.MAIN.SET_SCHEDULE') }}
                </p-button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import {
    PButton, PI, PLazyImg, PToggleButton, PTooltip,
} from '@spaceone/design-system';
import dayjs from 'dayjs';


import { store } from '@/store';
import { i18n as i18nTranslator } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useCollectorPageStore } from '@/services/asset-inventory/collector/collector-main/collector-page-store';
import type { CollectorItemInfo } from '@/services/asset-inventory/collector/collector-main/type';
import { COLLECTOR_ITEM_INFO_TYPE, JOB_STATE } from '@/services/asset-inventory/collector/collector-main/type';
import type { CollectorUpdateParameter } from '@/services/asset-inventory/collector/model';
import {
    COLLECTOR_SCHEDULE_STATE,
} from '@/services/asset-inventory/collector/model';
import { useCollectorFormStore } from '@/services/asset-inventory/collector/shared/collector-forms/collector-form-store';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';


interface Props {
    label: string;
    item?: CollectorItemInfo;
    type: string;
}

const props = withDefaults(defineProps<Props>(), {
    label: '',
    item: undefined,
    type: '',
});

const collectorPageStore = useCollectorPageStore();
const collectorFormStore = useCollectorFormStore();

const storeState = reactive({
    timezone: computed(() => store.state.user.timezone),
});

const state = reactive({
    isScheduleActivated: false,
    diffSchedule: computed(() => {
        if (props.item.schedule) {
            const current = dayjs().utc();

            const userCurrentTime = dayjs.tz(current, storeState.timezone);
            const hours = props.item.schedule.hours ?? [];
            const nextScheduledHour = hours.sort((a, b) => a - b).find((num) => num > userCurrentTime.hour());

            const nextScheduledTime = current.set('h', nextScheduledHour || 0).set('m', 0);
            const timeDiff = nextScheduledTime.diff(current, 'm');
            return { diffHour: Math.floor(timeDiff / 60), diffMin: timeDiff % 60 };
        }
        return { diffHour: 0, diffMin: 0 };
    }),
    plugin: computed(() => {
        const plugin = props.item?.plugin;
        return { name: plugin.name, version: plugin.info.version };
    }),
});

/* Components */
const handleChangeToggle = async (value) => {
    if (Object.keys(value).length > 0) return;
    try {
        state.isScheduleActivated = !state.isScheduleActivated;
        const params: CollectorUpdateParameter = {
            collector_id: props.item.collectorId,
            schedule: {
                ...props.item.schedule,
                state: state.isScheduleActivated ? 'ENABLED' : 'DISABLED',
            },
        };
        const response = await collectorPageStore.updateCollectorSchedule(params);
        await collectorFormStore.setOriginCollector(response);
        showSuccessMessage(i18nTranslator.t('INVENTORY.COLLECTOR.ALT_S_UPDATE_SCHEDULE'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18nTranslator.t('INVENTORY.COLLECTOR.ALT_E_UPDATE_SCHEDULE'));
    }
};
const handleClickSchedule = () => {
    collectorPageStore.setSelectedCollector(props.item.collectorId);
    collectorPageStore.$patch({
        visibleScheduleModal: true,
    });
};

/* Watcher */
watch(() => props.item, (value) => {
    if (props.type === COLLECTOR_ITEM_INFO_TYPE.SCHEDULE) {
        state.isScheduleActivated = value.schedule ? value.schedule.state === COLLECTOR_SCHEDULE_STATE.ENABLED : false;
    }
}, { immediate: true });
</script>

<style scoped lang="postcss">
.collector-item {
    .info-item {
        @apply flex flex-col;
        gap: 0.5rem;

        .info-label {
            @apply text-label-sm text-gray-500;
        }

        .label-description {
            @apply text-label-md text-gray-700;

            .scheduled {
                @apply flex items-center;
                gap: 0.25rem;

                .emphasis {
                    @apply font-bold text-gray-900 not-italic;
                }
            }
        }

        .plugin {
            @apply flex items-center text-label-md;
            gap: 0.25rem;

            .plugin-info {
                @apply flex items-center;
                max-width: 14rem;
                gap: 0.25rem;

                .plugin-name {
                    @apply truncate;
                    flex: 1;
                }

                .plugin-version {
                    @apply truncate text-label-sm text-gray-700;
                    max-width: 3.5rem;
                }
            }
        }

        .jobs-wrapper {
            @apply flex;
            gap: 0.375rem;

            .jobs-contents {
                @apply flex;
                width: 1rem;
                height: 1rem;

                .icon-fill-wrapper {
                    @apply relative rounded box-border;
                    width: 1rem;
                    height: 1rem;

                    &:hover {
                        @apply cursor-default;
                    }

                    &.success {
                        @apply bg-green-600;

                        &:hover {
                            @apply border border-green-700 cursor-pointer;
                        }
                    }

                    &.error {
                        @apply bg-red-500;

                        &::before {
                            @apply absolute text-white text-label-md;
                            content: '!';
                            top: 50%;
                            left: 50%;
                            transform: translate(-35%, -50%);
                        }

                        &:hover {
                            @apply border border-red-700;
                        }
                    }

                    &.progress {
                        @apply bg-gray-500;

                        &:hover {
                            @apply border border-gray-700;

                            .progress {
                                top: -0.065rem;
                                left: -0.065rem;
                                animation: rotate 6s linear infinite;
                                transform-origin: 50% 50%;

                                @keyframes rotate {
                                    100% {
                                        transform: rotate(360deg);
                                    }
                                }
                            }
                        }
                    }

                    &.none {
                        @apply bg-gray-200;
                    }

                    .icon {
                        @apply absolute text-white;

                        &.success {
                            @apply text-white;
                            top: 50%;
                            left: 50%;
                            transform: translate(-35%, -50%);
                        }

                        &.progress {
                            top: 0;
                            left: 0;
                        }
                    }
                }
            }
        }

        .to-history-detail {
            @apply text-label-sm text-blue-700;
        }

        /* FIXME: Reducing dependencies on the design system */

        /* custom design-system component - p-toggle-button */
        :deep(.p-toggle-button) {
            .label {
                @apply text-gray-400;
            }
            &.toggle-active {
                .label {
                    @apply text-blue-600;
                }
            }
        }

        /* FIXME: Reducing dependencies on the design system */

        /* custom design-system component - p-button */
        :deep(.p-button) {
            @apply text-label-sm text-blue-600 font-normal;
            width: 5.75rem;
            min-width: initial;
            height: 0.875rem;
            padding: 0;
            &:hover {
                background-color: initial;
            }
            .icon-schedule {
                @apply text-blue-600;
            }
        }
    }
}
</style>
