import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import type { WidgetFrameProps } from '@/services/dashboards/widgets/_components/WidgetFrame.vue';
import { WIDGET_SIZE } from '@/services/dashboards/widgets/_configs/config';

export const useWidgetFrameProps = (props: any, state: any):ComputedRef => computed<Partial<WidgetFrameProps>>(() => ({
    widgetKey: props.widgetKey,
    width: props.width,
    editMode: props.editMode,
    widgetConfigId: props.widgetConfigId,
    title: state.title,
    size: state.size, // TODO: delete this comment
    dateRange: state.dateRange,
    currency: state.currency,
    disableFullSize: !state.widgetConfig?.sizes.includes(WIDGET_SIZE.full),
    isOnlyFullSize: state.widgetConfig?.sizes.length === 1 && state.widgetConfig?.sizes[0] === WIDGET_SIZE.full,
    disableViewMode: props.disableViewMode,
    widgetLocation: state.widgetLocation,
    errorMode: props.errorMode,
    theme: props.theme,
    nonInheritOptionsTooltip: state.nonInheritOptionsTooltip,
}));
