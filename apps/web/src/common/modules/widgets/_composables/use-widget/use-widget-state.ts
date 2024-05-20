import type { ComputedRef, UnwrapRef, Ref } from 'vue';
import { computed, reactive } from 'vue';

import type { Granularity, NewWidgetFilters } from '@/schema/dashboard/_types/widget-type';

import type { Currency } from '@/store/modules/settings/type';

import { getWidgetConfig } from '@/common/modules/widgets/_helpers/widget-config-helper';
import type { NewWidgetConfig } from '@/common/modules/widgets/types/widget-config-type';
import type { NewWidgetProps } from '@/common/modules/widgets/types/widget-display-type';

import type { AllReferenceTypeInfo } from '@/services/dashboards/stores/all-reference-type-info-store';


export interface NewWidgetState {
    widgetConfig: ComputedRef<NewWidgetConfig>;
    widgetKey: ComputedRef<string>;
    title: ComputedRef<string>;
    description: ComputedRef<string|undefined>;
    filters: ComputedRef<NewWidgetFilters|undefined>;
    filtersSchemaProperties: ComputedRef<string[]|undefined>;
    baseOnDate: ComputedRef<string|undefined>;
    dateRange: ComputedRef<any>;
    allReferenceTypeInfo: ComputedRef<AllReferenceTypeInfo>;
    granularity: ComputedRef<Granularity|undefined>;
    currency: Ref<Currency|undefined>;
}

export const useWidgetState = (
    props: UnwrapRef<NewWidgetProps>,
) => {
    const _widgetConfig = getWidgetConfig(props.widgetName);

    const widgetState = reactive<NewWidgetState>({
        widgetConfig: computed(() => _widgetConfig),
        widgetKey: computed(() => props.widgetKey),
        title: computed(() => props.title ?? _widgetConfig?.meta.title ?? ''),
        description: computed(() => props.description),
        filters: computed(() => props.filters),
        filtersSchemaProperties: computed(() => props.filtersSchemaProperties),
        baseOnDate: computed(() => props.baseOnDate),
        dateRange: computed(() => undefined),
        allReferenceTypeInfo: computed(() => props.allReferenceTypeInfo),
        granularity: computed(() => _widgetConfig.meta.default_granularity),
        currency: computed(() => undefined),
    });

    return { widgetState };
};
