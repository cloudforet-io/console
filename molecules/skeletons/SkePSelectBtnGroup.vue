<script>
import PSkeleton from '@/components/atoms/skeletons/PSkeleton.vue';
import { getBindClass } from '@/components/utils/functional';

export default {
    name: 'SkePSelectBtnGroup',
    functional: true,
    props: {
        buttons: {
            type: Number,
            default: 5,
        },
    },
    render(h, { props, data }) {
        console.log('');
        const button = h(PSkeleton, {
            props: {
                width: '6rem',
                height: '2rem',
            },
            class: {
                'mr-2': true,
            },
        });
        const skes = Array(props.buttons).fill(button);
        return h('div', {
            ...data,
            class: {
                ...getBindClass(data.class),
                flex: true,
                'justify-start': true,
            },
        },
        skes);
    },
};
</script>
