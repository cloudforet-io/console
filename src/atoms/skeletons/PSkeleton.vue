<script lang="ts">
import { getBindClass } from '@/util/functional-helpers';
import { gray, primary3 } from '@/styles/colors';

const isEmptyVNode = (nodes) => {
    if (!nodes) return true;

    const [firstNode] = nodes;
    let str = firstNode.text;
    if (str) {
        // remove all line-break and space character
        str = str.replace(/(\n|\r\n|\s)/g, '');
    }

    return typeof firstNode.tag === 'undefined' && !str;
};

export default {
    name: 'PSkeleton',
    functional: true,
    props: {
        loading: {
            type: Boolean,
            default: true,
        },
        color: {
            type: String,
            default: primary3,
        },
        duration: {
            type: Number,
            default: 2,
        },
        highlight: {
            type: String,
            default: gray[100],
        },
        width: {
            type: String,
            default: null,
        },
        height: {
            type: String,
            default: null,
        },
        tag: {
            type: String,
            default: 'span',
        },
        animation: {
            type: Boolean,
            default: true,
        },
    },
    render(h, {
        props, slots, data,
    }) {
        const {
            loading, color, duration, highlight, width, height, tag, animation,
        } = props;
        const style: CSSStyleDeclaration = {} as CSSStyleDeclaration;
        const showLoading = loading || isEmptyVNode(slots().default);

        if (showLoading) {
            style.backgroundColor = color;
            if (width) style.width = width;
            if (height) style.height = height;

            if (animation) {
                style.backgroundImage = `linear-gradient(90deg, ${color}, ${highlight}, ${color})`;
                style.animation = `p-skeleton-loading ${duration}s ease-in-out infinite`;
            } else {
                style.backgroundImage = '';
                style.animation = '';
            }
            return h(props.tag || 'span', {
                ...data,
                class: {
                    ...getBindClass(data.class),
                    'p-skeleton': true,
                },
                style,
            });
        }
        return h(tag || 'span', {
            ...data,
            class: {
                ...getBindClass(data.class),
            },
        }, slots().default);
    },
};
</script>

<style lang="postcss">
.p-skeleton {
    @apply rounded-sm inline-block w-full;
    height: 0.875rem;
    line-height: inherit;
    background-repeat: no-repeat;
    background-size: 200px 100%;
    animation-name: p-skeleton-loading;
}

@keyframes p-skeleton-loading {
    0% {
        background-position: -200px 0;
    }
    100% {
        background-position: calc(200px + 100%) 0;
    }
}
</style>
