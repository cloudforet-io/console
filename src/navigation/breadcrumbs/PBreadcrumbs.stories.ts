import { object, withKnobs } from '@storybook/addon-knobs';
import PBreadcrumbs from './PBreadcrumbs.vue';

export default {
    title: 'Navigation/Breadcrumbs',
    component: PBreadcrumbs,
    decorators: [withKnobs],
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=5894%3A178955',
        },
    },
};

export const basic = () => ({
    components: { PBreadcrumbs },
    template: '<p-breadcrumbs :routes="route"></p-breadcrumbs>',
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
