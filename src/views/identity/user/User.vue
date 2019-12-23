
<script>
import {
    toRefs, computed, reactive,
} from '@vue/composition-api';
import UserTemplate, { userSetup, eventNames } from '@/views/identity/user/User.template';
import userEventBus from '@/views/identity/user/UserEventBus';
import { mountBusEvent } from '@/lib/compostion-util';
import { defaultQuery } from '@/lib/api';


export default {
    name: 'User',
    extends: UserTemplate,
    setup(props, context) {
        const userEventNames = eventNames;
        userEventNames.getUserList = 'getUserData';
        userEventNames.tagConfirmEvent = 'UserTagConfirmEvent';
        userEventNames.tagResetEvent = 'resetUserTagEvent';
        userEventNames.enableUser = 'enableUser';
        userEventNames.disableUser = 'disableUser';
        userEventNames.deleteUser = 'deleteUser';
        userEventNames.addUser = 'addUser';

        const state = userSetup(props, context, userEventNames);

        // request user list
        const requestState = reactive({
            query: computed(() => (defaultQuery(
                state.thisPage, state.pageSize,
                state.sortBy, state.sortDesc,
                state.searchText,
            ))),
        });
        const requestUserList = async () => {
            console.log('before', state.loading);
            state.loading = true;
            state.items = [];
            try {
                console.log('start', state.loading);
                const res = await context.parent.$http.post('/identity/user/list', {
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
            console.log(items);
            const result = { users: _.map(items, 'user_id') };
            return result;
        };
        const enableUser = async (items) => {
            await context.parent.$http.post('/identity/user/enable', getUsersParam(items)).then(async (_) => {
                await requestUserList();
                context.root.$notify({
                    group: 'noticeBottomLeft',
                    type: 'success',
                    title: 'success',
                    text: 'enable users',
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
        const disableUser = async (items) => {
            await context.parent.$http.post('/identity/user/disable', getUsersParam(items)).then(async (_) => {
                await requestUserList();
                context.root.$notify({
                    group: 'noticeBottomLeft',
                    type: 'success',
                    title: 'success',
                    text: 'disable users',
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

        const deleteUser = async (items) => {
            await context.parent.$http.post('/identity/user/delete', getUsersParam(items)).then(async (_) => {
                await requestUserList();
                context.root.$notify({
                    group: 'noticeBottomLeft',
                    type: 'success',
                    title: 'success',
                    text: 'delete users',
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

        const addUser = async (item) => {
            await context.parent.$http.post('/identity/user/create', item).then(async (_) => {
                await requestUserList();
                context.root.$notify({
                    group: 'noticeBottomLeft',
                    type: 'success',
                    title: 'success',
                    text: 'add users',
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

        mountBusEvent(userEventBus, userEventNames.getUserList, requestUserList);
        mountBusEvent(userEventBus, userEventNames.tagConfirmEvent, UserTagConfirm);
        mountBusEvent(userEventBus, userEventNames.enableUser, enableUser);
        mountBusEvent(userEventBus, userEventNames.disableUser, disableUser);
        mountBusEvent(userEventBus, userEventNames.deleteUser, deleteUser);
        mountBusEvent(userEventBus, userEventNames.addUser, addUser);


        requestUserList();
        return {
            ...toRefs(state),
        };
    },
};
</script>
