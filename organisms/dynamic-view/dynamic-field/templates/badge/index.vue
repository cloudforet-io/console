<script lang="ts">
import _ from 'lodash';
import PBadge from '@/components/atoms/badges/PBadge.vue';
import { getColor } from '@/components/organisms/dynamic-view/dynamic-field/toolset';
import { BadgeShape } from '@/components/atoms/badges/PBadge.toolset';

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
    },
    render(h, { props }) {
        const outline = _.get(props.options, ['outline_color'], null);
        const shape = _.get(props.options, ['shape'], null);
        const link = _.get(props.options, 'link', null);
        const ps = {} as any;
        if (shape) {
            ps.shape = BadgeShape[shape];
        }

        if (outline) {
            ps.outline = true;
            ps.backgroundColor = getColor(outline);
        } else {
            ps.backgroundColor = getColor(_.get(props.options, ['background_color'], null));
            ps.textColor = getColor(_.get(props.options, ['text_color'], null));
        }
        if (link) {
            ps.link = link;
        }
        return h(PBadge, { props: ps }, props.data);
    },
};
</script>
