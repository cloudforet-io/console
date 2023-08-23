<script lang="ts" setup>
import bytes from 'bytes';
import { h, useAttrs } from 'vue';


import type { SizeDynamicFieldProps, SizeTypeOptions } from '@/data-display/dynamic/dynamic-field/templates/size/type';
import type { SizeOptions } from '@/data-display/dynamic/dynamic-field/type/field-schema';
import PLink from '@/inputs/link/PLink.vue';

const unitMap: Record<string, bytes.Unit> = {
    BYTES: 'B',
    KB: 'KB',
    MB: 'MB',
    GB: 'GB',
    PB: 'PB',
    TB: 'TB',
};
const UNIT_SEPARATOR = ' ';

const props = withDefaults(defineProps<SizeDynamicFieldProps>(), {
    options: () => ({}) as SizeOptions,
    data: null,
    typeOptions: () => ({}) as SizeTypeOptions,
    extraData: () => ({}),
    handler: undefined,
});

let value: number|null;

const attrs = useAttrs();

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

let render = h('span', { ...attrs }, `${props.options.prefix ?? ''}${formattedValue}${props.options.postfix ?? ''}`);

if (props.options.link) {
    render = h(PLink, {
        attrs: { href: (props.options as SizeOptions).link, target: '_blank' },
        props: { value, showIcon: !!formattedValue },
    }, [render]);
}

</script>

<template>
    <render />
</template>
