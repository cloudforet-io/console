<template>
    <p-panel-top :panel-title="infoTitle" :panel-title-style="infoTitleStyle">
        <template #body>
            <p-panel-content :definition-list="contentData" />
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
        contentData: {
            type: Array,
            default: () => [],
        },
    },
    methods: {

    },
};
</script>

<style lang="scss" scoped>
</style>
