import type { ComputedRef, UnwrapRef } from 'vue';
import { computed } from 'vue';
import type { Location } from 'vue-router/types/router';

import { i18n } from '@/translations';

import type { Currency } from '@/store/modules/settings/type';

import type { DateRange } from '@/services/dashboards/config';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import type { WidgetFrameProps } from '@/services/dashboards/widgets/_components/WidgetFrame.vue';
import type { WidgetEmit, WidgetProps } from '@/services/dashboards/widgets/_configs/config';
import { WIDGET_SIZE } from '@/services/dashboards/widgets/_configs/config';
import { getNonInheritedWidgetOptions } from '@/services/dashboards/widgets/_helpers/widget-schema-helper';
import type { WidgetBaseState } from '@/services/dashboards/widgets/_hooks/use-widget/use-widget-base-state';

export interface WidgetFrameOptions {
    dateRange?: DateRange|ComputedRef<DateRange>;
    currency?: Currency|ComputedRef<Currency>;
    widgetLocation?: Location|ComputedRef<Location>;
}
export const useWidgetFrame = (
    props: UnwrapRef<WidgetProps>,
    emit: WidgetEmit,
    widgetState: UnwrapRef<WidgetBaseState & WidgetFrameOptions>,
) => {
    const title = computed(() => props.title ?? widgetState.widgetConfig.title);
    const size = computed(() => {
        if (props.size && widgetState.widgetConfig.sizes.includes(props.size)) return props.size;
        return widgetState.widgetConfig.sizes[0];
    });
    const nonInheritOptionsTooltipText = computed<string | undefined>(() => {
        const nonInheritOptions = getNonInheritedWidgetOptions(props.inheritOptions);
        if (!nonInheritOptions.length) return undefined;

        // TODO: widget option name must be changed to readable name.
        // const tooltipText = nonInheritOptions.map((d) => `<p>• ${getWidgetOptionsSchemaPropertyName(d)}</p>`).join('\n');
        const tooltipText = nonInheritOptions.map((d) => `<p>• ${d}</p>`).join('\n');
        return `${i18n.global.t('DASHBOARDS.WIDGET.INHERIT_OPTIONS_TOOLTIP_TEXT_1')}</br></br>
            ${i18n.global.t('DASHBOARDS.WIDGET.INHERIT_OPTIONS_TOOLTIP_TEXT_2')}</br>${tooltipText}`;
    });
    const widgetFrameProps = computed<Partial<WidgetFrameProps>>(() => ({
        widgetKey: props.widgetKey,
        width: props.width,
        editMode: props.editMode,
        widgetConfigId: props.widgetConfigId,
        title: title.value,
        size: size.value,
        dateRange: widgetState.dateRange ?? widgetState.settings?.date_range,
        currency: widgetState.currency,
        disableFullSize: !widgetState.widgetConfig?.sizes.includes(WIDGET_SIZE.full),
        isOnlyFullSize: widgetState.widgetConfig?.sizes.length === 1 && widgetState.widgetConfig?.sizes[0] === WIDGET_SIZE.full,
        disableViewMode: props.disableViewMode,
        widgetLocation: widgetState.widgetLocation,
        errorMode: props.errorMode,
        theme: props.theme,
        nonInheritOptionsTooltipText: nonInheritOptionsTooltipText.value,
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
