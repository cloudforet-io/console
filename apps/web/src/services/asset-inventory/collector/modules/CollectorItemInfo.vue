<template>
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
                <span class="plugin-name">{{ props.item.plugin.name }}</span>
                <span class="plugin-version">v{{ props.item.plugin.info.version }}</span>
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
                <span v-if="!storeState.schedule">{{ $t('INVENTORY.COLLECTOR.MAIN.NO_SCHEDULE') }}</span>
                <div v-else
                     class="scheduled"
                >
                    <p-i
                        name="ic_alarm-clock"
                        class="alarm-icon"
                        height="1.25rem"
                        width="1.25rem"
                        color="inherit"
                    />
                    <!-- TODO: apply translation later because of license issue  -->
                    <p class="description">
                        Scheduled
                        <span class="emphasis">
                            in 1 hr 30 mins
                        </span>
                    </p>
                </div>
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
                <span class="icon-fill-wrapper">
                    <!-- FIXME: Replace with real data-->
                    <p-i
                        name="ic_check"
                        class="check-icon"
                        height="1rem"
                        width="1rem"
                        color="inherit"
                    />
                </span>
                <span class="icon-fill-wrapper">
                    <p-i
                        name="ic_check"
                        class="check-icon"
                        height="1rem"
                        width="1rem"
                        color="inherit"
                    />
                </span>
                <span class="icon-fill-wrapper">
                    <p-i
                        name="ic_check"
                        class="check-icon"
                        height="1rem"
                        width="1rem"
                        color="inherit"
                    />
                </span>
                <span class="icon-fill-wrapper">
                    <p-i
                        name="ic_check"
                        class="check-icon"
                        height="1rem"
                        width="1rem"
                        color="inherit"
                    />
                </span>
                <span class="icon-fill-wrapper">
                    <p-i
                        name="ic_check"
                        class="check-icon"
                        height="1rem"
                        width="1rem"
                        color="inherit"
                    />
                </span>
            </div>
            <div class="to-history-detail">
                <router-link :to="props.item.detailLink">
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
            <p-toggle-button
                :value="state.toggleActive"
                :label="state.toggleStatus"
                :class="state.toggleActive ? 'toggle-active' : ''"
                @change-toggle="handleChangeToggle"
            />
            <p-button style-type="transparent">
                <p-i v-if="state.toggleActive"
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
                {{ state.toggleActive ? $t('INVENTORY.COLLECTOR.MAIN.EDIT_SCHEDULE') : $t('INVENTORY.COLLECTOR.MAIN.SET_SCHEDULE') }}
            </p-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PButton, PI, PLazyImg, PToggleButton,
} from '@spaceone/design-system';

import type { CollectorItemInfo } from '@/services/asset-inventory/collector/type';
import { COLLECTOR_ITEM_INFO_TYPE } from '@/services/asset-inventory/collector/type';
import { useCollectorPageStore } from '@/services/asset-inventory/store/collector-page-store';

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
const collectorPageState = collectorPageStore.$state;

const storeState = reactive({
    schedule: computed(() => collectorPageState.schedules.find((schedule) => schedule.collector_info.collector_id === props.item.collectorId)),
});

// TODO: will be changed schedule states after checking API
const state = reactive({
    toggleActive: computed(() => storeState.schedule?.collector_info.state === 'ENABLED'),
    toggleStatus: computed(() => (state.toggleActive ? 'ON' : 'OFF')),
    // nextSchedule: computed(() => {
    //     if (storeState.schedule) {
    //         const today = new Date();
    //         const schedulesArray = storeState.schedule.schedule.hours;
    //         const hour = today.getHours();
    //         return schedulesArray?.find((s) => Number(s) > hour || Math.min(Number(s)));
    //     }
    //     return undefined;
    // }),
    // diffSchedule: computed(() => {
    //     const today = new Date();
    //     const year = today.getFullYear();
    //     const month = today.getMonth() + 1;
    //     const day = today.getDate();
    //     let formattedDate = '';
    //
    //     if (state.nextSchedule) {
    //         formattedDate = `${year}-${month}-${day}`;
    //     } else {
    //         formattedDate = `${year}-${month}-${day + 1}`;
    //     }
    //
    //     const dueDate = new Date(`${formattedDate} ${state.nextSchedule}:00:00`);
    //
    //     const timeDiff = Math.abs(dueDate.getTime() - today.getTime());
    //
    //     const diffDay = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    //     const diffHour = Math.floor((timeDiff / (1000 * 60 * 60)) % 24);
    //     const diffMin = Math.floor((timeDiff / (1000 * 60)) % 60);
    //
    //     return { diffDay, diffHour, diffMin };
    // }),
});

/* Components */
const handleChangeToggle = () => {
    state.toggleActive = !state.toggleActive;
    state.toggleStatus = state.toggleActive ? 'ON' : 'OFF';
};
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

            .plugin-name {
                @apply truncate;
                flex: 1;
                max-width: 11rem;
            }

            .plugin-version {
                @apply text-label-sm text-gray-700;
            }
        }

        .jobs-wrapper {
            @apply flex;
            gap: 0.375rem;

            .icon-fill-wrapper {
                @apply relative bg-green-600 rounded;
                width: 1rem;
                height: 1rem;

                .check-icon {
                    @apply absolute text-white;
                    left: 50%;
                    top: 50%;
                    transform: translate(-35%, -50%);
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
