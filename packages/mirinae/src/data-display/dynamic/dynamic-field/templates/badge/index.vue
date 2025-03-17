<script lang="ts">
import type { PropType } from 'vue';
import { defineComponent, h } from 'vue';

import PBadge from '@/data-display/badge/PBadge.vue';
import type { BadgeProps } from '@/data-display/badge/type';
import { BADGE_SHAPE } from '@/data-display/badge/type';
import type { BadgeTypeOptions } from '@/data-display/dynamic/dynamic-field/templates/badge/type';
import type { DynamicFieldHandler } from '@/data-display/dynamic/dynamic-field/type';
import type { BadgeOptions } from '@/data-display/dynamic/dynamic-field/type/field-schema';
import PLink from '@/navigation/link/PLink.vue';
import { ACTION_ICON } from '@/navigation/link/type';
import { commaFormatter, getColor } from '@/utils/helpers';

export default defineComponent({
    name: 'PDynamicFieldBadge',
    components: { PBadge },
    props: {
        options: {
            type: Object as PropType<BadgeOptions>,
            default: () => ({}),
        },
        data: {
            type: [String, Object, Array, Boolean, Number],
            default: undefined,
        },
        typeOptions: {
            type: Object as PropType<BadgeTypeOptions>,
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
    setup(props) {
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

        let badgeEl: any = props.data ?? props.options.default;
        if (badgeEl === undefined || badgeEl === null) return () => undefined;
        if (typeof badgeEl === 'number') badgeEl = commaFormatter(badgeEl);
        badgeEl = `${options.prefix ?? ''}${badgeEl}${options.postfix ?? ''}`;

        if (options.link) {
            badgeEl = [h(PLink, {
                attrs: { href: options.link, actionIcon: props.data ? ACTION_ICON.INTERNAL_LINK : ACTION_ICON.NONE, newTab: true },
            }, badgeEl)];
        }

        return () => h(PBadge, { props: badgeProps, class: { 'p-dynamic-field-badge': true } }, badgeEl);
    },
});
</script>

<style lang="postcss">
.p-dynamic-field-badge {
    .p-link {
        font-size: inherit;
    }
}
</style>
