
<script>
import { toRefs, computed } from '@vue/composition-api';
import ServerTemplate, { serverSetup } from '@/views/inventory/server/Server.template';
import { arrayOf } from '@/lib/casual';
import casual from '@/views/inventory/server/models/server-model';


export default {
    name: 'Server',
    extends: ServerTemplate,
    setup(props, context) {
        const state = serverSetup(props, context);
        const items = computed(() => arrayOf(state.pageSize, casual._server));
        const tagConfirm = (tag) => {
            console.log(tag);
            setTimeout(() => {
            // 1초 후 작동해야할 코드
                state.serverDetail.resetTag();
                console.log('force reset Tag!!!');
            }, 2000);
        };
        return {
            ...toRefs(state),
            items,
            tagConfirm,
        };
    },
};
</script>
