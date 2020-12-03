import { computed } from '@vue/composition-api';
import PPageNavigation from './PPageNavigation.vue';

export default {
    title: 'Navigation/PageNavigation',
    component: PPageNavigation,
    parameters: {
        info: {
            summary: '',
            components: { PPageNavigation },
        },
    },
};

export const pageNavigation = () => ({
    components: { PPageNavigation },
    template: '<p-page-navigation :routes="route"></p-page-navigation>',
    props: {
        route: {
            type: Array,
            default: [{ name: 'Automation', path: '/automation' }, { name: 'Power Scheduler', path: '/automation/power-scheduler' }],
        },
    },
});
