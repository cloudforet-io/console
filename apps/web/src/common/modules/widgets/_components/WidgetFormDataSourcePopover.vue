<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import {
    PButton, PPopover, PSelectCard,
} from '@spaceone/design-system';
import { POPOVER_TRIGGER } from '@spaceone/design-system/src/data-display/popover/type';

import { i18n } from '@/translations';

import WidgetFormAssetSecurityDataSourcePopper
    from '@/common/modules/widgets/_components/WidgetFormAssetSecurityDataSourcePopper.vue';
import WidgetFormCostDataSourcePopper from '@/common/modules/widgets/_components/WidgetFormCostDataSourcePopper.vue';
import WidgetFormDataSourceAddButton from '@/common/modules/widgets/_components/WidgetFormDataSourceAddButton.vue';


const POPPER_CONDITION = {
    NEW_DATA_SOURCE: 'NEW_DATA_SOURCE',
    COMBINE_DATA_SOURCE: 'COMBINE_DATA_SOURCE',
};
type PopperCondition = typeof POPPER_CONDITION[keyof typeof POPPER_CONDITION];
const DATA_SOURCE_DOMAIN = {
    COST: 'COST',
    ASSET: 'ASSET',
    SECURITY: 'SECURITY',
};
type DataSourceDomain = typeof DATA_SOURCE_DOMAIN[keyof typeof DATA_SOURCE_DOMAIN];

const state = reactive({
    showPopover: false,
    selectedPopperCondition: undefined as undefined|PopperCondition,
    dataSourceDomainItems: computed(() => ([
        {
            name: DATA_SOURCE_DOMAIN.COST,
            label: i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.COST'),
            icon: '_ic-ds-cost',
        },
        {
            name: DATA_SOURCE_DOMAIN.ASSET,
            label: i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.ASSET'),
            icon: '_ic-ds-asset',
        },
        {
            name: DATA_SOURCE_DOMAIN.SECURITY,
            label: i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.SECURITY'),
            icon: '_ic-ds-security',
        },
    ])),
    selectedDataSourceDomain: undefined as undefined|DataSourceDomain,
    disableConfirmButton: computed(() => {
        if (state.selectedDataSourceDomain === DATA_SOURCE_DOMAIN.COST) {
            return !state.selectedCostDataSourceId || !state.selectedCostDataType;
        }
        if ([DATA_SOURCE_DOMAIN.ASSET, DATA_SOURCE_DOMAIN.SECURITY].includes(state.selectedDataSourceDomain)) {
            return !state.selectedMetricId;
        }
        return true;
    }),
    // cost
    selectedCostDataSourceId: undefined as undefined|string,
    selectedCostDataType: undefined as undefined|string,
    // asset & security
    selectedMetricId: undefined as undefined|string,
});

/* Util */
const resetSelectedDataSource = () => {
    state.selectedCostDataSourceId = undefined;
    state.selectedCostDataType = undefined;
    state.selectedMetricId = undefined;
};

/* Event */
const handleClickAddDataSourceButton = () => {
    state.showPopover = !state.showPopover;
};
const handleClickDataSourceDomain = (domainName: DataSourceDomain) => {
    if (state.selectedDataSourceDomain === domainName) return;
    state.selectedDataSourceDomain = domainName;
    resetSelectedDataSource();
};
const handleSelectPopperCondition = (condition: PopperCondition) => {
    state.selectedPopperCondition = condition;
};
const handleConfirmDataSource = () => {
    state.showPopover = false;
    // TODO: create data table
};

watch(() => state.showPopover, (val) => {
    if (!val) {
        state.selectedDataSourceDomain = undefined;
        state.selectedPopperCondition = undefined;
    }
});
</script>

<template>
    <p-popover class="data-source-popover"
               :is-visible.sync="state.showPopover"
               position="right-start"
               hide-close-button
               hide-padding
               :trigger="POPOVER_TRIGGER.NONE"
    >
        <widget-form-data-source-add-button @click-add="handleClickAddDataSourceButton" />
        <template #content>
            <div v-if="!state.selectedPopperCondition"
                 class="data-source-popper-condition-wrapper"
            >
                <p-select-card :label="i18n.t('Add New Data Source')"
                               @click="handleSelectPopperCondition(POPPER_CONDITION.NEW_DATA_SOURCE)"
                />
                <p-select-card :label="i18n.t('Combine Data Source')"
                               @click="handleSelectPopperCondition(POPPER_CONDITION.COMBINE_DATA_SOURCE)"
                />
            </div>
            <div v-else
                 class="data-source-popover-content"
            >
                <div class="top-part">
                    <div class="data-source-domain-col">
                        <p-select-card v-for="domainItem in state.dataSourceDomainItems"
                                       :key="`data-source-domain-${domainItem.name}`"
                                       :label="domainItem.label"
                                       :value="domainItem.name"
                                       :selected="state.selectedDataSourceDomain"
                                       @click="handleClickDataSourceDomain(domainItem.name)"
                        />
                    </div>
                    <template v-if="state.selectedDataSourceDomain">
                        <widget-form-cost-data-source-popper
                            v-if="state.selectedDataSourceDomain === DATA_SOURCE_DOMAIN.COST"
                            :selected-cost-data-source-id.sync="state.selectedCostDataSourceId"
                            :selected-cost-data-type.sync="state.selectedCostDataType"
                        />
                        <widget-form-asset-security-data-source-popper
                            v-if="[DATA_SOURCE_DOMAIN.ASSET, DATA_SOURCE_DOMAIN.SECURITY].includes(state.selectedDataSourceDomain)"
                            :data-source-domain="state.selectedDataSourceDomain"
                            :selected-metric-id.sync="state.selectedMetricId"
                        />
                    </template>
                    <template v-else>
                        <div class="empty-wrapper">
                            {{ $t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.SELECT_DATA_SOURCE_TYPE') }}
                        </div>
                    </template>
                </div>
                <div class="popover-footer">
                    <p-button style-type="substitutive"
                              :disabled="state.disableConfirmButton"
                              @click="handleConfirmDataSource"
                    >
                        {{ i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_1.DONE') }}
                    </p-button>
                </div>
            </div>
        </template>
    </p-popover>
</template>

<style lang="scss" scoped>
.data-source-popover {
    display: inline-block;
    position: relative;
    :deep(&.p-popover) {
        .popper {
            padding: 0;
        }
    }
    .data-source-popper-condition-wrapper {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        width: 16.25rem;
        padding: 1rem;
    }
    .data-source-popover-content {
        display: flex;
        flex-direction: column;
        width: 57rem;
        height: 30rem;
        .top-part {
            display: flex;
            width: 100%;
            flex: 1;
            .data-source-domain-col {
                @apply border-r border-gray-200;
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
                min-width: 11.5rem;
                height: 100%;
                padding: 1rem 0.75rem;
            }
            .empty-wrapper {
                @apply flex justify-center items-center text-gray-300;
                width: 100%;
                height: 100%;
            }
        }
    }
    .popover-footer {
        @apply border-t border-gray-200;
        text-align: right;
        padding: 0.75rem;
    }
}

/* custom design-system component - p-select-card */
:deep(.p-select-card) {
    padding: 0.5rem;
}

/* custom design-system component - p-context-menu */
:deep(.p-context-menu) {
    border: none;
    .menu-container {
        height: 23.25rem;
    }
}
</style>
