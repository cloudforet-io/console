<template>
    <input v-focus.lazy="isFocused"
           v-bind="$attrs"
           placeholder="YYYY-MM-DD"
           type="text"
           v-on="datetimeListeners"
    >
</template>

<script lang="ts">
import { makeByPassListeners } from '@/components/util/composition-helpers';
import { ComponentRenderProxy, getCurrentInstance } from '@vue/composition-api';

export default {
    name: 'QuerySearchDatetime',
    props: {
        isFocused: {
            type: Boolean,
            default: undefined,
        },
        inputListeners: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const datetimeFormatRegex = RegExp(/^(\d{4}-\d{2}-\d{2})$/);

        const datetimeListeners = {
            ...props.inputListeners,
            keyup(e: KeyboardEvent) {
                if (e.code === 'Enter') {
                    let res = datetimeFormatRegex.exec(vm.$attrs.value);
                    if (res) res = res[0];
                    else res = vm.$attrs.value;
                    vm.$emit('search', res, e);
                }
                vm.$emit('keyup', e);
            },
        };
        return {
            datetimeListeners,
        };
    },
};
</script>
