<script>
/* eslint-disable camelcase */

import {
    toRefs, computed, reactive,
} from '@vue/composition-api';
import moment from 'moment-timezone';
import CdgTemplate, { cdgSetup, eventNames } from '@/views/secret/credentials-group/pages/CredentialsGroup.template.vue';
import cdgEventBus from '@/views/secret/credentials-group/CredentialsGroupEventBus';
import { mountBusEvent, Validation } from '@/lib/compostion-util';
import {
    defaultAutocompleteHandler,
    getEnumValues, getSearchEnumValues,
} from '@/components/organisms/search/query-search-bar/autocompleteHandler';
import {defaultQuery} from "@/lib/api/query";

export default {
    name: 'Cdg',
    extends: CdgTemplate,
    setup(props, context) {
        class ACHandler extends defaultAutocompleteHandler {
            // eslint-disable-next-line class-methods-use-this
            get keys() {
                return [
                    'credential_group_id', 'name',
                ];
            }

            // eslint-disable-next-line class-methods-use-this
            get suggestKeys() {
                return ['name'];
            }

            // eslint-disable-next-line class-methods-use-this
            get parent() {
                return context.parent;
            }

            // eslint-disable-next-line class-methods-use-this
            get valuesFetchUrl() {
                return '/secret/credential-group/list';
            }

            // eslint-disable-next-line class-methods-use-this
            get valuesFetchKeys() {
                return [
                    'credential_group_id', 'name',
                ];
            }
        }
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
            if (data.updateMode && data.originName === value) {
                return true;
            }
            let result = false;
            await context.parent.$http.post('/secret/credential-group/list', {
                domain_id: context.parent.$ls.domain.state.domainId,
                query: {
                    minimal: true,
                    filter: [{
                        k: 'name',
                        v: value,
                        o: 'eq',
                    }],
                },
            }).then((res) => {
                if (res.data.total_count === 0) {
                    result = true;
                }
            });
            return result;
        }, 'Duplicated Credential Group Name');
        const state = cdgSetup(props, context, cdgEventNames, cdgNameValidation, new ACHandler());

        const requestState = reactive({
            query: computed(() => (defaultQuery(
                state.thisPage, state.pageSize,
                state.sortBy, state.sortDesc,
                null, state.queryListTools.tags,
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
            state.loading = true;
            state.items = [];
            try {
                const res = await context.parent.$http.post('/secret/credential-group/list', {
                    query: requestState.query,
                });
                state.items = res.data.results;
                const allPage = Math.ceil(res.data.total_count / state.pageSize);
                state.allPage = allPage || 1;
                state.selectIndex = [];
                state.loading = false;
            } catch (e) {
                console.error(e);
                state.loading = false;
            }
        };
        const requestCdList = async (cdgId) => {
            state.cdgData.loading = true;
            state.cdgData.items = [];
            state.cdgData.selectIndex = [];
            const param = {
                query: cdRequestState.query,
                // eslint-disable-next-line camelcase
                credential_group_id: cdgId,
                include_credential_group: true,
            };
            try {
                const res = await context.parent.$http.post('/secret/credential/list', param);
                state.cdgData.items = res.data.results;
                const allPage = Math.ceil(res.data.total_count / state.cdgData.pageSize);
                state.cdgData.allPage = allPage || 1;
                state.cdgData.loading = false;
            } catch (e) {
                console.error(e);
                state.cdgData.loading = false;
            }
        };
        const CdgTagConfirm = async (item, tags, originTags) => {
            const idx = state.selectIndex[0];
            const cdgInfo = state.items[state.selectIndex[0]];
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
            const result = {
                // eslint-disable-next-line camelcase
                credential_group_id: _.map(items, 'credential_group_id'),
                credential_id: _.map(items, 'credential_id'),
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
                console.error(error);
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
        const getCdsParam = (items, cdgId) => {
            const result = {
                // eslint-disable-next-line camelcase
                credentials: _.map(items, 'credential_id'),
                credential_group_id: cdgId,
            };
            return result;
        };
        const deleteCd = async (items, cdId, cdgId) => {
            await context.parent.$http.post('/secret/credential-group/credential/remove', getCdsParam(items, cdgId)).then(async (_) => {
                await requestCdList(cdgId);
                context.root.$notify({
                    group: 'noticeBottomRight',
                    type: 'success',
                    title: 'success',
                    text: 'Delete Credentials Successfully',
                    duration: 2000,
                    speed: 1000,
                });
            }).catch((error) => {
                console.error(error);
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
                console.error(error);
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
                console.error(error);
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

        mountBusEvent(cdgEventBus, cdgEventNames.deleteCdg, deleteCdg);
        mountBusEvent(cdgEventBus, cdgEventNames.deleteCd, deleteCd);
        mountBusEvent(cdgEventBus, cdgEventNames.getCdgList, requestCdgList);
        mountBusEvent(cdgEventBus, cdgEventNames.getCdList, requestCdList);
        mountBusEvent(cdgEventBus, cdgEventNames.tagConfirmEvent, CdgTagConfirm);
        mountBusEvent(cdgEventBus, cdgEventNames.createCdg, createCdg);
        mountBusEvent(cdgEventBus, cdgEventNames.updateCdg, updateCdg);

        requestCdgList();
        return {
            ...toRefs(state),
        };
    },
};

</script>
