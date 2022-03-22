<template>
    <div class="gnb-search-input">
        <p-i v-if="!value"
             name="ic_search"
             height="1rem"
             width="1rem"
        />
        <input ref="inputRef"
               :value="value"
               placeholder="Search..."
               @input="$emit('update:value', $event.target.value)"
               @focus="$emit('update:isFocused', true)"
               @blur="$emit('update:isFocused', false)"
               v-on="$listeners"
        >
    </div>
</template>

<script lang="ts">
import {
    defineComponent,
    reactive, toRefs, watch,
} from '@vue/composition-api';
import { PI } from '@spaceone/design-system';

interface Props {
    value: string;
    isFocused: boolean;
}

export default defineComponent<Props>({
    name: 'GNBSearchInput',
    components: {
        PI,
    },
    model: {
        prop: 'value',
        event: 'update:value',
    },
    props: {
        value: {
            type: String,
            default: '',
        },
        isFocused: {
            type: Boolean,
            default: false,
        },
    },
    setup(props) {
        const state = reactive({
            inputRef: null as null|HTMLElement,
        });

        watch(() => props.isFocused, (isFocused) => {
            if (!state.inputRef) return;
            if (isFocused) state.inputRef.focus();
            else state.inputRef.blur();
        });


        return {
            ...toRefs(state),
        };
    },
});
</script>

<style lang="postcss" scoped>
.gnb-search-input {
    /* TODO */
}
</style>
