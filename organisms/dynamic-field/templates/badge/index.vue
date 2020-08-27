<script lang="ts">
import { get } from 'lodash';
import PBadge from '@/components/atoms/badges/PBadge.vue';
import { getColor } from '@/components/organisms/dynamic-field/PDynamicField.toolset';
import { BADGE_SHAPE, BadgeProps } from '@/components/atoms/badges/PBadge.toolset';
import { BadgeOptions } from '@/components/organisms/dynamic-field/type/field-schema';
import { BadgeDynamicFieldProps } from '@/components/organisms/dynamic-field/templates/badge/type';

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
        const ps: BadgeProps = {} as any;
        if (shape) {
            ps.shape = BADGE_SHAPE[shape];
        }

        if (outline) {
            ps.outline = true;
            ps.backgroundColor = getColor(outline);
        } else {
            ps.backgroundColor = getColor(get(options, ['background_color'], null));
            ps.textColor = getColor(get(options, ['text_color'], null));
        }
        if (link) {
            ps.link = link;
            ps.target = '_blank';
        }
        return h(PBadge, { props: ps }, props.data);
    },
};
</script>
