<template>
    <div class="p-list">
        <ul>
            <li v-for="(item, index) in items" :key="`${contextKey}-${index}`">
                <slot name="item" v-bind="{item, index}" />
            </li>
        </ul>
    </div>
</template>

<script lang="ts">

import { defineComponent, reactive, toRefs } from '@vue/composition-api';

interface Props {
    items: any[];
}


export default defineComponent<Props>({
    name: 'PList',
    props: {
        items: {
            type: Array,
            default: () => [],
        },
        styleType: {
            type: String,
            default: 'gray',
        },
    },
    setup(props: Props) {
        const state = reactive({
            contextKey: Math.floor(Math.random() * Date.now()),
        });
        return {
            ...toRefs(state),
        };
    },
});
</script>

<style lang="postcss">
.p-list {

}
</style>
