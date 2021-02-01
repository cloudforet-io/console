import PEmpty from '@/data-display/empty/PEmpty.vue';

export default {
    title: 'Data Display/Empty',
    component: PEmpty,
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=5894%3A179434',
        },
    },
};
const actions = {};
export const noItems = () => ({
    components: { PEmpty },
    template: '<p-empty>No Items</p-empty>',
    setup(props, context) {
        return {
            ...actions,
        };
    },
});
