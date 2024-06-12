import type { UnwrapRef } from 'vue';
import { computed } from 'vue';

import { getWidgetConfig } from '@/common/modules/widgets/_helpers/widget-config-helper';
import type { WidgetProps, WidgetEmit, WidgetSize } from '@/common/modules/widgets/types/widget-display-type';
import type { WidgetFrameProps } from '@/common/modules/widgets/types/widget-frame-type';


export const useWidgetFrame = (
    props: UnwrapRef<WidgetProps<any>>,
    emit: WidgetEmit,
) => {
    const _widgetConfig = getWidgetConfig(props.widgetName);
    const _title = computed<string>(() => props.title ?? _widgetConfig?.meta.title ?? '');
    const _size = computed<WidgetSize>(() => {
        if (props.size && _widgetConfig.meta.sizes.includes(props.size)) return props.size;
        return _widgetConfig.meta.sizes[0];
    });
    // const _currency = undefined; // TODO: set this
    // const _dateText = props.baseOnDate; // TODO: set this
    // const _widgetLocation = undefined; // TODO: set this
    const widgetFrameProps = computed<Partial<WidgetFrameProps>>(() => ({
        widgetId: props.widgetId,
        widgetSizes: _widgetConfig.meta.sizes,
        mode: props.mode ?? 'view',
        //
        title: _title.value,
        description: props.description,
        size: _size.value,
        width: props.width,
        // widgetLocation: _widgetLocation,
        //
        // dateText: _dateText,
        // currency: _currency,
        //
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
        'click-expand': () => {
            emit('click-expand');
        },
        'update-size': (size: WidgetSize) => {
            emit('update-size', size);
        },
    };

    return { widgetFrameProps, widgetFrameEventHandlers };
};
