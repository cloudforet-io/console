<script>
import {
    iconStyleMapping, sizeMapping, animationMapping, rotatingMapping, flipMapping,
} from './FiMapping';

export default {
    name: 'FI',
    functional: true,
    props: {
        icon: {
            type: String,
            required: true,
        },
        iconStyle: {
            type: String,
            default: 'solid',
            validator: value => value in iconStyleMapping,
        },
        size: {
            type: String,
            default: null,
            validator: value => value in sizeMapping,
        },
        animation: {
            type: String,
            default: null,
            validator: value => value in animationMapping,
        },
        rotating: {
            type: String,
            default: null,
            validator: value => value in rotatingMapping,
        },
        flip: {
            type: String,
            default: null,
            validator: value => value in flipMapping,
        },
    },
    render(h, { props }) {
        function getClass() {
            const cls = {};
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
        });
    },
};
</script>

<style scoped>

</style>
