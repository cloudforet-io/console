<template>
    <div v-if="!isLoading">
        <s-dynamic-layout v-for="(layout,idx) in options.layouts||[]" :key="idx"
                          v-bind="layout"
                          :api="api"
                          :data="data"
                          :is-show="isShow" :is-loading="isLoading"
                          v-on="$listeners"
        >
            <template v-for="(slot) of slotNames" v-slot:[slot]="scope">
                <slot :name="`${name}-${slot}`" v-bind="scope" />
            </template>
        </s-dynamic-layout>
    </div>
</template>

<script lang="ts">
import { computed, getCurrentInstance } from '@vue/composition-api';
import SDynamicLayout from '@/components/organisms/dynamic-view/dynamic-layout/SDynamicLayout.vue';
import { map, replace } from 'lodash';

export default {
    name: 'SDynamicLayoutList',
    components: { SDynamicLayout },
    props: {
        name: {
            type: String,
            required: true,
        },
        options: {
            type: Object,
            default: () => ({}),
        },
        data: {
            type: [Object, Array],
            default: null,
        },
        api: {
            type: Object,
            default: null,
        },
        isShow: {
            type: Boolean,
            default: true,
        },
        isLoading: {
            type: Boolean,
            required: true,
        },
    },
    setup(props) {
        const vm = getCurrentInstance();
        return {
            slotNames: computed(() => (vm ? map(vm.$scopedSlots, (slot: string, name) => replace(name, `${props.name}-`, '')) : [])),
        };
    },
};
</script>
