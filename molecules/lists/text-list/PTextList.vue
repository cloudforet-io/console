<script lang="ts">
import { getBindClass } from '@/components/util/functional-helpers';
import { get } from 'lodash';
import { CreateElement, VNodeChildren, VNodeData } from 'vue';
import { isNotEmpty } from '@/components/util/helpers';

export default {
    name: 'PTextList',
    functional: true,
    props: {
        items: {
            type: [Array],
            default: () => [],
        },
        delimiter: {
            type: String,
            default: ', ',
        },
        subKey: {
            type: String,
            default: undefined,
        },
        tag: {
            type: String,
            default: 'span',
        },
        link: {
            type: String,
            default: undefined,
        },
        target: {
            type: String,
            default: undefined,
        },
        linkFormatter: {
            type: Function,
            default: undefined,
        },
    },
    render(h: CreateElement, { props, data, scopedSlots }) {
        const delimiter = props.delimiter;
        const delimiterEl = h('span', {
            domProps: { innerHTML: delimiter },
            class: 'delimiter',
        });
        const children: VNodeChildren = props.items.reduce((res, d, i) => {
            let tag = props.tag;
            const childOptions: Pick<Required<VNodeData>, 'attrs'|'domProps'|'class'> = {
                attrs: {} as any,
                domProps: {
                    innerHTML: d,
                },
                class: 'list-item',
            };

            // insert link
            if (props.link) {
                tag = 'a';
                childOptions.attrs.href = props.link;
                if (props.target) childOptions.attrs.target = props.target;
            } else if (props.linkFormatter) {
                tag = 'a';
                childOptions.attrs.href = props.linkFormatter(d, i);
                if (props.target) childOptions.attrs.target = props.target;
            }

            // set data by sub key
            if (props.subKey) {
                childOptions.domProps.innerHTML = get(d, props.subKey, '');
            }


            // create child element
            let childEl;
            if (scopedSlots.default) {
                childEl = scopedSlots.default({
                    ...props,
                    data: d,
                    index: i,
                    value: childOptions.domProps.innerHTML,
                });
            } else if (isNotEmpty(childOptions.domProps.innerHTML)) {
                childEl = h(tag, childOptions);
            }


            // create delimiter element
            if (childEl && res.length > 0 && i > 0) {
                if (scopedSlots.delimiter) {
                    res.push(scopedSlots.delimiter({
                        ...props,
                        data: d,
                        index: i,
                        value: childOptions.domProps.innerHTML,
                    }));
                } else res.push(delimiterEl);
            }

            if (childEl) res.push(childEl);


            return res;
        }, [] as VNodeChildren);

        return h('span', {
            ...data,
            class: {
                ...getBindClass(data.class),
                'p-text-list': true,
            },
        }, children);
    },
};
</script>

<style lang="postcss">
.p-text-list {
    line-height: 1.8;
    a.list-item:hover {
        @apply underline text-secondary cursor-pointer;
    }
}
</style>
