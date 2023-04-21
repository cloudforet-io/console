<script lang="ts">
import { h } from 'vue';
import type { SetupContext } from 'vue';

export default {
    name: 'PDivider',
    props: {
        vertical: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { attrs }: SetupContext) {
        return () => h(props.vertical ? 'div' : 'hr', {
            ...attrs,
            class: {
                'p-divider': true,
                vertical: props.vertical,
            },
        });
    },
};
</script>

<style lang="postcss">
.p-divider {
    @apply text-gray-200 bg-gray-200;
    width: 100%;
    height: 1px;
    border: none;
    margin-top: 0;
    margin-bottom: 0;

    &.vertical {
        height: initial;
        width: 1px;
        margin-left: 0;
        margin-right: 0;
    }
}
</style>
