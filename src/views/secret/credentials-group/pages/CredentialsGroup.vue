<script>
    /* eslint-disable camelcase */

    import {
    toRefs, computed, reactive,
} from '@vue/composition-api';
import CdgTemplate, { cdgSetup, eventNames } from '@/views/secret/credentials-group/pages/CredentialsGroup.template.vue';
import cdgEventBus from '@/views/secret/credentials-group/CredentialsGroupEventBus';
import { mountBusEvent, Validation } from '@/lib/compostion-util';
import { defaultQuery } from '@/lib/api';

export default {
    name: 'Cdg',
    extends: CdgTemplate,
    setup(props, context) {
        const cdgEventNames = eventNames;
        cdgEventNames.getCdgList = 'getCdgList';
        cdgEventNames.getCdList = 'getCdList';
        cdgEventNames.tagConfirmEvent = 'CdgTagConfirmEvent';
        cdgEventNames.tagResetEvent = 'resetUserTagEvent';
        cdgEventNames.deleteCdg = 'deleteCdg';
        cdgEventNames.deleteCd = 'deleteCd';
        cdgEventNames.createCdg = 'createCdg';
        cdgEventNames.updateCdg = 'updateCdg';
        const cdgNameValidation = new Validation(async (value, data) => {
            console.log('name validation test', value);
            if (data.updateMode && data.originName === value) {
                return true;
            }
            let result = false;
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
        const cdRequestState = reactive({
            query: computed(() => (defaultQuery(
                state.cdgData.thisPage, state.cdgData.pageSize,
                state.cdgData.sortBy, state.cdgData.sortDesc,
                state.cdgData.searchText,
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
        const requestCdList = async () => {
            const cdgInfo = state.items[state.selectIndex[0]];
            state.cdgData.loading = true;
            state.cdgData.items = [];
            const param = {
                query: cdRequestState.query,
                // eslint-disable-next-line camelcase
                credential_group_id: cdgInfo.credential_group_id,
                include_credential_group: true,
            };
            try {
                const res = await context.parent.$http.post('/secret/credential/list', param);
                state.cdgData.items = res.data.results;
                const allPage = Math.ceil(res.data.total_count / state.cdgData.pageSize);
                state.cdgData.allPage = allPage || 1;
                state.cdgData.selectIndex = [];
                state.cdgData.loading = false;
            } catch (e) {
                console.log(e);
                state.cdgData.loading = false;
            }
        };
        const CdgTagConfirm = async (item, tags, originTags) => {
            const idx = state.selectIndex[0];
            const cdgInfo = state.items[state.selectIndex[0]];
            console.log(idx, 'idx test');
            await context.parent.$http.post('/secret/credential-group/update', {
                // eslint-disable-next-line camelcase
                name: cdgInfo.name,
                credential_group_id: cdgInfo.credential_group_id,
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
            console.log('getCdgsParam test1', items);
            const result = {
                // eslint-disable-next-line camelcase
                credential_group_id: _.map(items, 'credential_group_id'),
                credential_id: 'cred-47452e311570',
                name: _.map(items, 'name'),
                tags: _.map(items, 'tags'),
            };
            return result;
        };

        const deleteCdg = async (items) => {
            await context.parent.$http.post('/secret/credential-group/delete', getCdgsParam(items)).then(async (_) => {
                await requestCdgList();
                context.root.$notify({
                    group: 'noticeBottomRight',
                    type: 'success',
                    title: 'success',
                    text: 'delete credential groups',
                    duration: 2000,
                    speed: 1000,
                });
            }).catch((error) => {
                console.log(error);
                context.root.$notify({
                    group: 'noticeBottomRight',
                    type: 'alert',
                    title: 'Fail',
                    text: 'request fail',
                    duration: 2000,
                    speed: 1000,
                });
            });
        };
        const deleteCd = async (cd_id, cdg_id) => {
            console.log(cd_id,  cdg_id)
            await context.parent.$http.post('/secret/credential-group/credential/remove', {
                credential_group_id: cdg_id,
                credential_id: cd_id,
            }).then(async (_) => {
                await requestCdList();
                context.root.$notify({
                    group: 'noticeBottomRight',
                    type: 'success',
                    title: 'success',
                    text: 'Delete Credentials Successfully',
                    duration: 2000,
                    speed: 1000,
                });
            }).catch((error) => {
                console.log(error);
                context.root.$notify({
                    group: 'noticeBottomRight',
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
                    group: 'noticeBottomRight',
                    type: 'success',
                    title: 'success',
                    text: 'Create Credential Groups',
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
        const updateCdg = async (items) => {
            await context.parent.$http.post('/secret/credential-group/update', items).then(async (_) => {
                await requestCdgList();
                context.root.$notify({
                    group: 'noticeBottomRight',
                    type: 'success',
                    title: 'success',
                    text: 'Update credential groups',
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

        mountBusEvent(cdgEventBus, cdgEventNames.getCdgList, requestCdgList);
        mountBusEvent(cdgEventBus, cdgEventNames.getCdList, requestCdList);
        mountBusEvent(cdgEventBus, cdgEventNames.tagConfirmEvent, CdgTagConfirm);
        mountBusEvent(cdgEventBus, cdgEventNames.deleteCdg, deleteCdg);
        mountBusEvent(cdgEventBus, cdgEventNames.deleteCd, deleteCd);
        mountBusEvent(cdgEventBus, cdgEventNames.createCdg, createCdg);
        mountBusEvent(cdgEventBus, cdgEventNames.updateCdg, updateCdg);

        requestCdgList();
        requestCdList();
        return {
            ...toRefs(state),
        };
    },
};

</script>
