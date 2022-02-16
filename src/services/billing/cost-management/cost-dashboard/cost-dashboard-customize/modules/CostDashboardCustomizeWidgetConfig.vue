<template>
    <div>
        <p-field-group label="Name"
                       :invalid="invalidState.name"
                       :invalid-text="invalidTexts.name"
                       required
        >
            <p-text-input :value="name" :invalid="invalidState.name" @input="setForm('name', $event)" />
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
                @select="setForm('groupBy', $event)"
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
import { WidgetInfo } from '@/services/billing/cost-management/cost-dashboard/type';
import { defaultWidgetMap } from '@/services/billing/cost-management/widgets/lib/config';
import { GROUP_BY } from '@/services/billing/cost-management/lib/config';

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
        selectedWidget: {
            type: Object as () => WidgetInfo,
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
            groupByItems: computed(() => ([
                { name: GROUP_BY.PROVIDER, label: 'Provider' },
                { name: GROUP_BY.PRODUCT, label: 'Product' },
                { name: GROUP_BY.PROJECT, label: 'Project' },
                { name: GROUP_BY.SERVICE_ACCOUNT, label: 'Service Account' },
                { name: GROUP_BY.CATEGORY, label: 'Category' },
                { name: GROUP_BY.REGION, label: 'Region' },
                { name: GROUP_BY.TYPE, label: 'Type' },
                { name: GROUP_BY.ACCOUNT, label: 'Account ID' },
            ])),
            selectedGroupByItem: computed<string>({
                get() {
                    return groupBy.value;
                },
                set(value: string) {
                    setForm('groupBy', value);
                },
            }),
        });

        const init = () => {
            initForm('name', defaultWidgetMap[props.selectedWidget?.widget_id].widget_label);

            if (props.showGroupBy) initForm('groupBy', props.selectedWidget?.options.group_by);
            else state.selectedGroupByItem = '';
        };


        watch(() => props.selectedWidget, (after) => {
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
        };
    },
};
</script>
