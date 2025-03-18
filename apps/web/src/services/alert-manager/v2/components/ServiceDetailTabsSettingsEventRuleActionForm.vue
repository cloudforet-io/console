<script setup lang="ts">
import { reactive, watch } from 'vue';

import { isUndefined, omitBy } from 'lodash';

import type { EventRuleActionsType } from '@/schema/alert-manager/event-rule/type';

import ServiceDetailTabsSettingsEventRuleActionAlert
    from '@/services/alert-manager/v2/components/ServiceDetailTabsSettingsEventRuleActionAlert.vue';
import ServiceDetailTabsSettingsEventRuleActionAsset
    from '@/services/alert-manager/v2/components/ServiceDetailTabsSettingsEventRuleActionAsset.vue';
import ServiceDetailTabsSettingsEventRuleActionService
    from '@/services/alert-manager/v2/components/ServiceDetailTabsSettingsEventRuleActionService.vue';

const emit = defineEmits<{(e: 'change-form', form: EventRuleActionsType): void}>();
const state = reactive({
    serviceSettings: {
        change_service: undefined,
    } as EventRuleActionsType,
    assetSettings: {
        match_asset: undefined,
        merge_asset_labels: undefined,
    } as EventRuleActionsType,
    alertSettings: {
        change_title: undefined,
        change_status: undefined,
        change_urgency: undefined,
        change_escalation_policy: undefined,
        set_labels: undefined,
        add_additional_info: undefined,
    } as EventRuleActionsType,
});

const handleChangeServiceForm = (form: EventRuleActionsType) => {
    state.serviceSettings = form;
};
const handleChangeAssetForm = (form: EventRuleActionsType) => {
    state.assetSettings = form;
};
const handleChangeAlertForm = (form: EventRuleActionsType) => {
    state.alertSettings = form;
};

watch(() => state, () => {
    const merged = {
        ...state.serviceSettings,
        ...state.assetSettings,
        ...state.alertSettings,
    };

    emit('change-form', omitBy(merged, isUndefined));
}, { deep: true });
</script>

<template>
    <div class="service-detail-tabs-settings-event-rule-action-form">
        <service-detail-tabs-settings-event-rule-action-service class="section"
                                                                @change-form="handleChangeServiceForm"
        />
        <div v-if="!state.serviceSettings.change_service">
            <service-detail-tabs-settings-event-rule-action-asset class="section"
                                                                  @change-form="handleChangeAssetForm"
            />
            <service-detail-tabs-settings-event-rule-action-alert class="section"
                                                                  @change-form="handleChangeAlertForm"
            />
        </div>
    </div>
</template>

<style scoped lang="postcss">
.service-detail-tabs-settings-event-rule-action-form {
    @apply bg-gray-100;
    .section {
        @apply flex flex-col gap-2 p-3 bg-white border-t-4 border-b-4 border-gray-100 rounded-xl;
        border-bottom-left-radius: 0.5rem;
        border-bottom-right-radius: 0.5rem;
        &:last-child {
            border-bottom: none;
        }
        &:first-child {
            border-top: none;
        }
    }
    .is-mobile {
        .field-group {
            @apply flex flex-col;
            margin-bottom: 0;
            & + .field-group {
                @apply mt-3 pt-3 border-t border-gray-200;
            }
        }
        .field-title {
            @apply flex;
            padding-top: 0.375rem;
            padding-bottom: 0.375rem;
        }
        .change-status {
            @apply flex flex-col;
        }
        .input-wrapper {
            @apply flex flex-col;
            width: 100%;
        }
        .asset-dropdown {
            @apply relative;
            .dropdown-button-wrapper {
                @apply absolute;
                width: 100%;
            }
        }
        .contents-wrapper {
            @apply flex flex-col;
        }
        .toggle-wrapper {
            min-width: 12.5rem;
            height: 2rem;
            &.match-asset {
                @apply w-full;
                min-width: unset;
            }
        }
    }
}
</style>
