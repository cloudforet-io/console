<template>
    <div v-if="!isLoading">
        <SDynamicLayout v-for="(layout,idx) in options.layouts||[]" :key="idx"

                        v-bind="layout"
                        :api="api"
                        :data="data"
                        :is-show="isShow" :is-loading="isLoading"
        >
            <template v-for="(slot) of slotNames" v-slot:[slot]="scope">
                <slot :name="`${name}-${slot}`" v-bind="scope" />
            </template>
        </SDynamicLayout>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, getCurrentInstance } from '@vue/composition-api';
import SDynamicLayout from '@/components/organisms/dynamic-view/dynamic-layout/SDynamicLayout.vue';

export default defineComponent({
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
            slotNames: computed(() => (vm ? _.map(vm.$scopedSlots, (slot: string, name) => _.replace(name, `${props.name}-`, '')) : [])),
        };
    },
});
</script>
