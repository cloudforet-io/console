<script>
import { toRefs } from '@vue/composition-api';
import LNBTemplate, { setRouteState } from '@/views/containers/lnb/LNB.template.vue';
import routes from '@/routes/project/project-route';

export default {
    name: 'ProjectNavBar',
    extends: LNBTemplate,
    setup() {
        return {
            ...toRefs(setRouteState([routes])),
        };
    },
};
</script>
