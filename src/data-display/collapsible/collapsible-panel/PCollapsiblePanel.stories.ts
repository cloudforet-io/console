import PCollapsiblePanel from '@/data-display/collapsible/collapsible-panel/PCollapsiblePanel.vue';

export default {
    title: 'Data Display/Collapsible',
    component: PCollapsiblePanel,
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=6132%3A124041',
        },
    },
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
