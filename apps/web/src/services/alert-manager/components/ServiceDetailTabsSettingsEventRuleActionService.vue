<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import {
    PFieldGroup,
    PFieldTitle,
    PLink,
    PSelectDropdown,
    PToggleButton,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import type { EventRuleModel } from '@/schema/alert-manager/event-rule/model';
import type {
    EventRuleActionsType,
} from '@/schema/alert-manager/event-rule/type';
import type { ServiceModel } from '@/schema/alert-manager/service/model';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';

import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/routes/route-constant';
import { useServiceDetailPageStore } from '@/services/alert-manager/stores/service-detail-page-store';
import type {
    EventRuleActionsToggleType,
} from '@/services/alert-manager/types/alert-manager-type';

const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;
const serviceDetailPageStore = useServiceDetailPageStore();
const serviceDetailPageState = serviceDetailPageStore.state;

const emit = defineEmits<{(e: 'change-form', form: EventRuleActionsType): void}>();

const storeState = reactive({
    service: computed<ServiceModel>(() => serviceDetailPageState.serviceInfo),
    isEventRuleEditMode: computed<boolean>(() => serviceDetailPageState.isEventRuleEditMode),
    eventRuleInfo: computed<EventRuleModel>(() => serviceDetailPageState.eventRuleInfo),
    serviceDropdownList: computed<SelectDropdownMenuItem[]>(() => Object.values(allReferenceGetters.service).map((i) => ({
        name: i.name,
        label: i.label,
    }))),
});
const state = reactive({
    actions: computed<EventRuleActionsToggleType[]>(() => ([
        {
            label: i18n.t('ALERT_MANAGER.EVENT_RULE.CHANGE_SERVICE'),
            name: 'change_service',
        },
    ])),
    selectedServiceId: undefined as string|undefined,
});

const updateStateFromEventRuleInfo = (): void => {
    const actions = storeState.eventRuleInfo.actions;
    if (!actions) return;

    if (actions.change_service) {
        state.selectedServiceId = actions.change_service;
    }
};

const handleUpdateToggle = (action: string, value: boolean) => {
    if (value) {
        state.selectedServiceId = storeState.service.service_id;
    } else {
        state.selectedServiceId = undefined;
    }
};

watch(() => state.selectedServiceId, (selectedServiceId) => {
    emit('change-form', { change_service: selectedServiceId });
}, { immediate: true, deep: true });
watch(() => storeState.isEventRuleEditMode, (isEditMode) => {
    if (isEditMode) {
        updateStateFromEventRuleInfo();
    }
}, { immediate: true });
</script>

<template>
    <div class="service-detail-tabs-settings-event-rule-action-service-form">
        <p-field-title :label="$t('ALERT_MANAGER.EVENT_RULE.SERVICE_SETTINGS')"
                       size="lg"
                       required
                       class="field-title"
        />
        <div class="flex flex-col pr-3 pl-3">
            <p-field-group v-for="(action, actionIdx) in state.actions"
                           :key="`action-${actionIdx}`"
                           class="field-group flex flex-col"
            >
                <div class="flex items-start w-full">
                    <div class="toggle-wrapper flex items-center gap-2 mr-2">
                        <p-toggle-button :value="!!state.selectedServiceId"
                                         @change-toggle="handleUpdateToggle(action.name, $event)"
                        />
                        <p-field-title font-weight="regular">
                            {{ action.label }}
                        </p-field-title>
                    </div>
                    <div v-if="state.selectedServiceId"
                         class="input-wrapper"
                    >
                        <div v-if="action.name === 'change_service'"
                             class="flex flex-col gap-1"
                        >
                            <p-select-dropdown :menu="storeState.serviceDropdownList"
                                               use-fixed-menu-style
                                               block
                                               :selected.sync="state.selectedServiceId"
                            />
                            <p class="text-label-md pl-1">
                                <span class="mr-1 text-gray-500">{{ $t('ALERT_MANAGER.EVENT_RULE.CURRENT_SERVICE') }}</span>
                                <p-link action-icon="internal-link"
                                        new-tab
                                        highlight
                                        :to="{
                                            name: ALERT_MANAGER_ROUTE.SERVICE.DETAIL._NAME,
                                            params: {
                                                serviceId: storeState.service.service_id,
                                            },
                                        }"
                                >
                                    {{ storeState.service.name }}
                                </p-link>
                            </p>
                        </div>
                    </div>
                </div>
            </p-field-group>
        </div>
    </div>
</template>

<style scoped lang="postcss">
.service-detail-tabs-settings-event-rule-action-service-form {
    .field-title {
        padding-top: 0.375rem;
        padding-bottom: 0.375rem;
    }
    .field-group {
        margin-bottom: 0;
    }
    .toggle-wrapper {
        min-width: 12.5rem;
        height: 2rem;
    }
    .input-wrapper {
        width: calc(100% - 12.5rem);
    }
}
</style>
