<template>
    <p-panel-top :panel-title="infoTitle" :panel-title-style="infoTitleStyle" class="info-panel-basic">
        <template #body>
            <slot>
                <p-panel-content :defs="defs" :item="item">
                    <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope">
                        <slot :name="slot" v-bind="scope" />
                    </template>
                </p-panel-content>
            </slot>
        </template>
    </p-panel-top>
</template>

<script>
import PPanelTop from '@/components/molecules/panel/panel-top/PanelTop';
import PPanelContent from '@/components/molecules/panel/panel-content/PanelContent';

export default {
    name: 'PInfoPanel',
    components: {
        PPanelContent,
        PPanelTop,
    },
    props: {
        infoTitle: {
            type: String,
            default: 'NoTitle',
        },
        infoTitleStyle: {
            type: Object,
            default: null,
        },
        defs: {
            type: Array,
            default: () => [],
        },
        item: {
            type: Object,
            default: () => {},
        },
    },
    methods: {

    },
};
</script>

<style lang="scss" scoped>
    .info-panel-basic {
    min-height: 100px}
</style>
