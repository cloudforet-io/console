<template>
    <panel-top :panel-title="infoTitle">
        <template #body>
            <panel-content :definition-list="contentData" />
        </template>
    </panel-top>
</template>

<script>
import PanelTop from '@/components/molecules/panel/panel-top/PanelTop';
import PanelContent from '@/components/molecules/panel/panel-content/PanelContent';
export default {
    name: 'InfoPanel',
    components: {
        PanelContent,
        PanelTop,
    },
    props: {
        infoTitle: {
            type: String,
            default: 'NoTitle',
        },
        contentData: {
            type: String,
            default: 'NoTitle',
        },
    },
    methods: {

    },
};
</script>

<style lang="scss" scoped>
</style>
