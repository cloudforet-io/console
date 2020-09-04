<script lang="ts">
import { get } from 'lodash';
import PBadge from '@/components/atoms/badges/PBadge.vue';
import { getColor } from '@/components/organisms/dynamic-field/PDynamicField.toolset';
import { BadgeOptions } from '@/components/organisms/dynamic-field/type/field-schema';
import { BadgeDynamicFieldProps } from '@/components/organisms/dynamic-field/templates/badge/type';
import { Badge, BADGE_SHAPE } from '@/components/atoms/badges/type';

export default {
    name: 'PDynamicFieldBadge',
    functional: true,
    components: { PBadge },
    props: {
        // eslint-disable-next-line camelcase,vue/prop-name-casing
        options: {
            type: Object,
            default: () => ({}),
        },
        data: {
            type: [String, Object, Array, Boolean, Number],
            required: true,
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
        const outline = get(options, ['outline_color'], null);
        const shape = get(options, ['shape'], null);
        const link = get(options, 'link', null);
        const badge: Badge = {} as any;
        if (shape) {
            badge.shape = BADGE_SHAPE[shape];
        }

        if (outline) {
            badge.outline = true;
            badge.backgroundColor = getColor(outline);
        } else {
            badge.backgroundColor = getColor(get(options, ['background_color'], null));
            badge.textColor = getColor(get(options, ['text_color'], null));
        }
        if (link) {
            badge.link = link;
            badge.target = '_blank';
        }
        return h(PBadge, { props: badge }, props.data);
    },
};
</script>
