<script setup lang="ts">
import { computed, reactive } from 'vue';

import dayjs from 'dayjs';
import { range } from 'lodash';

import { PFieldGroup, PFieldTitle } from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { useUserStore } from '@/store/user/user-store';

import ServiceAccountAutoSyncMappingMethod
    from '@/services/service-account/components/ServiceAccountAutoSyncMappingMethod.vue';
import { useServiceAccountPageStore } from '@/services/service-account/stores/service-account-page-store';

const serviceAccountPageStore = useServiceAccountPageStore();
const serviceAccountPageFormState = serviceAccountPageStore.formState;
const userStore = useUserStore();
const hoursMatrix: number[] = range(24);

const state = reactive({
    timezone: computed<string|undefined>(() => userStore.state.timezone),
    scheduleHelpText: computed(() => i18n.t('INVENTORY.SERVICE_ACCOUNT.CREATE.TIMEZONE', { timezone: state.timezone })),
    timezoneAppliedHours: computed<number[]>(() => {
        if (state.timezone === 'UTC') return serviceAccountPageFormState.scheduleHours;
        return serviceAccountPageStore.formState.scheduleHours.map((utcHour) => dayjs.utc()
            .hour(utcHour).tz(state.timezone)
            .get('hour')).sort((a, b) => a - b);
    }),
});


</script>

<template>
    <div class="service-account-auto-sync-detail">
        <p class="mb-6">
            {{ $t('IDENTITY.SERVICE_ACCOUNT.AUTO_SYNC.MAIN_DESCRIPTION', {
                provider: serviceAccountPageStore.getters.selectedProviderItem.label,
            }) }}
        </p>

        <service-account-auto-sync-mapping-method v-if="serviceAccountPageStore.getters.isOriginAutoSyncEnabled"
                                                  mode="READ"
        />

        <div v-if="serviceAccountPageStore.getters.isOriginAutoSyncEnabled">
            <p-field-title :label="$t('IDENTITY.SERVICE_ACCOUNT.AUTO_SYNC.HOURLY_SYNC_SCHEDULE')"
                           size="lg"
                           class="mb-1"
            />
            <p-field-group class="hourly-schedule-field-group"
                           :help-text="state.scheduleHelpText"
            >
                <div class="hourly-schedule-wrapper is-read-mode">
                    <span v-for="(hour) in hoursMatrix"
                          :key="hour"
                          class="time-block"
                          :class="{
                              active: !!state.timezoneAppliedHours.includes(hour)
                          }"
                    >
                        {{ hour }}
                    </span>
                </div>
            </p-field-group>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.service-account-auto-sync-detail {
    padding-right: 1rem;
    .hourly-schedule-field-group {
        margin-bottom: 1.875rem;

        .hourly-schedule-wrapper {
            display: grid;
            gap: 0.5rem;
            grid-template-columns: repeat(12, 2rem);
            grid-template-rows: auto;

            @screen mobile {
                grid-template-columns: repeat(4, 2rem);
            }

            &.is-read-mode {
                gap: 0.25rem;
                .time-block {
                    @apply bg-gray-100 text-gray-100 border-none cursor-default;
                    &.active {
                        @apply bg-blue-200 text-blue-600;
                    }
                }
            }

            .time-block {
                @apply flex items-center justify-center bg-white border border-gray-300 rounded-xs box-border cursor-pointer;
                height: 2rem;
                font-size: 0.875rem;
                &.active {
                    @apply bg-blue-600 text-white;
                }
            }
        }
    }
}
</style>
