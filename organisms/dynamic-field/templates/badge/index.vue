<script lang="ts">
import PBadge from '@/components/atoms/badges/PBadge.vue';
import { BadgeOptions } from '@/components/organisms/dynamic-field/type/field-schema';
import { BadgeDynamicFieldProps } from '@/components/organisms/dynamic-field/templates/badge/type';
import { Badge, BADGE_SHAPE } from '@/components/atoms/badges/type';
import { getColor } from '@/components/util/helpers';
import PAnchor from '@/components/molecules/anchors/PAnchor.vue';

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
        beforeCreate: {
            type: Function,
            default: undefined,
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
