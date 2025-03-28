<script lang="ts">
import { h, defineComponent } from 'vue';
import type { PropType } from 'vue';

import bytes from 'bytes';

import type { SizeTypeOptions } from '@/data-display/dynamic/dynamic-field/templates/size/type';
import type { DynamicFieldHandler } from '@/data-display/dynamic/dynamic-field/type';
import type { SizeOptions } from '@/data-display/dynamic/dynamic-field/type/field-schema';
import PLink from '@/navigation/link/PLink.vue';
import { ACTION_ICON } from '@/navigation/link/type';

const unitMap: Record<string, bytes.Unit> = {
    BYTES: 'B',
    KB: 'KB',
    MB: 'MB',
    GB: 'GB',
    PB: 'PB',
    TB: 'TB',
};
const UNIT_SEPARATOR = ' ';

export default defineComponent({
    name: 'PDynamicFieldSize',
    components: { PLink },
    props: {
        options: {
            type: Object as PropType<SizeOptions>,
            default: () => ({}),
        },
        data: {
            type: [String, Object, Array, Boolean, Number],
            default: null,
        },
        typeOptions: {
            type: Object as PropType<SizeTypeOptions>,
            default: () => ({}),
        },
        extraData: {
            type: Object,
            default: () => ({}),
        },
        handler: {
            type: Function as PropType<DynamicFieldHandler|undefined>,
            default: undefined,
        },
    },
    setup(props, { attrs }) {
        let value: number|null;

        // eslint-disable-next-line vue/no-setup-props-destructure
        if (typeof props.data === 'number') value = props.data;
        else if (typeof props.data === 'string') value = Number(props.data);
        else if (props.options.default !== undefined) value = props.options.default ?? 0;
        else value = null;

        let formattedValue: string;
        if (value === null) formattedValue = '-';
        else {
            const displayUnit: bytes.Unit|undefined = unitMap[props.options.display_unit as string] || undefined;
            const sourceUnit: bytes.Unit|undefined = unitMap[props.options.source_unit as string] || undefined;
            const bytesOptions: bytes.BytesOptions = { unit: displayUnit, unitSeparator: UNIT_SEPARATOR };

            if (sourceUnit) {
                value = bytes.parse(`${props.data}${sourceUnit}`);
            }

            const res = bytes(value, bytesOptions);
            if (!res) formattedValue = '-';
            else if (res.split(UNIT_SEPARATOR)[1] === 'B') {
                formattedValue = `${value} bytes`;
            } else {
                formattedValue = res;
            }
        }

        let sizeEl = h('span', { ...attrs }, `${props.options.prefix ?? ''}${formattedValue}${props.options.postfix ?? ''}`);

        if (props.options.link) {
            sizeEl = h(PLink, {
                attrs: { href: (props.options as SizeOptions).link, actionIcon: props.data ? ACTION_ICON.INTERNAL_LINK : ACTION_ICON.NONE, newTab: true },
                props: { value, showIcon: !!formattedValue },
            }, [sizeEl]);
        }

        return () => sizeEl;
    },
});
</script>
