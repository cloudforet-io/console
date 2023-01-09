import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import type { Currency } from '@/store/modules/display/config';

import type { WidgetConfig, WidgetSize } from '@/services/dashboards/widgets/_configs/config';
import { WIDGET_SIZE } from '@/services/dashboards/widgets/_configs/config';

interface WidgetFrameState {
    title: string;
    size: WidgetSize;
    dateRange: string;
    currency: Currency;
    disableFullSize: boolean;
    isOnlyFullSize: boolean;
    widgetConfig?: WidgetConfig;
}

interface WidgetFrameProps {
    widgetKey: string;
    width?: number;
    editMode?: boolean;
    widgetConfigId?: string;
}

type WidgetFrameBaseProps = WidgetFrameState & WidgetFrameProps;

export const useWidgetFrameProps = (props: any, state: any):ComputedRef => computed<WidgetFrameBaseProps>(() => ({
    widgetKey: props.widgetKey,
    width: props.width,
    editMode: props.editMode,
    widgetConfigId: props.widgetConfigId,
    title: state.title,
    size: state.size,
    dateRange: state.dateRange,
    currency: state.currency,
    disableFullSize: !state.widgetConfig?.sizes.includes(WIDGET_SIZE.full),
    isOnlyFullSize: state.widgetConfig?.sizes.length === 1 && state.widgetConfig?.sizes[0] === WIDGET_SIZE.full,
    widgetLocation: state.widgetLocation,
}));
