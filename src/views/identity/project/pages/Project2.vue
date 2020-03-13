<script>
    import {computed, defineComponent, getCurrentInstance, toRefs} from '@vue/composition-api';
import ProjectTemplate, { projectSetup, APIHandler } from '@/views/identity/project/pages/Project2.template.vue';
import { tabIsShow } from '@/lib/compostion-util';
import { AdminTableAPI, HistoryAPI, QuerySearchTableAPI } from '@/lib/api/table';
import { ProjectNode, ProjectTreeAPI } from '@/lib/api/tree';
import { QuerySearchTableACHandler } from '@/lib/api/auto-complete';

export default defineComponent({
    name: 'Project2',
    extends: ProjectTemplate,
    setup(props, context) {
        const vm = getCurrentInstance();
        const mockAPI = new QuerySearchTableAPI('', undefined, undefined, undefined, undefined, undefined, undefined);

        const keyAutoCompletes = ['name', 'group', 'provider'];
        const onlyFields = [...keyAutoCompletes, 'data_source'];

        const csTypeACHandlerMeta = {
            handlerClass: QuerySearchTableACHandler,
            args: {
                keys: keyAutoCompletes,
                suggestKeys: keyAutoCompletes,
            },
        };
        const getApi = new APIHandler('/identity/project/get', (node) => {
            // eslint-disable-next-line eqeqeq
            if (node.data.item_type == 'PROJECT_GROUP') return {};
            return {
                // eslint-disable-next-line camelcase
                project_id: node.data.id,
            };
        }, (res, node) => {
            vm.item = res.data;
        });
        return {
            ...projectSetup(vm, context,
                mockAPI, mockAPI),
            getApi,
        };
    },
});
</script>