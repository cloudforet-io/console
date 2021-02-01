import PCollapsibleToggle from '@/inputs/buttons/collapsible-toggle/PCollapsibleToggle.vue';
import { ref } from '@vue/composition-api';

export default {
    title: 'Inputs/Buttons/Collapsible Toggle',
    component: PCollapsibleToggle,
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=5737%3A132434',
        },
    },
};

export const collapsibleToggle = () => ({
    components: { PCollapsibleToggle },
    template: `
        <div>
            <p-collapsible-toggle :is-collapsed.sync="isCollapsed">
                collapsible toggle
            </p-collapsible-toggle>
            <span>State : {{isCollapsed?'collapsed':'opened'}}</span>
        </div>`,
    setup() {
        return {
            isCollapsed: ref(true),
        };
    },
});
