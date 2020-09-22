import { reactive, toRefs } from '@vue/composition-api';
import PDatePagination from '@/components/organisms/date-pagination/PDatePagination.vue';
import dayjs from 'dayjs';

export default {
    title: 'organisms/date-pagination',
    component: PDatePagination,
};

export const monthCase = () => ({
    components: { PDatePagination },
    template: `
<div>
    <p-date-pagination :date.sync="now" type="month" />
    <div>
        <p>previous month: {{ now.subtract(1, 'month').format('YYYY-MM') }}</p>
        <b>current month: {{ now.format('YYYY-MM') }}</b>
        <p>next month: {{ now.add(1, 'month').format('YYYY-MM') }}</p>
    </div>
</div>`,
    props: {},
    setup() {
        const state = reactive({
            now: dayjs(),
        });
        return {
            ...toRefs(state),
        };
    },
});

export const weekCase = () => ({
    components: { PDatePagination },
    template: `
<div>
    <p-date-pagination :date.sync="now" type="week" />
    <div>
        <p>{{ now.startOf('week').format('YYYY-MM-DD') }} - {{ now.endOf('week').format('YYYY-MM-DD') }}</p>
    </div>
</div>`,
    props: {},
    setup() {
        const state = reactive({
            now: dayjs(),
        });
        return {
            ...toRefs(state),
        };
    },
});