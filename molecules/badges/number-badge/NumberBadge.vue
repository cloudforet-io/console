<script>
import PBadge from '@/components/atoms/badges/PBadge';
import { getBindClass } from '@/components/utils/functional';

export default {
    name: 'PNumberBadge',
    functional: true,
    components: { PBadge },
    props: {
        number: {
            type: Number,
            default: 0,
        },
    },
    render(h, { props, data }) {
        return h(PBadge, {
            ...data,
            class: {
                ...getBindClass(data.class),
                'badge-number': true,
            },
            attrs: {
                ...data.attrs,
                styleType: 'alert',
            },
        },
        // todo: 1000,10000등의 숫자가 입력될 경우 자동으로 +1k, +1m 등으로 바꿔주는 함수 추가
        props.number);
    },

};
</script>
