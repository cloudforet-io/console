import PEmpty from '@/components/atoms/empty/PEmpty.vue';

export default {
    title: 'Data Display/Empty',
    component: PEmpty,
    parameters: {
        info: {
            summary: '',
            components: { PEmpty },
        },
    },
};
const actions = {};
export const empty = () => ({
    components: { PEmpty },
    template: '<p-empty>No Items</p-empty>',
    setup(props, context) {
        return {
            ...actions,
        };
    },
});
