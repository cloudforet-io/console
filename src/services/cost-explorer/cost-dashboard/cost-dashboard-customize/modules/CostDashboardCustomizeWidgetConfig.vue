<template>
    <div class="widget-config">
        <p-field-group :label="$t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE.FORM.LABEL_NAME')"
                       :invalid="invalidState.name"
                       :invalid-text="invalidTexts.name"
                       required
        >
            <p-text-input :value="name" :invalid="invalidState.name"
                          @input="handleName"
            />
        </p-field-group>
        <p-field-group
            v-if="showGroupBy"
            :label="$t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE.FORM.LABEL_GROUP_BY')"
            :invalid="invalidState.groupBy"
            :invalid-text="invalidTexts.groupBy"
            required
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
    </div>
</template>

<script lang="ts">
import { useFormValidator } from '@/common/composables/form-validator';
import { i18n } from '@/translations';
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';
import { PFieldGroup, PSelectDropdown, PTextInput } from '@spaceone/design-system';
import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';
import { defaultWidgetMap } from '@/services/cost-explorer/widgets/lib/config';
import { GROUP_BY_ITEM_MAP } from '@/services/cost-explorer/lib/config';
import { store } from '@/store';
import { cloneDeep } from 'lodash';


export default {
    name: 'CostDashboardCustomizeWidgetConfig',
    components: {
        PFieldGroup,
        PTextInput,
        PSelectDropdown,
    },
    props: {
        showGroupBy: {
            type: Boolean,
            default: false,
        },
        isCustom: {
            type: Boolean,
            default: false,
        },
        selectedWidget: {
            type: Object,
            default: () => ({}),
        },
    },

    setup(props) {
        const {
            forms: {
                name,
                groupBy,
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
        }, {
            name(value: string) { return value.trim().length ? '' : i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.REQUIRED_NAME'); },
            groupBy(value: string) {
                if (props.showGroupBy) { return value.trim().length ? '' : 'Group By Required'; }
                return '';
            },
        });

        const state = reactive({
            _selectedWidget: computed(() => props.selectedWidget),
            editedSelectedWidget: computed(() => cloneDeep(state._selectedWidget)),
            groupByItems: computed<MenuItem[]>(() => Object.values(GROUP_BY_ITEM_MAP)),
            selectedGroupByItem: computed<string>({
                get() {
                    return groupBy.value;
                },
                set(value: string) {
                    setForm('groupBy', value);
                },
            }),
        });

        const handleName = (value) => {
            setForm('name', value);
            state.editedSelectedWidget.name = value;
            store.commit('service/costDashboard/setEditedSelectedWidget', state.editedSelectedWidget);
        };

        const handleSelectGroupBy = (value) => {
            setForm('groupBy', value);
            state.editedSelectedWidget.options.group_by = value;
            store.commit('service/costDashboard/setEditedSelectedWidget', state.editedSelectedWidget);
        };

        const init = () => {
            if (props.isCustom) {
                initForm('name', state._selectedWidget?.name);
            } else {
                initForm('name', defaultWidgetMap[state._selectedWidget?.widget_id].widget_name);
            }

            if (props.showGroupBy) initForm('groupBy', state._selectedWidget?.options.group_by);
            else state.selectedGroupByItem = '';
        };


        watch(() => state._selectedWidget, (after) => {
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
            handleName,
        };
    },
};
</script>
<style lang="postcss" scoped>
.widget-config {
    .p-text-input {
        @apply w-full;
    }
}
</style>
