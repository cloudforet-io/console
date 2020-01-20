<script>
import {
    ref, toRefs, computed, reactive, onMounted, watch,
} from '@vue/composition-api';
import AddCdgTemplate, { cdgSetup, eventNames } from '@/views/secret/credentials-group/pages/AddCredentials.template.vue';
import { mountBusEvent } from '@/lib/compostion-util';
import { defaultQuery, Validation } from '@/lib/api';
import cdgEventBus from '@/views/secret/credentials-group/CredentialsGroupEventBus';

export default {
    name: 'PCdData',
    extends: AddCdgTemplate,

    setup(props, context) {
        const cdgEventNames = eventNames;
        cdgEventNames.getCdList = 'getCd';
        cdgEventNames.tagConfirmEvent = 'CdgTagConfirmEvent';
        cdgEventNames.tagResetEvent = 'resetTagEvent';
        const state = reactive({
            ...cdgSetup(props, context, cdgEventNames),
        });
        const cdRequestState = reactive({
            query: computed(() => (defaultQuery(
                state.cdData.thisPage, state.cdData.pageSize,
                state.cdData.sortBy, state.cdData.sortDesc,
                state.cdData.searchText,
            ))),
        });
        const requestCdList = async () => {
            state.cdData.loading = true;
            state.cdData.items = [];
            const param = {
                query: cdRequestState.query,
                // eslint-disable-next-line camelcase
                include_credential_group: true,
            };
            console.log('test')
            try {
                console.log('start', state.cdData.loading);
                const res = await context.parent.$http.post('/secret/credential/list', param);
                state.cdData.items = res.data.results;
                const allPage = Math.ceil(res.data.total_count / state.cdData.pageSize);
                state.cdData.allPage = allPage || 1;
                state.cdData.selectIndex = [];
                state.cdData.loading = false;
            } catch (e) {
                console.log(e);
                state.cdData.loading = false;
            }
        };

        mountBusEvent(cdgEventBus, cdgEventNames.getCdList, requestCdList);

        requestCdList();

        return {
            ...toRefs(state),
        };
    },
};
</script>
