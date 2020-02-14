<template>
    <div>
        <template v-for="dv in details">
            <PDividerHeader :key="dv.name">
                {{ dv.name }}
            </PDividerHeader>
            <p-dynamic-view :key="dv.name" v-bind="dv" :data="data" />
        </template>
    </div>
</template>

<script lang="ts">
import { computed, createComponent } from '@vue/composition-api';
import PDynamicView from '@/components/organisms/dynamic-view/dynamic-view/DynamicView.vue';
import PDividerHeader from '@/components/molecules/divider-header/DividerHeader.vue';

interface Props {
    details:any[];
    data:any;
}
export default createComponent({
    name: 'PDynamicDetails',
    components: {
        PDynamicView, PDividerHeader,
    },
    props: {
        details: Array,
        data: Object,
    },

});
</script>
