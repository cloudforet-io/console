import PServiceAccountsTable from './ServiceAccountsTable.vue';

export default {
    title: 'views/widgets/ServiceAccountsTable',
    component: PServiceAccountsTable,
    parameters: {
        info: {
            summary: '',
            components: { PServiceAccountsTable },
        },
        knobs: { escapeHTML: false },
    },
};


export const defaultCase = () => ({
    components: { PServiceAccountsTable },
    template: `
    <div style="width: 80vw;">
        <PServiceAccountsTable v-bind="$props"></PServiceAccountsTable>
    </div>`,
    setup(props, context) {
        return {};
    },
});
