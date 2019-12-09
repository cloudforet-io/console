import PDd from './Dd';


export default {
    title: 'atoms/definition/dd',
    component: PDd,
    parameters: {
        info: {
            summary: '',
            components: { PDd },
        },
    },
};

export const dd = () => ({
    components: { PDd },
    template: '<p-dd>dd</p-dd>',
});
