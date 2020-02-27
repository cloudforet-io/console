<template>
    <div v-if="dvs.length >= 1">
        <template v-for="dv in dvs">
            <PDividerHeader :key="dv.name">
                {{ dv.name }}
            </PDividerHeader>
            <p-dynamic-view :key="dv.name+'-dv'" v-bind="dv" :data="data" />
        </template>
    </div>
    <p-empty v-else style="margin-top: 1rem">
        No data
    </p-empty>
</template>

<script lang="ts">
import { computed, defineComponent } from '@vue/composition-api';
import PDynamicView from '@/components/organisms/dynamic-view/dynamic-view/DynamicView.vue';
import PDividerHeader from '@/components/molecules/divider-header/DividerHeader.vue';
import PEmpty from '@/components/atoms/empty/Empty.vue';

interface DV{
    // eslint-disable-next-line camelcase
    data_source:any[]
    // eslint-disable-next-line camelcase
    view_type?:string;
    // eslint-disable-next-line camelcase
    key_path?:string;
}

interface Props {
    details:DV[];
    data:any;
}


export default defineComponent({
    name: 'PDynamicDetails',
    components: {
        PDynamicView, PDividerHeader, PEmpty,
    },
    props: {
        details: {
            type: Array,
            required: true,
        },
        data: {
            type: Object,
            required: true,
        },
    },
    setup(props) {
        const dvs = computed(() => {
            const result:DV[] = [];
            // eslint-disable-next-line no-restricted-syntax
            for (const dv of props.details as DV[]) {
                if (!dv.view_type) {
                    // eslint-disable-next-line camelcase
                    dv.view_type = 'item';
                }
                result.push(dv);
            }
            return result;
        });
        return {
            dvs,
        };
    },

});
</script>
