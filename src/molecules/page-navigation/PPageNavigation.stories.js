import { object } from '@storybook/addon-knobs';
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
            default: object('pages', [
                { name: 'Page1', path: '/page1' },
                { name: 'Page3' },
                { name: 'Page2' },
                { name: 'Page4' },
                { name: 'Page5' },
                { name: 'Page6' },
            ]),
        },
    },
});
