<script lang="ts" setup>

import { PFieldGroup, PSelectDropdown, PTextInput } from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import { cloneDeep } from 'lodash';
import {
    computed, reactive, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';

import { useFormValidator } from '@/common/composables/form-validator';

import type { WidgetInfo } from '@/services/cost-explorer/cost-dashboard/type';
import { EDITABLE_WIDGET_OPTIONS } from '@/services/cost-explorer/cost-dashboard/type';
import { GRANULARITY_ITEM_MAP, GROUP_BY_ITEM_MAP } from '@/services/cost-explorer/lib/config';
import { useCostDashboardPageStore } from '@/services/cost-explorer/store/cost-dashboard-page-store';
import { defaultWidgetMap } from '@/services/cost-explorer/widgets/lib/config';

interface Props {
    isCustom: boolean;
    editableWidgetOptionList: string[];
}

const props = withDefaults(defineProps<Props>(), {
    isCustom: false,
    editableWidgetOptionList: () => [],
});
const { t } = useI18n();

const costDashboardPageStore = useCostDashboardPageStore();
const costDashboardPageState = costDashboardPageStore.$state;

const {
    forms: {
        name,
        groupBy,
        granularity,
    },
    setForm,
    initForm,
    invalidState,
    invalidTexts,
} = useFormValidator({
    name: '',
    groupBy: '',
    granularity: '',
}, {
    name(value: string) { return value.trim().length ? '' : t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.REQUIRED_NAME'); },
    groupBy(value: string) {
        if (props.editableWidgetOptionList.includes(EDITABLE_WIDGET_OPTIONS.GROUP_BY)) { return value.trim().length ? '' : 'Group By Required'; }
        return '';
    },
    granularity(value: string) {
        if (props.editableWidgetOptionList?.includes(EDITABLE_WIDGET_OPTIONS.GRANULARITY)) { return value.trim().length ? '' : 'Granularity Required'; }
        return '';
    },
});

const state = reactive({
    selectedWidget: computed(() => costDashboardPageState.originSelectedWidget ?? {}),
    editedSelectedWidget: computed<WidgetInfo>(() => cloneDeep(state.selectedWidget)),
    selectedWidgetDesc: computed<string|undefined>(() => t(state.selectedWidget?.options?.chart_desc_translation_id)),
    groupByItems: computed<MenuItem[]>(() => Object.values(GROUP_BY_ITEM_MAP)),
    granularityItems: computed<MenuItem[]>(() => Object.values(GRANULARITY_ITEM_MAP)),
    selectedGroupByItem: computed<string>({
        get() {
            return groupBy.value;
        },
        set(value: string) {
            setForm('groupBy', value);
        },
    }),
    selectedGranularityItem: computed<string>({
        get() {
            return granularity.value;
        },
        set(value: string) {
            setForm('granularity', value);
        },
    }),
});

const handleName = (value) => {
    setForm('name', value);
    state.editedSelectedWidget.name = value;
    costDashboardPageStore.$patch((_state) => {
        _state.editedSelectedWidget = state.editedSelectedWidget;
    });
};

const handleSelectGroupBy = (value) => {
    setForm('groupBy', value);
    state.editedSelectedWidget.options.group_by = value;
    costDashboardPageStore.$patch((_state) => {
        _state.editedSelectedWidget = state.editedSelectedWidget;
    });
};

const handleSelectGranularity = (value) => {
    setForm('granularity', value);
    state.editedSelectedWidget.options.granularity = value;
    costDashboardPageStore.$patch((_state) => {
        _state.editedSelectedWidget = state.editedSelectedWidget;
    });
};

const init = () => {
    if (props.isCustom) {
        initForm('name', state.selectedWidget?.name);
    } else {
        initForm('name', defaultWidgetMap[state.selectedWidget?.widget_id].widget_name);
    }

    if (props.editableWidgetOptionList.includes(EDITABLE_WIDGET_OPTIONS.GROUP_BY)) initForm('groupBy', state.selectedWidget?.options.group_by);
    else state.selectedGroupByItem = '';

    if (props.editableWidgetOptionList?.includes(EDITABLE_WIDGET_OPTIONS.GRANULARITY)) initForm('granularity', state.selectedWidget?.options.granularity);
    else state.selectedGranularityItem = '';
};

watch(() => state.selectedWidget, (after) => {
    if (after && Object.keys(after).length) {
        init();
    }
}, { immediate: true });

</script>

<template>
    <div class="cost-dashboard-customize-widget-config">
        <p-field-group :label="t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE.FORM.LABEL_NAME')"
                       :invalid="invalidState.name"
                       :invalid-text="invalidTexts.name"
                       required
        >
            <p-text-input :value="name"
                          :invalid="invalidState.name"
                          @update:value="handleName"
            />
        </p-field-group>
        <p v-if="selectedWidgetDesc"
           class="widget-desc"
        >
            {{ selectedWidgetDesc }}
        </p>
        <p-field-group
            v-if="editableWidgetOptionList.includes(EDITABLE_WIDGET_OPTIONS.GROUP_BY)"
            :label="t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE.FORM.LABEL_GROUP_BY')"
            :invalid="invalidState.groupBy"
            :invalid-text="invalidTexts.groupBy"
            required
            class="group-by"
        >
            <p-select-dropdown
                :items="state.groupByItems"
                :invalid="invalidState.groupBy"
                :selected="state.selectedGroupByItem"
                use-fixed-menu-style
                class="w-full"
                @select="handleSelectGroupBy"
            />
        </p-field-group>
        <p-field-group
            v-if="editableWidgetOptionList.includes(EDITABLE_WIDGET_OPTIONS.GRANULARITY)"
            label="Granularity"
            :invalid="invalidState.granularity"
            :invalid-text="invalidTexts.granularity"
            required
        >
            <p-select-dropdown
                :items="state.granularityItems"
                :invalid="invalidState.granularity"
                :selected="state.selectedGranularityItem"
                use-fixed-menu-style
                class="w-full"
                @select="handleSelectGranularity"
            />
        </p-field-group>
    </div>
</template>

<style lang="postcss" scoped>
.cost-dashboard-customize-widget-config {
    .p-text-input {
        @apply w-full;
    }
    .widget-desc {
        @apply text-gray-700;
        font-size: 0.875rem;
        line-height: 125%;
    }
    .group-by {
        margin-top: 1rem;
    }
}
</style>
