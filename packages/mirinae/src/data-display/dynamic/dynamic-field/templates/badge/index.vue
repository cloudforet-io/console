<script lang="ts" setup>

import { h } from 'vue';

import PBadge from '@/data-display/badge/PBadge.vue';
import type { BadgeProps } from '@/data-display/badge/type';
import { BADGE_SHAPE } from '@/data-display/badge/type';
import type { BadgeDynamicFieldProps } from '@/data-display/dynamic/dynamic-field/templates/badge/type';
import type { BadgeOptions } from '@/data-display/dynamic/dynamic-field/type/field-schema';
import PAnchor from '@/inputs/anchors/PAnchor.vue';
import { commaFormatter, getColor } from '@/utils/helpers';

const props = withDefaults(defineProps<BadgeDynamicFieldProps>(), {
    options: () => ({}) as BadgeOptions,
    data: undefined,
    typeOptions: () => ({}),
    extraData: () => ({}),
    handler: undefined,
});

// eslint-disable-next-line vue/no-setup-props-destructure
const options: BadgeOptions = props.options;

const badgeProps = {} as BadgeProps;

if (options.shape) {
    badgeProps.shape = BADGE_SHAPE[options.shape];
}

if (options.outline_color) {
    badgeProps.backgroundColor = getColor(options.outline_color);
} else {
    badgeProps.backgroundColor = getColor(options.background_color);
    badgeProps.textColor = getColor(options.text_color);
}

let badgeEl = props.data ?? props.options.default;
if (typeof badgeEl === 'number') badgeEl = commaFormatter(badgeEl);
badgeEl = `${options.prefix ?? ''}${badgeEl}${options.postfix ?? ''}`;

if (options.link) {
    badgeEl = [h(PAnchor, {
        attrs: { href: options.link, target: '_blank' },
    }, badgeEl)];
}

const render = h(PBadge, { props: badgeProps, class: { 'p-dynamic-field-badge': true } }, badgeEl);

</script>

<template>
    <render />
</template>

<style lang="postcss">
.p-dynamic-field-badge {
    .p-anchor {
        font-size: inherit;
    }
}
</style>
