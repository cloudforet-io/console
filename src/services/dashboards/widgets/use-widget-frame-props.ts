import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import type { WidgetProps } from '@/services/dashboards/widgets/config';

export const useWidgetFrameProps = (props: WidgetProps, state):ComputedRef => computed(() => ({
    widgetKey: props.widgetKey,
    width: props.width,
    editMode: props.editMode,
    title: state.title,
    size: state.size,
    dateRange: state.dateRange,
    currency: state.currency,
    disableFullSize: state.disableFullSize,
    isOnlyFullSize: state.isOnlyFullSize,
}));
