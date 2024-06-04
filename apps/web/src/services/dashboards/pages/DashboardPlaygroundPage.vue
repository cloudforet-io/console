<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';

import {
    PSelectDropdown, PButton,
} from '@spaceone/design-system';

import type {
    DashboardVariables,
} from '@/schema/dashboard/_types/dashboard-type';

import WidgetFormOverlay from '@/common/modules/widgets/_components/WidgetFormOverlay.vue';
import { CONSOLE_WIDGET_CONFIG_KEYS } from '@/common/modules/widgets/_constants/widget-config-list-constant';
import { getWidgetComponent, getWidgetFieldComponent } from '@/common/modules/widgets/_helpers/widget-component-helper';
import { getWidgetConfig } from '@/common/modules/widgets/_helpers/widget-config-helper';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';

import type { AllReferenceTypeInfo } from '@/services/dashboards/stores/all-reference-type-info-store';
import {
    useAllReferenceTypeInfoStore,
} from '@/services/dashboards/stores/all-reference-type-info-store';


const allReferenceTypeInfoStore = useAllReferenceTypeInfoStore();
const widgetGenerateStore = useWidgetGenerateStore();

const state = reactive({
    allReferenceTypeInfo: computed<AllReferenceTypeInfo>(() => allReferenceTypeInfoStore.getters.allReferenceTypeInfo),
    widgetConfig: computed(() => getWidgetConfig(state.selectedChartName)),
    variables: {} as DashboardVariables,
    chartTypeSelectDropdownMenu: computed(() => CONSOLE_WIDGET_CONFIG_KEYS.map((d) => ({
        name: d,
        label: d,
    }))),
    selectedChartName: 'table',
    widgetRequiredFieldSchemaMap: computed(() => Object.entries(state.widgetConfig.requiredFieldsSchema)),
    widgetOptionalFieldSchemaMap: computed(() => Object.entries(state.widgetConfig.optionalFieldsSchema)),
});

/* Event */
const handleClickAddWidget = () => {
    widgetGenerateStore.setShowOverlay(true);
};
</script>

<template>
    <div>
        <p>Widget Playground</p>
        <br>
        <p-button style-type="tertiary"
                  class="mb-2"
                  @click="handleClickAddWidget"
        >
            Add Widget
        </p-button>
        <div class="grid grid-cols-12">
            <div class="col-span-8">
                <component :is="getWidgetComponent(state.selectedChartName)"
                           :widget-name="state.selectedChartName"
                           widget-id=""
                           size="lg"
                           title=""
                           description=""
                           mode="customize"
                />
            </div>
            <div class="col-span-4 px-2">
                <div class="pb-4">
                    <div>
                        <p-select-dropdown
                            :menu="state.chartTypeSelectDropdownMenu"
                            :selected="state.selectedChartName"
                            @select="state.selectedChartName = $event"
                        />
                    </div>
                </div>
                <div>
                    <p class="mb-2">
                        Required Field Schema
                    </p>
                    <template v-for="[fieldName, fieldSchema] in state.widgetRequiredFieldSchemaMap">
                        <component :is="getWidgetFieldComponent(fieldName)"
                                   :key="`required-field-${fieldName}`"
                                   :widget-field-schema="fieldSchema"
                                   :required="true"
                        />
                    </template>
                    <br>
                    <p class="mb-2">
                        Optional Field Schema
                    </p>
                    <template v-for="[fieldName, fieldSchema] in state.widgetOptionalFieldSchemaMap">
                        <component :is="getWidgetFieldComponent(fieldName)"
                                   :key="`optional-field-${fieldName}`"
                                   :widget-field-schema="fieldSchema"
                                   :required="false"
                        />
                    </template>
                </div>
            </div>
        </div>
        <widget-form-overlay overlay-type="ADD" />
    </div>
</template>
