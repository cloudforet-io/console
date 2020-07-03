<script>
import { reactive, toRefs, getCurrentInstance } from '@vue/composition-api';
import { mountBusEvent } from '@/lib/compostion-util';
import { profileSetup } from '@/views/common/profile/ProfileModal_origin.template.vue';
import GNBEventBus from '@/views/containers/gnb/GNBEventBus';

export default {
    name: 'ProfileModal',
    // extends: ProfileModalTemplate,
    setup(props, context) {
        const vm = getCurrentInstance();
        const state = reactive(profileSetup(props, context));

        const getUser = async (params) => {
            state.loading = true;
            try {
                const res = await context.root.$http.post('identity/user/get', params);
                state.userState.name = res.data.name;
                state.userState.email = res.data.email;
                state.userState.mobile = res.data.mobile;
                state.userState.group = res.data.group;
                state.userState.language = res.data.language;
                state.userState.timezone = res.data.timezone;
            } catch (e) {
                console.error(e);
            } finally {
                state.loading = false;
            }
        };
        mountBusEvent(GNBEventBus, 'getUser', getUser);

        const getOwner = async (params) => {
            state.loading = true;
            try {
                const res = await context.root.$http.post('identity/domain-owner/get', params);
                state.userState.name = res.data.name;
                state.userState.email = res.data.email;
                state.userState.mobile = res.data.mobile;
                state.userState.group = res.data.group;
                state.userState.language = res.data.language;
                state.userState.timezone = res.data.timezone;
            } catch (e) {
                console.error(e);
            } finally {
                state.loading = false;
            }
        };
        mountBusEvent(GNBEventBus, 'getOwner', getOwner);

        const updateUser = async (params) => {
            state.loading = true;
            try {
                // const res = await context.root.$http.post('identity/user/update', params);

                if (params.timezone) {
                    vm.$ls.user.state.timezone = params.timezone;
                }
                if (params.language) {
                    vm.$ls.user.state.language = params.language;
                }

                context.root.$notify({
                    group: 'noticeTopRight',
                    type: 'success',
                    title: 'success',
                    text: 'Update Profile',
                    duration: 2000,
                    speed: 1000,
                });
                state.proxyVisible = false;
            } catch (e) {
                console.error(e);
                context.root.$notify({
                    group: 'noticeTopRight',
                    type: 'alert',
                    title: 'Fail',
                    text: 'Request Fail',
                    duration: 2000,
                    speed: 1000,
                });
            } finally {
                state.loading = false;
            }
        };
        mountBusEvent(GNBEventBus, 'updateUser', updateUser);


        const updateOwner = async (params) => {
            state.loading = true;
            try {
                const res = await context.root.$http.post('identity/domain-owner/update', params);
                context.root.$notify({
                    group: 'noticeTopRight',
                    type: 'success',
                    title: 'success',
                    text: 'Update Profile',
                    duration: 2000,
                    speed: 1000,
                });
                state.proxyVisible = false;
            } catch (e) {
                console.error(e);
                context.root.$notify({
                    group: 'noticeTopRight',
                    type: 'alert',
                    title: 'Fail',
                    text: 'Request Fail',
                    duration: 2000,
                    speed: 1000,
                });
            } finally {
                state.loading = false;
            }
        };
        mountBusEvent(GNBEventBus, 'updateOwner', updateOwner);

        return {
            ...toRefs(state),
            getUser,
            getOwner,
        };
    },
};
</script>
