<script>
import { toRefs } from '@vue/composition-api';
import LNBTemplate, { setRouteState } from '@/views/containers/lnb/LNB.template.vue';
import routes from '@/routes/secret/secret-route';

export default {
    name: 'SecretNavBar',
    extends: LNBTemplate,
    setup() {
        return {
            ...toRefs(setRouteState([routes])),
        };
    },
};
</script>
