<script>
import { toRefs } from '@vue/composition-api';
import LNBTemplate, { setRouteState } from '@/views/containers/lnb/LNB.template.vue';
import routes from '@/routes/dashboard/dashboard-route';

export default {
    name: 'DashboardNavBar',
    extends: LNBTemplate,
    setup() {
        return {
            ...toRefs(setRouteState([routes])),
        };
    },
};
</script>
