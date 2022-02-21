<template>
    <div>
        <p-field-group label="Name"
                       :invalid="invalidState.name"
                       :invalid-text="invalidTexts.name"
                       required
        >
            <p-text-input :value="name" :invalid="invalidState.name" @input="handleName" />
        </p-field-group>
        <p-field-group
            v-if="showGroupBy"
            label="Group By"
            :invalid="invalidState.groupBy"
            :invalid-text="invalidTexts.groupBy"
            required
        >
            <p-select-dropdown
                :items="groupByItems"
                :invalid="invalidState.groupBy"
                :selected="selectedGroupByItem"
                use-fixed-menu-style
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
import { defaultWidgetMap } from '@/services/billing/cost-management/widgets/lib/config';
import { GROUP_BY_ITEM_MAP } from '@/services/billing/cost-management/lib/config';
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
            selectedWidget: computed(() => store.state.service.costDashboard?.originSelectedWidget),
            editedSelectedWidget: computed(() => cloneDeep(state.selectedWidget)),
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
                initForm('name', state.selectedWidget?.name);
            } else {
                initForm('name', defaultWidgetMap[state.selectedWidget?.widget_id].widget_name);
            }

            if (props.showGroupBy) initForm('groupBy', state.selectedWidget?.options.group_by);
            else state.selectedGroupByItem = '';
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
            handleName,
        };
    },
};
</script>
