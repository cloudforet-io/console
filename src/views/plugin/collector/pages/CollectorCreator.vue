<script>
import { toRefs } from '@vue/composition-api';
import _ from 'lodash';
import CollectorCreatorTemplate, { setDataState } from '@/views/plugin/collector/pages/CollectorCreator.template.vue';
import { crdState } from '@/views/plugin/collector/modules/ChooseCredentials.vue';
import { confState } from '@/views/plugin/collector/modules/ConfigureCollector.vue';
import { mountBusEvent } from '@/lib/compostion-util';
import CollectorEventBus from '@/views/plugin/collector/CollectorEventBus';
import { fluentApi } from '@/lib/fluent-api';

export default {
    name: 'CollectorPlugins',
    extends: CollectorCreatorTemplate,
    setup(props, context) {
        const state = setDataState(context.root);

        const getProvider = fluentApi.identity().provider().get();

        const listCredentials = async (params) => {
            const url = state.crdState.crdType === 'Credentials'
                ? '/secret/credential/list' : '/secret/credential-group/list';
            // eslint-disable-next-line camelcase
            // params.include_credential_group = true;
            const provider = state.confState.provider;
            const resp = await fluentApi.secret().secret().list().setProvider(provider)
                .execute();
            const pluginSchema = resp.data.results.map(item => item.schema);
            state.confState.pluginSchema = pluginSchema;
        };
        listCredentials();


        const getPlugin = async (params) => {
            state.confState.plugin = null;
            state.confState.loading = true;
            try {
                const res = await context.parent.$http.post('/repository/plugin/get', params);
                state.confState.plugin = res.data;
                state.confState.provider = res.data.provider;
            } catch (e) {
                console.error(e);
            } finally {
                state.confState.loading = false;
            }
        };
        mountBusEvent(CollectorEventBus, 'getPlugin', getPlugin);


        const listVersionsInfo = async (params) => {
            try {
                const res = await context.parent.$http.post('/repository/plugin/get-versions', params);
                state.confState.versions = res.data.version || [];
                if (!state.confState.selectedVersion) {
                    state.confState.selectedVersion = state.confState.versions[0];
                }
            } catch (e) {
                console.error(e);
            }
        };
        mountBusEvent(CollectorEventBus, 'listVersionsInfo', listVersionsInfo);


        const createCollector = async () => {
            // const crdKey = state.crdState.crdType === 'Credentials' ? 'credential_id' : 'credential_group_id';
            const params = {
                name: state.confState.name,
                priority: state.confState.priority,
                tags: state.tags,
                // eslint-disable-next-line camelcase
                plugin_info: {
                    // eslint-disable-next-line camelcase
                    plugin_id: state.confState.plugin.plugin_id,
                    version: state.confState.selectedVersion,
                    provider: state.confState.provider,
                    // [crdKey]: state.crdState.items[state.crdState.selectIndex[0]][crdKey],
                },
            };

            if (!_.isEmpty(state.confState.optionsValue)) {
                params.options = state.confState.optionsValue;
            }

            await fluentApi.inventory().collector().create().setParameter({
                ...params,
            })
                .execute()
                .then(() => {
                    context.root.$router.push('/plugin/collector');
                    context.root.$notify({
                        group: 'noticeBottomRight',
                        type: 'success',
                        title: 'success',
                        text: 'create collector',
                        duration: 2000,
                        speed: 1000,
                    });
                })
                .catch((e) => {
                    if (e.message.includes('ERROR_AUTHENTICATION_FAILURE_PLUGIN')) {
                        context.root.$notify({
                            group: 'noticeBottomRight',
                            type: 'warning',
                            title: 'Wrong Credentials',
                            text: 'Please choose credentials or credentials group that matches the selected plugin.',
                            duration: 2000,
                            speed: 1000,
                        });
                        return;
                    }
                    context.root.$notify({
                        group: 'noticeBottomRight',
                        type: 'alert',
                        title: 'Fail',
                        text: 'request Fail',
                        duration: 2000,
                        speed: 1000,
                    });
                });

            // try {
            //     const res = await context.parent.$http.post('/inventory/collector/create', params);
            //     context.root.$router.push('/plugin/collector');
            //     context.root.$notify({
            //         group: 'noticeBottomRight',
            //         type: 'success',
            //         title: 'success',
            //         text: 'create collector',
            //         duration: 2000,
            //         speed: 1000,
            //     });
            // } catch (e) {
            //     /**
            //      * temporary codes before verify function developed
            //      */
            //     if (e.message.includes('ERROR_AUTHENTICATION_FAILURE_PLUGIN')) {
            //         context.root.$notify({
            //             group: 'noticeBottomRight',
            //             type: 'warning',
            //             title: 'Wrong Credentials',
            //             text: 'Please choose credentials or credentials group that matches the selected plugin.',
            //             duration: 2000,
            //             speed: 1000,
            //         });
            //         return;
            //     }
            //
            //     console.error(e);
            //     context.root.$notify({
            //         group: 'noticeBottomRight',
            //         type: 'alert',
            //         title: 'Fail',
            //         text: 'request Fail',
            //         duration: 2000,
            //         speed: 1000,
            //     });
        };
        mountBusEvent(CollectorEventBus, 'createCollector', createCollector);

        return {
            ...toRefs(state),
            getProvider,
        };
    },
};
</script>
