<script>
import {
    ref, toRefs, computed, reactive, onMounted, watch,
} from '@vue/composition-api';
import moment from 'moment-timezone';
import AddCdgTemplate, { cdgSetup, eventNames } from '@/views/secret/credentials-group/pages/AddCredentials.template.vue';
import cdgEventBus from '@/views/secret/credentials-group/CredentialsGroupEventBus';
import { mountBusEvent } from '@/lib/compostion-util';
import { defaultQuery, Validation } from '@/lib/api';
import {
    defaultAutocompleteHandler,
    getEnumValues, getSearchEnumValues,
} from '@/components/organisms/search/query-search-bar/autocompleteHandler';

export default {
    name: 'AddCdg',
    extends: AddCdgTemplate,
    setup(props, context) {
        class ACHandler extends defaultAutocompleteHandler {
            // eslint-disable-next-line class-methods-use-this
            get keys() {
                return [
                    'credential_id', 'name', 'tags',
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
                return '/secret/credential/list';
            }

            // eslint-disable-next-line class-methods-use-this
            get valuesFetchKeys() {
                return [
                    'credential_group_id', 'name',
                ];
            }
        }

        const cdEventNames = eventNames;
        cdEventNames.getCdList = 'getCd';
        cdEventNames.tagConfirmEvent = 'CdTagConfirmEvent';
        cdEventNames.tagResetEvent = 'resetTagEvent';
        cdEventNames.addCd = 'addCd';
        // cdEventNames.dupliacteCheckEvent = 'duplicateCheck';

        const state = cdgSetup(props, context, cdEventNames, new ACHandler());
        const requestState = reactive({
            query: computed(() => (defaultQuery(
                state.thisPage, state.pageSize,
                state.sortBy, state.sortDesc,
                null, state.queryListTools.tags,
            ))),
        });
        const requestCdList = async () => {
            state.loading = true;
            state.items = [];
            const param = {
                query: requestState.query,
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
                console.error(e);
            } finally {
                state.loading = false;
            }
        };

        // const duplicateCheck = async (item) => {
        //     console.debug('duplicateCheck', item)
        //     let result = false;
        //     await context.parent.$http.post('/secret/credential-group/list', {
        //         query: {
        //             minimal: true,
        //             filter: [{
        //                 k: 'credential_id',
        //                 v: item.credential_id,
        //                 o: 'in',
        //             }],
        //         },
        //         include_credential_group: true,
        //         credential_group_id: context.root.$route.params.id,
        //         count_only: true,
        //     }).then((res) => {
        //         if (res.data.total_count === 1) {
        //             context.root.$notify({
        //                 group: 'noticeBottomRight',
        //                 type: 'alert',
        //                 title: 'Fail',
        //                 text: 'Duplicate credentials',
        //                 duration: 2000,
        //                 speed: 1000,
        //             });
        //             result = false;
        //         } else {
        //             result = true;
        //         }
        //     });
        //     return result;
        // };

        const getCdsParam = (items) => {
            const result = {
                // eslint-disable-next-line camelcase
                credentials: _.map(items, 'credential_id'),
                credential_group_id: context.root.$route.params.id,
                // name: _.map(items, 'name'),
                // tags: _.map(items, 'tags'),
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
                context.root.$router.push('/secret/credentials-group');
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

        mountBusEvent(cdgEventBus, cdEventNames.getCdList, requestCdList);
        // mountBusEvent(cdgEventBus, cdEventNames.dupliacteCheckEvent, duplicateCheck);
        mountBusEvent(cdgEventBus, cdEventNames.addCd, addCd);

        requestCdList();
        return {
            ...toRefs(state),
        };
    },
};
</script>
