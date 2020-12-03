import PCollapsiblePanel from '@/components/molecules/collapsible/collapsible-panel/PCollapsiblePanel.vue';

export default {
    title: 'Data Display/Collapsible',
    component: PCollapsiblePanel,
};


export const collapsiblePanel = () => ({
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
