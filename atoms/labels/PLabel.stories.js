import PLabel from '@/components/atoms/labels/PLabel.vue';

export default {
    title: 'Others/Definition, Label, Item/Label',
    component: PLabel,
    parameters: {
        info: {
            summary: '',
            components: { PLabel },
        },
    },
};

export const DefaultCase = () => ({
    components: { PLabel },
    template: '<p-label>This is label.</p-label>',
});
