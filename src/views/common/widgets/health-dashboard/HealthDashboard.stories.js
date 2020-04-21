import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import PHealthDashboard from '@/views/common/widgets/health-dashboard/HealthDashboard.vue';

export default {
    title: 'views/widgets/HealthDashboard',
    component: PHealthDashboard,
    parameters: {
        info: {
            summary: '',
            components: { PHealthDashboard },
        },
        knobs: { escapeHTML: false },
    },
};

const getProps = () => ({});

const getState = (props, context) => {
    const state = reactive({});

    return state;
};

export const defaultCase = () => ({
    components: { PHealthDashboard },
    props: getProps(),
    template: `
    <div style="width: 80vw;">
        <PHealthDashboard v-bind="$props"></PHealthDashboard>
    </div>`,
    setup(props, context) {
        const state = getState(props, context);

        return {
            ...toRefs(state),
        };
    },
});
