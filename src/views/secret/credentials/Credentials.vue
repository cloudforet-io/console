
<script>
import {
    toRefs, computed, reactive,
} from '@vue/composition-api';
import CredentialsTemplate, { credentialsSetup, eventNames } from '@/views/secret/credentials/Credentials.template.vue';
import credentialsEventBus from '@/views/secret/credentials/CredentialsEventBus';
import { mountBusEvent } from '@/lib/compostion-util';
import { defaultQuery } from '@/lib/api/query';
import { showErrorMessage } from '@/lib/util';


export default {
    name: 'Credentials',
    extends: CredentialsTemplate,
    setup(props, context) {
        const credentialsEventNames = eventNames;
        credentialsEventNames.getSchemaList = 'getSchemaList';
        credentialsEventNames.getCredentialsList = 'getCredentialsData';
        credentialsEventNames.tagConfirmEvent = 'credentialsTagConfirmEvent';
        credentialsEventNames.createCredentials = 'createCredentials';
        credentialsEventNames.updateCredentials = 'updateCredentials';
        credentialsEventNames.deleteCredentials = 'deleteCredentials';
        credentialsEventNames.getPluginCredentialsForm = 'getPluginCredentialsForm';
        credentialsEventNames.getSchemaTypeForm = 'getSchemaTypeForm';

        const state = credentialsSetup(props, context, credentialsEventNames);

        // request credentials list
        const requestState = reactive({
            query: computed(() => (defaultQuery(
                state.thisPage, state.pageSize,
                state.sortBy, state.sortDesc,
                state.searchText, state.searchQueries,
            ))),
        });

        const requestCredentialsList = async () => {
            state.loading = true;
            state.items = [];
            try {
                const res = await context.parent.$http.post('/secret/secret/list', {
                    query: requestState.query,
                    domain_id: context.parent.$store.getters['domain/id'],
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


        const getSchemaList = async () => {
            state.schema = [];
            try {
                const res = await context.parent.$http.post('/repository/schema/list');
                state.schema = res.data.results;
                requestCredentialsList();
            } catch (e) {
                console.error(e);
            }
        };

        // change tag
        const credentialsTagConfirm = async (credentialsId, tags, originTags) => {
            const idx = state.selectIndex[0];
            await context.parent.$http.post('/secret/secret/update', {
                secret_id: credentialsId,
                domain_id: context.parent.$store.getters['domain/id'],
                tags,
            }).then((_) => {
                state.items[idx].tags = tags;
            }).catch((error) => {
                credentialsEventBus.$emit(credentialsEventNames.tagResetEvent);
                state.items[idx].tags = originTags;
                console.error(error);
            });
        };

        const deleteCredentials = async (items) => {
            await context.parent.$http.post('/secret/secret/delete', { secret_id: items[0].secret_id }).then(async (_) => {
                await requestCredentialsList();
                context.root.$notify({
                    group: 'noticeTopRight',
                    type: 'success',
                    title: 'success',
                    text: 'Selected secrets is successfully deleted.',
                    duration: 2000,
                    speed: 1000,
                });
            }).catch((error) => {
                console.error(error);
                showErrorMessage('Fail to Delete Credentials', error, context.root);
            });
        };

        const createCredentials = async (item) => {
            await context.parent.$http.post('/secret/secret/create', item).then(async (_) => {
                await requestCredentialsList();
                context.root.$notify({
                    group: 'noticeTopRight',
                    type: 'success',
                    title: 'success',
                    text: 'New secrets has been successfully created.',
                    duration: 2000,
                    speed: 1000,
                });
            }).catch((error) => {
                console.error(error);
                showErrorMessage('Fail to Create Credentials', e, context.root);
            });
        };

        // const getPluginCredentialsForm = async (items) => {
        //     const params = {
        //         plugin_id: items.plugin_id,
        //     };
        //
        //     try {
        //         const res = await context.parent.$http.post('/repository/plugin/get', params);
        //         state.dynamicFormState.form = res.data.template.credentials;
        //     } catch (e) {
        //         console.error(e);
        //         state.loading = false;
        //     }
        // };

        mountBusEvent(credentialsEventBus, credentialsEventNames.getSchemaList, getSchemaList);
        mountBusEvent(credentialsEventBus, credentialsEventNames.getCredentialsList, requestCredentialsList);
        mountBusEvent(credentialsEventBus, credentialsEventNames.tagConfirmEvent, credentialsTagConfirm);
        mountBusEvent(credentialsEventBus, credentialsEventNames.createCredentials, createCredentials);
        mountBusEvent(credentialsEventBus, credentialsEventNames.deleteCredentials, deleteCredentials);
        // mountBusEvent(credentialsEventBus, credentialsEventNames.getPluginCredentialsForm, getPluginCredentialsForm);
        requestCredentialsList();
        return {
            ...toRefs(state),
        };
    },
};
</script>
