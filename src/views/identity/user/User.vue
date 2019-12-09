
<script>
import {
    ref, toRefs, computed, reactive,
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
            try {
                const res = await context.parent.$http.post('/identity/user/update', {
                    user_id: userId,
                    tags,
                });
                state.items[idx].tags = tags;
                console.log(res);
            } catch (e) {
                userEventBus.$emit(userEventNames.tagResetEvent);
                state.items[idx].tags = originTags;
                console.error(e);
            }
        };


        mountBusEvent(userEventBus, userEventNames.getUserList, requestUserList);
        mountBusEvent(userEventBus, userEventNames.tagConfirmEvent, UserTagConfirm);
        requestUserList();
        return {
            ...toRefs(state),
        };
    },
};
</script>
