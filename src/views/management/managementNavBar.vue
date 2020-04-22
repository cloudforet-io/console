<script>
import { toRefs } from '@vue/composition-api';
import LNBTemplate, { setRouteState } from '@/views/containers/lnb/LNB.template.vue';
import routes from '@/routes/management/management-route';

export default {
    name: 'ManagementNavBar',
    extends: LNBTemplate,
    setup() {
        return {
            ...toRefs(setRouteState([routes])),
        };
    },
};
</script>
