import PCollapsibleToggle from '@/atoms/collapsible-toggle/PCollapsibleToggle.vue';
import { withDesign } from 'storybook-addon-designs';
import { ref } from '@vue/composition-api';
import { action } from '@storybook/addon-actions';

export default {
    title: 'Inputs/Buttons/Collapsible Toggle',
    component: PCollapsibleToggle,
    decorators: [withDesign],
    parameters: {
        info: {
            summary: '',
            components: { PCollapsibleToggle },
        },
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
