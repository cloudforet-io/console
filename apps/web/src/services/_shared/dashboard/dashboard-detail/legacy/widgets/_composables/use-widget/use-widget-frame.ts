import type { ComputedRef, UnwrapRef } from 'vue';
import { computed } from 'vue';
import type { Location } from 'vue-router/types/router';

import { WIDGET_SIZE } from '@/api-clients/dashboard/_constants/widget-constant';
import type { DateRange } from '@/api-clients/dashboard/_types/dashboard-type';
import { i18n } from '@/translations';

import type { Currency } from '@/store/display/type';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import type { WidgetFrameProps } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_components/WidgetFrame.vue';
import type { WidgetState } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_composables/use-widget/use-widget';
import { getNonInheritedWidgetOptionNamesAmongUsedVariables } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_helpers/widget-schema-helper';
import type { WidgetEmit, WidgetProps } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_types/widget-type';

export interface WidgetFrameOptions {
    dateRange?: DateRange|ComputedRef<DateRange>;
    currency?: Currency|ComputedRef<Currency>;
    widgetLocation?: Location|ComputedRef<Location|undefined>;
}
export const useWidgetFrame = (
    props: UnwrapRef<WidgetProps>,
    emit: WidgetEmit,
    widgetState: UnwrapRef<WidgetState>,
) => {
    const title = computed(() => props.title ?? widgetState.widgetConfig.title);
    const size = computed(() => {
        if (props.size && widgetState.widgetConfig.sizes.includes(props.size)) return props.size;
        return widgetState.widgetConfig.sizes[0];
    });
    const nonInheritOptionsTooltipText = computed<string | undefined>(() => {
        if (!props.dashboardVariablesSchema) return undefined;
        const nonInheritOptions = getNonInheritedWidgetOptionNamesAmongUsedVariables(props.dashboardVariablesSchema, widgetState.inheritOptions, widgetState.schemaProperties);
        if (!nonInheritOptions.length) return undefined;

        // const tooltipText = nonInheritOptions.map((d) => `<p>• ${getWidgetOptionsSchemaPropertyName(d)}</p>`).join('\n');
        const tooltipText = nonInheritOptions.map((d) => `<p>• ${d}</p>`).join('\n');
        return `${i18n.t('DASHBOARDS.WIDGET.INHERIT_OPTIONS_TOOLTIP_TEXT_1')}</br></br>
            ${i18n.t('DASHBOARDS.WIDGET.INHERIT_OPTIONS_TOOLTIP_TEXT_2')}</br>${tooltipText}`;
    });
    const widgetFrameProps = computed<Partial<WidgetFrameProps>>(() => ({
        widgetKey: props.widgetKey,
        width: props.width,
        editMode: props.editMode,
        widgetConfigId: props.widgetConfigId,
        title: title.value,
        size: size.value,
        dateRange: widgetState.dateRange ?? widgetState.dashboardOptions?.date_range,
        granularity: widgetState.granularity,
        currency: widgetState.currency,
        disableFullSize: !widgetState.widgetConfig?.sizes.includes(WIDGET_SIZE.full),
        isOnlyFullSize: widgetState.widgetConfig?.sizes.length === 1 && widgetState.widgetConfig?.sizes[0] === WIDGET_SIZE.full,
        disableFullMode: props.disableFullMode,
        widgetLocation: widgetState.widgetLocation,
        errorMode: props.errorMode,
        theme: props.theme,
        nonInheritOptionsTooltipText: nonInheritOptionsTooltipText.value,
        dataCriteria: widgetState.widgetConfig.options?.data_criteria,
    }));

    const widgetFrameEventHandlers = {
        'click-edit': () => {
            emit('click-edit');
        },
        'click-delete': () => {
            emit('click-delete');
        },
        'click-expand': () => {
            emit('click-expand');
        },
    };

    return { widgetFrameProps, widgetFrameEventHandlers };
};
