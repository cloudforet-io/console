import { computed } from '@vue/composition-api';
import { array, object } from '@storybook/addon-knobs';
import PPageNavigation from './PPageNavigation.vue';

export default {
    title: 'Navigation/PageNavigation',
    component: PPageNavigation,
    parameters: {
        info: {
            summary: '',
            components: { PPageNavigation },
        },
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=5894%3A178955',
        },
    },
};

export const pageNavigation = () => ({
    components: { PPageNavigation },
    template: '<p-page-navigation :routes="route"></p-page-navigation>',
    props: {
        route: {
            type: Array,
            default: [
                { name: 'Automation', path: '/automation' },
                { name: 'Power Scheduler', path: '/automation/power-scheduler' },
                { name: 'Page3', path: '/automation/power-scheduler' },
                { name: 'Page4', path: '/automation/power-scheduler' },
                { name: 'Page5', path: '/automation/power-scheduler' },
                { name: 'Page6', path: '/automation/power-scheduler' },
            ],
        },
    },
});
