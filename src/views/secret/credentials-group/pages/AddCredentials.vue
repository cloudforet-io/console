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
        const cdEventNames = eventNames;
        cdEventNames.getCdList = 'getCd';
        cdEventNames.tagConfirmEvent = 'CdTagConfirmEvent';
        cdEventNames.tagResetEvent = 'resetTagEvent';
        cdEventNames.addCd = 'addCd';

        const state = cdgSetup(props, context, cdEventNames);
        const cdRequestState = reactive({
            query: computed(() => (defaultQuery(
                state.thisPage, state.pageSize,
                state.sortBy, state.sortDesc,
                state.searchText,
            ))),
        });
        const requestCdList = async () => {
            state.loading = true;
            state.items = [];
            const param = {
                query: cdRequestState.query,
                // eslint-disable-next-line camelcase
                include_credential_group: true,
            };

            try {
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

        const getCdsParam = (items) => {
            const result = {
                // eslint-disable-next-line camelcase
                credential_id: items[0].credential_id,
                credential_group_id: context.root.$route.params.id,
                name: _.map(items, 'name'),
                tags: _.map(items, 'tags'),
            };
            return result;
        };

        const addCd = async (items) => {
            await context.parent.$http.post('/secret/credential-group/credential/add', getCdsParam(items)).then(async (_) => {
                await requestCdList();
                context.root.$notify({
                    group: 'noticeBottomRight',
                    type: 'success',
                    title: 'success',
                    text: 'Add Credentials Successfully',
                    duration: 2000,
                    speed: 1000,
                });
            }).catch((error) => {
                console.log(error);
                context.root.$notify({
                    group: 'noticeBottomRight',
                    type: 'alert',
                    title: 'Fail',
                    text: 'request Fail',
                    duration: 2000,
                    speed: 1000,
                });
            });
        };

        mountBusEvent(cdgEventBus, cdEventNames.getCdList, requestCdList);
        mountBusEvent(cdgEventBus, cdEventNames.addCd, addCd);

        requestCdList();
        return {
            ...toRefs(state),
        };
    },
};
</script>
