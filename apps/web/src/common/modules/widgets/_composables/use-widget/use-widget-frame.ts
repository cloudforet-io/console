import type { UnwrapRef } from 'vue';
import { computed } from 'vue';

import { getWidgetConfig } from '@/common/modules/widgets/_helpers/widget-config-helper';
import type { WidgetSize } from '@/common/modules/widgets/types/widget-config-type';
import type { NewWidgetProps, WidgetEmit } from '@/common/modules/widgets/types/widget-display-type';
import type { WidgetFrameProps } from '@/common/modules/widgets/types/widget-frame-type';


export const useWidgetFrame = (
    props: UnwrapRef<NewWidgetProps>,
    emit: WidgetEmit,
    // widgetState: UnwrapRef<WidgetState>,
) => {
    const widgetConfig = getWidgetConfig(props.widgetName);
    const title = computed<string>(() => props.title ?? widgetConfig.meta.title);
    const size = computed<WidgetSize>(() => {
        if (props.size && widgetConfig.meta.sizes.includes(props.size)) return props.size;
        return widgetConfig.meta.sizes[0];
    });
    const widgetFrameProps = computed<Partial<WidgetFrameProps>>(() => ({
        title: title.value,
        size: size.value,
        widgetSizes: widgetConfig.meta.sizes,
        width: props.width,
        // widgetLink?: string;
        // widgetLocation?: Location;
        dateRange: props.dateRange,
        // noData?: boolean;
        // currency?: Currency;
        editMode: props.editMode,
        errorMode: props.errorMode,
        widgetKey: props.widgetKey,
        theme: props.theme,
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
