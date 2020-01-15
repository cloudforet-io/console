<script>
import { toRefs } from '@vue/composition-api';
import LNBTemplate, { setRouteState } from '@/views/containers/lnb/LNB.template.vue';
import routes from '@/routes/inventory/inventory-route';

export default {
    name: 'InventoryNavBar',
    extends: LNBTemplate,
    setup() {
        return {
            ...toRefs(setRouteState([routes])),
        };
    },
};
</script>
