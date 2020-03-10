<template>
    <div class="p-panel-top" :style="panelTitleStyle">
        <div class="panel-card">
            <div class="p-panel-top-header">
                <div class="p-panel-top-header-title">
                    <slot>
                        {{ panelTitle }}
                    </slot>
                </div>
                <slot name="head" />
            </div>
            <hr>
            <slot name="body" />
        </div>
    </div>
</template>

<script>
export default {
    name: 'PPanelTop',
    props: {
        panelTitle: {
            type: String,
            default: 'Title',
        },
        panelTitleStyle: {
            type: Object,
            default: null,
        },
    },

};
</script>

<style lang="postcss" scoped>
    .p-panel-top{
        padding-left: 0;
        padding-right: 0;
    }
    .panel-card{
        border:none;
        @apply relative flex flex-col min-w-0 break-words;
    }
    hr{
        margin-top: 0rem;
    }
    .p-panel-top-header{
        text-align: left;
        font:  18px Arial;
        letter-spacing: 0;
        color: #202433;
        opacity: 1;
        margin-top: 0.5rem;
        margin-bottom: 0.5rem;
        display: flex;
    }
    .p-panel-top-header-title{
        align-self:center;
            }
</style>
