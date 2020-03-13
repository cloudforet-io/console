<script>
import { computed, toRefs } from '@vue/composition-api';
import ProjectTemplate, { projectSetup } from '@/views/identity/project/pages/project2.template.vue';
import { tabIsShow } from '@/lib/compostion-util';
import { AdminTableAPI, HistoryAPI, QuerySearchTableAPI } from '@/lib/api/table';
import {ProjectNode, ProjectTreeAPI} from '@/lib/api/tree';
import { QuerySearchTableACHandler } from '@/lib/api/auto-complete';

export default {
    name: 'Project2',
    extends: ProjectTemplate,
    setup(props, context) {
        const keyAutoCompletes = ['name', 'group', 'provider'];
        const onlyFields = [...keyAutoCompletes, 'data_source'];

        const csTypeACHandlerMeta = {
            handlerClass: QuerySearchTableACHandler,
            args: {
                keys: keyAutoCompletes,
                suggestKeys: keyAutoCompletes,
            },
        };
        //
        // const apiHandler = new ProjectTreeAPI(
        //     // eslint-disable-next-line camelcase
        //     '/identity/project-group/list', onlyFields,
        //     undefined, undefined, csTypeACHandlerMeta,
        // );
        // const dvApiHandler = new QuerySearchTableAPI('/identity/project/member/list');
        // apiHandler.getData();
        //
        // const state = projectSetup(context, apiHandler, dvApiHandler);
        // const selectId = computed(() => dvApiHandler.tableTS.selectState.firstSelectItem.project_member_id);

    },
};
</script>

<style scoped>

</style>
