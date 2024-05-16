import type { UnwrapRef } from 'vue';
import { computed } from 'vue';

import { getWidgetConfig } from '@/common/modules/widgets/_helpers/widget-config-helper';
import type { WidgetSize } from '@/common/modules/widgets/types/widget-config-type';
import type { NewWidgetProps, WidgetEmit } from '@/common/modules/widgets/types/widget-display-type';
import type { WidgetFrameProps } from '@/common/modules/widgets/types/widget-frame-type';


export const useWidgetFrame = (
    props: UnwrapRef<NewWidgetProps>,
    emit: WidgetEmit,
) => {
    const _widgetConfig = getWidgetConfig(props.widgetName);
    const _title = computed<string>(() => props.title ?? _widgetConfig?.meta.title ?? '');
    const _size = computed<WidgetSize>(() => {
        if (props.size && _widgetConfig.meta.sizes.includes(props.size)) return props.size;
        return _widgetConfig.meta.sizes[0];
    });
    const _currency = undefined; // TODO: set this
    const _dateText = props.baseOnDate; // TODO: set this
    const _widgetLocation = undefined; // TODO: set this
    const widgetFrameProps = computed<Partial<WidgetFrameProps>>(() => ({
        widgetKey: props.widgetKey,
        title: _title.value,
        description: props.description,
        size: _size.value,
        loading: props.loading,
        dateText: _dateText,
        width: props.width,
        widgetSizes: _widgetConfig.meta.sizes,
        editMode: props.editMode,
        errorMode: props.errorMode,
        currency: _currency,
        widgetLocation: _widgetLocation,
    }));

    const widgetFrameEventHandlers = {
        'click-edit': () => {
            emit('click-edit');
        },
        'click-delete': () => {
            emit('click-delete');
        },
    };

    return { widgetFrameProps, widgetFrameEventHandlers };
};
