<script>
import {
    iconStyleMapping, sizeMapping, animationMapping, rotatingMapping, flipMapping,
} from '@/components/atoms/icons/FiMapping';
import FIMixin from '@/components/atoms/icons/FIMixin';

export default {
    name: 'FI',
    functional: true,
    mixins: [FIMixin],
    render(h, {
        props, data,
    }) {
        function getClass() {
            const cls = {
                ...data.class,
            };
            cls[iconStyleMapping[props.iconStyle]] = true;
            cls[props.icon] = true;
            if (props.size) {
                cls[sizeMapping[props.size]] = true;
            }
            if (props.animation) {
                cls[animationMapping[props.animation]] = true;
            }
            if (props.flip || props.rotating) {
                cls[flipMapping[props.flip] || rotatingMapping[props.rotating]] = true;
            }
            return cls;
        }
        return h('i', {
            class: getClass(),
            staticClass: data.staticClass,
            staticStyle: data.staticStyle,
            attrs: data.attrs,
            style: data.style,
        });
    },
};
</script>
