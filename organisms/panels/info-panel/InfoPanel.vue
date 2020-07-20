<template>
    <div class="info-panel-basic">
        <p-panel-top>
            {{ infoTitle }}
        </p-panel-top>
        <slot>
            <p-panel-content :defs="defs" :item="item">
                <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope">
                    <slot :name="slot" v-bind="scope" />
                </template>
            </p-panel-content>
        </slot>
    </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import PPanelTop from '@/components/molecules/panel/panel-top/PPanelTop.vue';
import PPanelContent from '@/components/molecules/panel/panel-content/PPanelContent.vue';

export default defineComponent({
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
        defs: {
            type: Array,
            default: () => [],
        },
        item: {
            type: Object,
            default: () => ({}),
        },
    },
});
</script>

<style lang="postcss" scoped>
    .info-panel-basic {
        min-height: 100px;
    }
</style>
