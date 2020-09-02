<template>
    <div>
        <p-panel-top>Base Information</p-panel-top>

        <p-definition-table
                            :data="data"
                            :loading="loading"
        />
    </div>
</template>

<script lang="ts">
import PPanelTop from '@/components/molecules/panel/panel-top/PPanelTop.vue';
import PDefinitionTable from '@/components/organisms/tables/definition-table/PDefinitionTable.vue';
import { useStore } from '@/store/toolset';
import { reactive } from '@vue/composition-api';

export default {
    name: 'ServiceAccountDetail',
    components: {
        PDefinitionTable,
        PPanelTop,

    },
    props: {
        data: {
            type: Object,
            default: () => ({}),
        },
        loading: {
            type: Boolean,
            default: true,
        },
    },
    setup(props) {
        const state = reactive({
            baseInfoFields: [

            ],
        });
    },
};
</script>

<style lang="postcss" scoped>

</style>
