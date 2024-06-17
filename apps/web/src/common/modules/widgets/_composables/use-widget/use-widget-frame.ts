import type { UnwrapRef, ComputedRef } from 'vue';
import { computed } from 'vue';

import { getWidgetConfig } from '@/common/modules/widgets/_helpers/widget-config-helper';
import type { DateRange } from '@/common/modules/widgets/types/widget-data-type';
import type { WidgetProps, WidgetSize, WidgetFrameEmit } from '@/common/modules/widgets/types/widget-display-type';
import type { WidgetFrameProps } from '@/common/modules/widgets/types/widget-frame-type';


interface OverridableWidgetFrameState {
    dateRange?: DateRange | ComputedRef<DateRange>;
}
export const useWidgetFrame = (
    props: UnwrapRef<WidgetProps>,
    emit: WidgetFrameEmit,
    overrides: OverridableWidgetFrameState = {},
) => {
    const _widgetConfig = getWidgetConfig(props.widgetName);
    const _title = computed<string>(() => props.title ?? _widgetConfig?.meta.title ?? '');
    const _size = computed<WidgetSize>(() => {
        if (props.size && _widgetConfig.meta.sizes.includes(props.size)) return props.size;
        return _widgetConfig.meta.sizes[0];
    });
    const getBasedOnText = (dateRange?: DateRange): string => {
        if (!dateRange) return '';
        if (dateRange.start) return `${dateRange.start} ~ ${dateRange.end}`;
        return dateRange.end;
    };
    const widgetFrameProps = computed<WidgetFrameProps>(() => ({
        widgetId: props.widgetId,
        widgetSizes: _widgetConfig.meta.sizes,
        mode: props.mode ?? 'view',
        //
        title: _title.value,
        description: props.description,
        size: _size.value,
        width: props.width,
        basedOnText: getBasedOnText(overrides.dateRange?.value),
        // widgetLocation: _widgetLocation,
        // loading: props.loading,
        // editMode: props.editMode,
        // errorMode: props.errorMode,
    }));

    const widgetFrameEventHandlers = {
        'click-edit': () => {
            emit('click-edit');
        },
        'click-delete': () => {
            emit('click-delete');
        },
        'update-size': (size: WidgetSize) => {
            emit('update-size', size);
        },
    };

    return { widgetFrameProps, widgetFrameEventHandlers };
};
