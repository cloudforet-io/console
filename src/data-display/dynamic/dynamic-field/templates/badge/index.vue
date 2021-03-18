<script lang="ts">
import PBadge from '@/data-display/badges/PBadge.vue';
import { BadgeOptions } from '@/data-display/dynamic/dynamic-field/type/field-schema';
import { BadgeDynamicFieldProps } from '@/data-display/dynamic/dynamic-field/templates/badge/type';
import { Badge, BADGE_SHAPE } from '@/data-display/badges/type';
import { getColor } from '@/util/helpers';
import PAnchor from '@/inputs/anchors/PAnchor.vue';

export default {
    name: 'PDynamicFieldBadge',
    functional: true,
    components: { PBadge },
    props: {
        options: {
            type: Object,
            default: () => ({}),
        },
        data: {
            type: [String, Object, Array, Boolean, Number],
            default: undefined,
        },
        typeOptions: {
            type: Object,
            default: () => ({}),
        },
        extraData: {
            type: Object,
            default: () => ({}),
        },
        handler: {
            type: Function,
            default: undefined,
        },
    },
    render(h, { props }: {props: BadgeDynamicFieldProps}) {
        const options: BadgeOptions = props.options;
        const badgeProps = {} as Badge;

        if (options.shape) {
            badgeProps.shape = BADGE_SHAPE[options.shape];
        }

        if (options.outline_color) {
            badgeProps.outline = true;
            badgeProps.backgroundColor = getColor(options.outline_color);
        } else {
            badgeProps.backgroundColor = getColor(options.background_color);
            badgeProps.textColor = getColor(options.text_color);
        }

        let badgeEl = props.data === undefined || props.data === null ? props.options.default : props.data;

        if (badgeEl === undefined || badgeEl === null) return undefined;

        if (options.link) {
            badgeEl = [h(PAnchor, {
                attrs: { href: options.link, target: '_blank' },
            }, badgeEl)];
        }

        return h(PBadge, { props: badgeProps }, badgeEl);
    },
};
</script>
