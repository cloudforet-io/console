<script>
import {
    toRefs, computed, reactive,
} from '@vue/composition-api';
import CdgTemplate, { cdgSetup, eventNames } from '@/views/secret/credentials-group/CredentialsGroup.template.vue';
import cdgEventBus from '@/views/secret/credentials-group/CredentialsGroupEventBus';
import { mountBusEvent, Validation } from '@/lib/compostion-util';
import { defaultQuery } from '@/lib/api';

export default {
    name: 'Cdg',
    extends: CdgTemplate,
    setup(props, context) {
        const cdgEventNames = eventNames;
        cdgEventNames.getCdg = 'getCdg';
        cdgEventNames.tagConfirmEvent = 'CdgTagConfirmEvent';
        cdgEventNames.tagResetEvent = 'resetUserTagEvent';
        cdgEventNames.deleteCdg = 'deleteCdg';
        cdgEventNames.createCdg = 'createCdg';
        cdgEventNames.updateCdg = 'updateCdg';
        const cdgNameValidation = new Validation(async (value) => {
            let result = false;
            console.log('name validation test', value);
            await context.parent.$http.post('/secret/credential-group/list', {
                domain_id: sessionStorage.domainId,
                query: {
                    minimal: true,
                    filter: [{
                        k: 'name',
                        v: value,
                        o: 'eq',
                    }],
                },
            }).then((res) => {
                console.log(res);
                if (res.data.total_count === 0) {
                    result = true;
                }
            });
            return result;
        }, 'Duplicated Credential Group Name');
        const state = cdgSetup(props, context, cdgEventNames, cdgNameValidation);

        const requestState = reactive({
            query: computed(() => (defaultQuery(
                state.thisPage, state.pageSize,
                state.sortBy, state.sortDesc,
                state.searchText,
            ))),
        });
        const requestCdgList = async () => {
            console.log('before', state.loading);
            state.loading = true;
            state.items = [];
            try {
                console.log('start', state.loading);
                const res = await context.parent.$http.post('/secret/credential-group/list', {
                    query: requestState.query,
                });
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
        const CdgTagConfirm = async (cdgId, tags, originTags) => {
            const idx = state.selectIndex[0];
            await context.parent.$http.post('/secret/credential-group/update', {
                credential_group_id: cdgId,
                tags,
            }).then((_) => {
                state.items[idx].tags = tags;
            }).catch((error) => {
                cdgEventBus.$emit(cdgEventNames.tagResetEvent);
                state.items[idx].tags = originTags;
                console.error(error);
            });
        };
        const getCdgsParam = (items) => {
            const result = { credential_group_id: _.map(items, 'credential_group_id') };
            console.log('item test', result);
            return result;
        };
        const deleteCdg = async (items) => {
            // console.log('delete test', items.credential_group_id);
            await context.parent.$http.post('/secret/credential-group/delete', getCdgsParam(items)).then(async (_) => {
                await requestCdgList();
                context.root.$notify({
                    group: 'noticeBottomLeft',
                    type: 'success',
                    title: 'success',
                    text: 'delete credential groups',
                    duration: 2000,
                    speed: 1000,
                });
            }).catch((error) => {
                console.error(error);
                context.root.$notify({
                    group: 'noticeBottomLeft',
                    type: 'alert',
                    title: 'Fail',
                    text: 'request fail',
                    duration: 2000,
                    speed: 1000,
                });
            });
        };
        const createCdg = async (item) => {
            await context.parent.$http.post('/secret/credential-group/create', item).then(async (_) => {
                await requestCdgList();
                context.root.$notify({
                    group: 'noticeBottomLeft',
                    type: 'success',
                    title: 'success',
                    text: 'Create Credential Groups',
                    duration: 2000,
                    speed: 1000,
                });
            }).catch((error) => {
                console.log(error);
                context.root.$notify({
                    group: 'noticeBottomLeft',
                    type: 'alert',
                    title: 'Fail',
                    text: 'request Fail',
                    duration: 2000,
                    speed: 1000,
                });
            });
        };
        const updateCdg = async (item) => {
            console.log('update test', item)
            await context.parent.$http.post('/secret/credential-group/update', item).then(async (_) => {
                await requestCdgList();
                context.root.$notify({
                    group: 'noticeBottomLeft',
                    type: 'success',
                    title: 'success',
                    text: 'update credential groups',
                    duration: 2000,
                    speed: 1000,
                });
            }).catch((error) => {
                console.error(error);
                context.root.$notify({
                    group: 'noticeBottomLeft',
                    type: 'alert',
                    title: 'Fail',
                    text: 'request Fail',
                    duration: 2000,
                    speed: 1000,
                });
            });
        };


        mountBusEvent(cdgEventBus, cdgEventNames.getCdgList, requestCdgList);
        mountBusEvent(cdgEventBus, cdgEventNames.tagConfirmEvent, CdgTagConfirm);
        mountBusEvent(cdgEventBus, cdgEventNames.deleteCdg, deleteCdg);
        mountBusEvent(cdgEventBus, cdgEventNames.createCdg, createCdg);
        mountBusEvent(cdgEventBus, cdgEventNames.updateCdg, updateCdg);

        requestCdgList();
        return {
            ...toRefs(state),
        };
    },
};

</script>
