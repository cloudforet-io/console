<script lang="ts">
import { getBindClass } from '@/utils/functional-helpers';

import { gray } from '@/styles/colors.cjs';

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
        duration: {
            type: Number,
            default: 2,
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
        opacity: {
            type: Number,
            default: 0.4,
        },
    },
    render(h, {
        props, slots, data,
    }) {
        const {
            loading, duration, width, height, tag, animation, opacity,
        } = props;
        const style: CSSStyleDeclaration = {} as CSSStyleDeclaration;
        const showLoading = loading || isEmptyVNode(slots().default);

        if (showLoading) {
            if (width) style.width = width;
            if (height) style.height = height;
            style.opacity = opacity;

            if (animation) {
                style.backgroundImage = `linear-gradient(90deg, ${gray[200]}, ${gray[100]}, ${gray[200]})`;
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
    @apply rounded-lg inline-block w-full bg-gray-200;
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
