import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import type { WidgetProps } from '@/services/dashboards/widgets/config';

export const useWidgetFrameProps:(props: WidgetProps, state) => ComputedRef = (props: WidgetProps, state) => computed(() => ({
    title: state.title,
    size: state.size,
    width: props.width,
    editMode: props.editMode,
    dateRange: state.dateRange,
    currency: state.currency,
}));
