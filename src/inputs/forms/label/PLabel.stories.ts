import PLabel from '@/inputs/forms/label/PLabel.vue';

export default {
    title: 'Inputs/Forms/Label',
    component: PLabel,
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=5299%3A8007',
        },
    },
};

export const label = () => ({
    components: { PLabel },
    template: '<p-label>This is label.</p-label>',
});
