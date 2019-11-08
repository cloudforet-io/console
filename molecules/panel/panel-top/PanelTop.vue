<template>
    <div class="col-sm-12" :style="panelTitleStyle">
        <div class="card panel-card">
            <div class="panel-header">
                {{ panelTitle }}
                <slot name="head"></slot>
            </div>
            <hr>
            <slot name="body" />
        </div>
    </div>
</template>

<script>
export default {
    name: 'PanelTop',
    props: {
        panelTitle: {
            type: String,
            default: 'NoTitle',
        },
        panelTitleStyle: {
            type: Object,
            default: null,
        },
    },
    methods: {

    },
};
</script>

<style lang="scss" scoped>
    .panel-card{
        border:none;
    }
    .panel-header{
        text-align: left;
        font:  18px/21px Arial;
        letter-spacing: 0;
        color: #202433;
        opacity: 1;
    }
</style>
