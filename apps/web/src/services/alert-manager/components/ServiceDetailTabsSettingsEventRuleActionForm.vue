<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PFieldTitle, PFieldGroup, PToggleButton, PSelectDropdown, PLink,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import type { ServiceModel } from '@/schema/alert-manager/service/model';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';

import { getActionSettingTypeI18n } from '@/services/alert-manager/composables/event-rule-action-data';
import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/routes/route-constant';
import { useServiceDetailPageStore } from '@/services/alert-manager/stores/service-detail-page-store';
import type {
    EventRuleActionsToggleType,
    EventRuleSettingsType,
} from '@/services/alert-manager/types/alert-manager-type';

const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;
const serviceDetailPageStore = useServiceDetailPageStore();
const serviceDetailPageState = serviceDetailPageStore.state;

const storeState = reactive({
    service: computed<ServiceModel>(() => serviceDetailPageState.serviceInfo),
    serviceDropdownList: computed<SelectDropdownMenuItem[]>(() => Object.values(allReferenceGetters.service).map((i) => ({
        name: i.name,
        label: i.label,
    }))),
    cloudServiceTypeDropdownList: computed<SelectDropdownMenuItem[]>(() => Object.values(allReferenceGetters.cloudServiceType).map((i) => ({
        name: i.key,
        label: i.label,
    }))),
});

const state = reactive({
    actionSettingType: getActionSettingTypeI18n(),
    actions: computed<Record<EventRuleSettingsType, EventRuleActionsToggleType[]>>(() => ({
        service: [
            {
                label: i18n.t('ALERT_MANAGER.EVENT_RULE.CHANGE_SERVICE'),
                name: 'change_service',
            },
        ],
        asset: [
            {
                label: i18n.t('ALERT_MANAGER.EVENT_RULE.ASSET_SCOPE'),
                name: 'match_asset',
            },
        ],
        alert: [
            {
                label: i18n.t('ALERT_MANAGER.EVENT_RULE.CHANGE_TITLE'),
                name: 'change_title',
            },
            {
                label: i18n.t('ALERT_MANAGER.EVENT_RULE.CHANGE_STATUS'),
                name: 'change_status',
            },
            {
                label: i18n.t('ALERT_MANAGER.EVENT_RULE.CHANGE_URGENCY'),
                name: 'change_urgency',
            },
        ],
    })),
    selectedActions: {},
    selectedServiceId: storeState.service.service_id,
    selectedAssetList: [],
});

const handleUpdateValue = (action: string) => {
    state.selectedActions[action] = '';
};
const handleSelectAction = (action: string, value: any) => {
    state.selectedActions[action] = value;
};
</script>

<template>
    <div class="service-detail-tabs-settings-event-rule-action-form">
        <div v-for="(type, idx) in Object.values(state.actionSettingType)"
             :key="`action-setting-type-${idx}`"
             class="action-wrapper flex flex-col gap-2 p-3 border-t-4 border-b-4 border-gray-100 rounded-xl"
        >
            <p-field-title :label="type"
                           size="lg"
                           required
                           class="field-title"
            />
            <div class="flex items-center gap-2 pr-3 pl-3">
                <p-field-group v-for="(action, actionIdx) in state.actions[Object.keys(state.actionSettingType)[idx]]"
                               :key="`action-${actionIdx}`"
                               class="field-group flex items-start w-full"
                >
                    <div class="toggle-wrapper flex items-center gap-2 mr-2">
                        <p-toggle-button :value="state.selectedActions[action.name]"
                                         @update:value="handleUpdateValue(action.name)"
                        />
                        <p-field-title>{{ action.label }}</p-field-title>
                    </div>
                    <div class="flex-1">
                        <div v-if="action.name === 'change_service'"
                             class="flex flex-col gap-1"
                        >
                            <p-select-dropdown :menu="storeState.serviceDropdownList"
                                               use-fixed-menu-style
                                               block
                                               show-delete-all-button
                                               :selected.sync="state.selectedServiceId"
                                               @update:selected="handleSelectAction(action.name, $event)"
                            />
                            <p class="text-label-md pl-1">
                                <span class="text-gray-500">{{ $t('ALERT_MANAGER.EVENT_RULE.CURRENT_SERVICE') }}</span>
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
                        <p-select-dropdown v-if="action.name === 'match_asset'"
                                           :menu="storeState.cloudServiceTypeDropdownList"
                                           use-fixed-menu-style
                                           block
                                           appearance-type="badge"
                                           multi-selectable
                                           show-delete-all-button
                                           :selected.sync="state.selectedAssetList"
                                           @update:selected="handleSelectAction(action.name, $event)"
                        />
                    </div>
                </p-field-group>
            </div>
        </div>
    </div>
</template>

<style scoped lang="postcss">
.service-detail-tabs-settings-event-rule-action-form {
    @apply bg-gray-100;
    .action-wrapper {
        @apply bg-white;
        border-bottom-left-radius: 0.5rem;
        border-bottom-right-radius: 0.5rem;
        &:last-child {
            border-bottom: none;
        }
        &:first-child {
            border-top: none;
        }
        .field-group {
            margin-bottom: 0;
        }
        .field-title {
            padding-top: 0.375rem;
            padding-bottom: 0.375rem;
        }
        .toggle-wrapper {
            min-width: 12.5rem;
            height: 2rem;
        }
    }
}
</style>
