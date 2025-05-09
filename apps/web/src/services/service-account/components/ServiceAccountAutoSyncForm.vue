<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import dayjs from 'dayjs';
import { range } from 'lodash';

import {
    PJsonSchemaForm, PFieldTitle, PPaneLayout, PToggleButton, PFieldGroup,
} from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserStore } from '@/store/user/user-store';

import ServiceAccountAutoSyncMappingMethod
    from '@/services/service-account/components/ServiceAccountAutoSyncMappingMethod.vue';
import { useServiceAccountPageStore } from '@/services/service-account/stores/service-account-page-store';


const MAX_TIME_COUNT = 2;


const serviceAccountPageStore = useServiceAccountPageStore();
const serviceAccountPageFormState = serviceAccountPageStore.formState;
const appContextStore = useAppContextStore();
const userStore = useUserStore();

const state = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    timezone: computed<string|undefined>(() => userStore.state.timezone),
    language: computed<string|undefined>(() => userStore.state.language),
    scheduleHelpText: computed(() => i18n.t('INVENTORY.SERVICE_ACCOUNT.CREATE.TIMEZONE', { timezone: state.timezone })),
    isAutoSyncEnabled: computed(() => serviceAccountPageFormState.isAutoSyncEnabled),
    timezoneAppliedHours: computed<number[]>(() => {
        if (state.timezone === 'UTC') return serviceAccountPageFormState.scheduleHours;
        return serviceAccountPageStore.formState.scheduleHours.map((utcHour) => dayjs.utc()
            .hour(utcHour).tz(state.timezone)
            .get('hour')).sort((a, b) => a - b);
    }),
    additionalOptions: {},
    isScheduleHoursValid: computed(() => ((state.isAutoSyncEnabled) ? !!serviceAccountPageFormState.scheduleHours.length : true)),
    isAdditionalOptionsValid: false,
    isAllValid: computed(() => {
        if (!state.isAutoSyncEnabled) return true;
        return state.isScheduleHoursValid && (serviceAccountPageStore.getters.autoSyncAdditionalOptionsSchema ? state.isAdditionalOptionsValid : true);
    }),
});

const hoursMatrix: number[] = range(24);
const selectedUtcHoursSet = new Set<number>();

const updateSelectedHours = () => {
    const hours: number[] = Array.from(selectedUtcHoursSet.values());
    serviceAccountPageStore.$patch((_state) => {
        _state.formState.scheduleHours = hours;
    });
};

const handleClickHour = (hour: number) => {
    let utcHour: number;
    if (state.timezone === 'UTC') utcHour = hour;
    else {
        utcHour = dayjs().tz(state.timezone)
            .hour(hour).utc()
            .get('hour');
    }
    if (selectedUtcHoursSet.has(utcHour)) {
        selectedUtcHoursSet.delete(utcHour);
    } else if (Array.from(selectedUtcHoursSet.values()).length < MAX_TIME_COUNT) {
        selectedUtcHoursSet.add(utcHour);
    }

    updateSelectedHours();
};
const handleAdditionalOptionsValidate = (isValid:boolean) => {
    state.isAdditionalOptionsValid = state.isAutoSyncEnabled ? isValid : true;
};


const handleChangeToggle = (e:boolean) => {
    serviceAccountPageStore.$patch((_state) => {
        _state.formState.isAutoSyncEnabled = e;
    });
};

watch(() => state.additionalOptions, (additionalOptions) => {
    serviceAccountPageStore.setFormState('additionalOptions', additionalOptions);
});

watch(() => state.isAllValid, (isAllValid) => {
    serviceAccountPageStore.$patch((_state) => {
        _state.formState.isAutoSyncFormValid = isAllValid;
    });
});
</script>

<template>
    <div class="service-account-auto-sync-form">
        <div class="auto-sync-toggle">
            <p-toggle-button :value="state.isAutoSyncEnabled"
                             show-state-text
                             position="left"
                             @change-toggle="handleChangeToggle"
            /><p>
                {{ $t('IDENTITY.SERVICE_ACCOUNT.AUTO_SYNC.MAIN_DESCRIPTION', {
                    provider: serviceAccountPageStore.getters.selectedProviderItem.label,
                }) }}
            </p>
        </div>
        <div v-if="state.isAutoSyncEnabled">
            <service-account-auto-sync-mapping-method mode="UPDATE" />
            <div v-if="serviceAccountPageStore.getters.autoSyncAdditionalOptionsSchema">
                <p-field-title label="Additional Options"
                               size="lg"
                               class="mb-2"
                />
                <p-pane-layout class="p-4 mb-8">
                    <p-json-schema-form v-if="serviceAccountPageStore.getters.autoSyncAdditionalOptionsSchema"
                                        class="p-json-schema-form"
                                        :form-data.sync="state.additionalOptions"
                                        :schema="serviceAccountPageStore.getters.autoSyncAdditionalOptionsSchema"
                                        :language="state.language"
                                        @validate="handleAdditionalOptionsValidate"
                    />
                </p-pane-layout>
            </div>
            <p-field-title :label="$t('IDENTITY.SERVICE_ACCOUNT.AUTO_SYNC.HOURLY_SYNC_SCHEDULE')"
                           size="lg"
                           class="mb-1"
            />
            <p-field-group class="hourly-schedule-field-group"
                           :help-text="state.scheduleHelpText"
            >
                <div class="hourly-schedule-wrapper">
                    <span v-for="(hour) in hoursMatrix"
                          :key="hour"
                          class="time-block"
                          :class="{
                              active: !!state.timezoneAppliedHours.includes(hour)
                          }"
                          @click="handleClickHour(hour)"
                    >
                        {{ hour }}
                    </span>
                </div>
            </p-field-group>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.service-account-auto-sync-form {
    margin: 0 1rem;

    .auto-sync-toggle {
        @apply text-paragraph-lg flex items-center gap-4;
        margin-bottom: 1.5rem;
    }

    /* custom design-system component - p-json-schema-form */
    :deep(.p-json-schema-form) {

        .p-field-group {
            margin-bottom: 1.5rem;
            max-width: 30rem;
            width: 100%;
        }

        .p-text-input {
            width: 100%;
        }
    }

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
