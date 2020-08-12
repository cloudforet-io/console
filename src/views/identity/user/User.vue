
<script>
import {
    toRefs, computed, reactive,
} from '@vue/composition-api';
import moment from 'moment-timezone';
import UserTemplate, { userSetup, eventNames } from '@/views/identity/user/User.template.vue';
import userEventBus from '@/views/identity/user/UserEventBus';
import { mountBusEvent } from '@/lib/compostion-util';
import {
    DefaultAutocompleteHandler,
    getEnumValues, getSearchEnumValues,
} from '@/components/organisms/search/query-search-bar/autocompleteHandler';
import { defaultQuery } from '@/lib/api/query';
import { showErrorMessage } from '@/lib/util';

export default {
    name: 'User',
    extends: UserTemplate,
    setup(props, context) {
        class ACHandler extends DefaultAutocompleteHandler {
        // eslint-disable-next-line class-methods-use-this
            get keys() {
                return [
                    'user_id', 'name', 'state', 'email', 'mobile',
                    'group', 'language', 'timezone',
                ];
            }

            // eslint-disable-next-line class-methods-use-this
            get suggestKeys() {
                return ['user_id', 'name', 'email', 'mobile'];
            }

            // eslint-disable-next-line class-methods-use-this
            get parent() {
                return context.parent;
            }

            // eslint-disable-next-line class-methods-use-this
            get valuesFetchUrl() {
                return '/identity/user/list';
            }

            // eslint-disable-next-line class-methods-use-this
            get valuesFetchKeys() {
                return [
                    'user_id', 'name', 'email', 'mobile',
                ];
            }

            // eslint-disable-next-line no-shadow
            constructor() {
                super();
                this.HandlerMap.value.push(...[
                    getEnumValues('state', ['ENABLED', 'DISABLED']),
                    getSearchEnumValues('timezone', moment.tz.names(), [
                        'UTC', 'Asia/Seoul',
                    ], { caseSensitive: true, threshold: 0.8 }),
                ]);
            }
        }

        const userEventNames = eventNames;
        userEventNames.getUserList = 'getUserData';
        userEventNames.tagConfirmEvent = 'UserTagConfirmEvent';
        userEventNames.tagResetEvent = 'resetUserTagEvent';
        userEventNames.enableUser = 'enableUser';
        userEventNames.disableUser = 'disableUser';
        userEventNames.deleteUser = 'deleteUser';
        userEventNames.addUser = 'addUser';
        userEventNames.updateUser = 'updateUser';

        const state = userSetup(props, context, userEventNames, new ACHandler());

        // request user list
        const requestState = reactive({
            query: computed(() => (defaultQuery(
                state.thisPage, state.pageSize,
                state.sortBy, state.sortDesc, null,
                state.queryListTools.tags,
            ))),
        });
        const requestUserList = async () => {
            // console.debug('before', state.loading);
            state.loading = true;
            try {
                // console.debug('start', state.loading);
                const res = await context.parent.$http.post('/identity/user/list', {
                    query: requestState.query,
                });
                state.items = res.data.results;
                const allPage = Math.ceil(res.data.total_count / state.pageSize);
                state.allPage = allPage || 1;
                state.selectIndex = [];
                state.loading = false;
            } catch (e) {
                console.error(e);
                state.items = [];
                state.loading = false;
            }
        };


        // change tag
        const UserTagConfirm = async (userId, tags, originTags) => {
            const idx = state.selectIndex[0];
            await context.parent.$http.post('/identity/user/update', {
                user_id: userId,
                tags,
            }).then((_) => {
                state.items[idx].tags = tags;
            }).catch((error) => {
                userEventBus.$emit(userEventNames.tagResetEvent);
                state.items[idx].tags = originTags;
                console.error(error);
            });
        };
        const getUsersParam = (items) => {
            // console.debug(items);
            const result = { users: _.map(items, 'user_id') };
            return result;
        };
        const enableUser = async (items) => {
            await context.parent.$http.post('/identity/user/enable', getUsersParam(items)).then(async (_) => {
                await requestUserList();
                context.root.$notify({
                    group: 'noticeTopRight',
                    type: 'success',
                    title: 'success',
                    text: 'enable users',
                    duration: 2000,
                    speed: 1000,
                });
            }).catch((error) => {
                console.error(error);
                showErrorMessage('Fail to Enable User', error, context.root);
            });
        };
        const disableUser = async (items) => {
            await context.parent.$http.post('/identity/user/disable', getUsersParam(items)).then(async (_) => {
                await requestUserList();
                context.root.$notify({
                    group: 'noticeTopRight',
                    type: 'success',
                    title: 'success',
                    text: 'disable users',
                    duration: 2000,
                    speed: 1000,
                });
            }).catch((error) => {
                console.error(error);
                showErrorMessage('Fail to Disable User', e, context.root);
            });
        };

        const deleteUser = async (items) => {
            await context.parent.$http.post('/identity/user/delete', getUsersParam(items)).then(async (_) => {
                await requestUserList();
                context.root.$notify({
                    group: 'noticeTopRight',
                    type: 'success',
                    title: 'success',
                    text: 'delete users',
                    duration: 2000,
                    speed: 1000,
                });
            }).catch((error) => {
                console.error(error);
                showErrorMessage('Fail to Delete User', e, context.root);
            });
        };

        const addUser = async (item) => {
            await context.parent.$http.post('/identity/user/create', item).then(async (_) => {
                await requestUserList();
                context.root.$notify({
                    group: 'noticeTopRight',
                    type: 'success',
                    title: 'success',
                    text: 'add users',
                    duration: 2000,
                    speed: 1000,
                });
            }).catch((error) => {
                console.error(error);
                showErrorMessage('Fail to Add User', e, context.root);
            });
        };

        const updateUser = async (item) => {
            await context.parent.$http.post('/identity/user/update', item).then(async (_) => {
                await requestUserList();
                context.root.$notify({
                    group: 'noticeTopRight',
                    type: 'success',
                    title: 'success',
                    text: 'update users',
                    duration: 2000,
                    speed: 1000,
                });
            }).catch((error) => {
                console.error(error);
                showErrorMessage('Fail to Update User', e, context.root);
            });
        };
        mountBusEvent(userEventBus, userEventNames.getUserList, requestUserList);
        mountBusEvent(userEventBus, userEventNames.tagConfirmEvent, UserTagConfirm);
        mountBusEvent(userEventBus, userEventNames.enableUser, enableUser);
        mountBusEvent(userEventBus, userEventNames.disableUser, disableUser);
        mountBusEvent(userEventBus, userEventNames.deleteUser, deleteUser);
        mountBusEvent(userEventBus, userEventNames.addUser, addUser);
        mountBusEvent(userEventBus, userEventNames.updateUser, updateUser);


        requestUserList();
        return {
            ...toRefs(state),
        };
    },
};
</script>
