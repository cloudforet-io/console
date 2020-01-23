<script>
import {
    ref, toRefs, computed, reactive, onMounted, watch,
} from '@vue/composition-api';
import AddCdgTemplate, { cdgSetup, eventNames } from '@/views/secret/credentials-group/pages/AddCredentials.template.vue';
import { mountBusEvent } from '@/lib/compostion-util';
import { defaultQuery, Validation } from '@/lib/api';
import cdgEventBus from '@/views/secret/credentials-group/CredentialsGroupEventBus';

export default {
    name: 'AddCdg',
    extends: AddCdgTemplate,

    setup(props, context) {
        const cdgEventNames = eventNames;
        cdgEventNames.getCdList = 'getCd';
        cdgEventNames.tagConfirmEvent = 'CdgTagConfirmEvent';
        cdgEventNames.tagResetEvent = 'resetTagEvent';
        const state = cdgSetup(props, context, cdgEventNames);
        const cdRequestState = reactive({
            query: computed(() => (defaultQuery(
                state.thisPage, state.pageSize,
                state.sortBy, state.sortDesc,
                state.searchText,
            ))),
        });
        const requestCdList = async () => {
            console.log('request cd list test')
            state.loading = true;
            state.items = [];
            const param = {
                query: cdRequestState.query,
                // eslint-disable-next-line camelcase
                include_credential_group: true,
            };

            try {
                console.log('start', state.loading);
                const res = await context.parent.$http.post('/secret/credential/list', param);
                state.items = res.data.results;
                const allPage = Math.ceil(res.data.total_count / state.pageSize);
                state.allPage = allPage || 1;
                state.selectIndex = [];
                state.loading = false;
            } catch (e) {
                console.log(e);
                state.loading = false;
            }
        };

        mountBusEvent(cdgEventBus, cdgEventNames.getCdList, requestCdList);


        return {
            ...toRefs(state),
        };
    },
};
</script>
