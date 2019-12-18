import PLabel from './Label';


export default {
    title: 'atoms/legends/label',
    component: PLabel,
    parameters: {
        info: {
            summary: '',
            components: { PLabel },
        },
    },
};

export const label = () => ({
    components: { PLabel },
    template: '<p-label>this is label</p-label>',
});
