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
            <span>{{ $t('INVENTORY.COLLECTOR.MAIN.NO_SCHEDULE') }}</span>
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
import { reactive } from 'vue';

import {
    PButton, PI, PLazyImg, PToggleButton,
} from '@spaceone/design-system';

import type { CollectorItemInfo } from '@/services/asset-inventory/collector/type';
import { COLLECTOR_ITEM_INFO_TYPE } from '@/services/asset-inventory/collector/type';

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

const state = reactive({
    toggleActive: false,
    toggleStatus: 'OFF',
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
