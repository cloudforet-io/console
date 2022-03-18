<template>
    <div class="gnb-search-input">
        <p-i v-if="!value"
             name="ic_search"
             height="1rem"
             width="1rem"
        />
        <input :value="value"
               placeholder="Search..."
               @input="value"
               v-on="$listeners"
        >
    </div>
</template>

<script lang="ts">
import {
    defineComponent,
    reactive, toRefs,
} from '@vue/composition-api';
import { PI } from '@spaceone/design-system';

interface Props {
    value: string;
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
    },
    setup() {
        const state = reactive({});

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
