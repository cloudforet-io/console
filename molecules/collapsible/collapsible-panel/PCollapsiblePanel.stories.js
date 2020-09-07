import PCollapsiblePanel from '@/components/molecules/collapsible/collapsible-panel/PCollapsiblePanel.vue';

export default {
    title: 'molecules/collapsible/collapsible-panel/PCollapsiblePanel',
    component: PCollapsiblePanel,
};


export const defaultCase = () => ({
    components: { PCollapsiblePanel },
    props: {},
    template: `
<div style="width: 20rem">
    <p-collapsible-panel v-bind="$props">
        <template #content>
            sample description
        </template>
    </p-collapsible-panel>
</div>`,
});
