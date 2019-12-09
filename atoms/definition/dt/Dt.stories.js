import PDt from './Dt';


export default {
    title: 'atoms/definition/dt',
    component: PDt,
    parameters: {
        info: {
            summary: '',
            components: { PDt },
        },
    },
};

export const dt = () => ({
    components: { PDt },
    template: '<p-dt>dt</p-dt>',
});
