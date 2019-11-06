import {
    iconStyleMapping, sizeMapping, animationMapping, rotatingMapping, flipMapping,
} from '@/components/atoms/icons/FiMapping';

export default {
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

};
