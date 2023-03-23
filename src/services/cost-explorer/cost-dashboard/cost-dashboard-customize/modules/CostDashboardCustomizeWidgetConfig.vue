<template>
    <div class="cost-dashboard-customize-widget-config">
        <p-field-group :label="$t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE.FORM.LABEL_NAME')"
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
            :label="$t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE.FORM.LABEL_GROUP_BY')"
            :invalid="invalidState.groupBy"
            :invalid-text="invalidTexts.groupBy"
            required
            class="group-by"
        >
            <p-select-dropdown
                :items="groupByItems"
                :invalid="invalidState.groupBy"
                :selected="selectedGroupByItem"
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
                :items="granularityItems"
                :invalid="invalidState.granularity"
                :selected="selectedGranularityItem"
                use-fixed-menu-style
                class="w-full"
                @select="handleSelectGranularity"
            />
        </p-field-group>
    </div>
</template>

<script lang="ts">

import {
    computed, reactive, toRefs, watch,
} from 'vue';
import VueI18n from 'vue-i18n';

import { PFieldGroup, PSelectDropdown, PTextInput } from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import { cloneDeep } from 'lodash';

import { i18n } from '@/translations';

import { useFormValidator } from '@/common/composables/form-validator';

import type { WidgetInfo } from '@/services/cost-explorer/cost-dashboard/type';
import { EDITABLE_WIDGET_OPTIONS } from '@/services/cost-explorer/cost-dashboard/type';
import { GRANULARITY_ITEM_MAP, GROUP_BY_ITEM_MAP } from '@/services/cost-explorer/lib/config';
import { useCostDashboardPageStore } from '@/services/cost-explorer/store/cost-dashboard-page-store';
import { defaultWidgetMap } from '@/services/cost-explorer/widgets/lib/config';

import TranslateResult = VueI18n.TranslateResult;

export default {
    name: 'CostDashboardCustomizeWidgetConfig',
    components: {
        PFieldGroup,
        PTextInput,
        PSelectDropdown,
    },
    props: {
        isCustom: {
            type: Boolean,
            default: false,
        },
        editableWidgetOptionList: {
            type: Array,
            default: () => [],
        },
    },

    setup(props) {
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
            isAllValid,
            validate,
        } = useFormValidator({
            name: '',
            groupBy: '',
            granularity: '',
        }, {
            name(value: string) { return value.trim().length ? '' : i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.REQUIRED_NAME'); },
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
            selectedWidgetDesc: computed<TranslateResult|undefined>(() => i18n.t(state.selectedWidget?.options?.chart_desc_translation_id)),
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

        return {
            name,
            groupBy,
            invalidState,
            invalidTexts,
            isAllValid,
            ...toRefs(state),
            setForm,
            validate,
            handleSelectGroupBy,
            handleSelectGranularity,
            handleName,
            EDITABLE_WIDGET_OPTIONS,
        };
    },
};
</script>
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
