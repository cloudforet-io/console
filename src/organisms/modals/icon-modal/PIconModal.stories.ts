import { reactive, toRefs } from '@vue/composition-api';
import PIconModal from '@/organisms/modals/icon-modal/PIconModal.vue';
import PButton from '@/atoms/buttons/PButton.vue';

export default {
    title: 'Feedbacks/Modals/Icon Modal',
    component: PIconModal,
};

export const iconModal = () => ({
    components: { PIconModal, PButton },
    template: `
        <div>
            <p-button styleType="primary" @click="onClickOpen">Open Modal</p-button>
            <p-icon-modal
                :visible.sync="loading"
                :icon-name="iconName"
                :header-title="headerTitle"
                :body-text="bodyText"
                :button-text="buttonText"
                @clickButton="onClickCancel"
            />
        </div>`,
    props: {
        iconName: {
            default: 'ic_dashboard',
        },
        headerTitle: {
            default: 'Loading...',
        },
        bodyText: {
            default: 'Please wait around 10 seconds!',
        },
        buttonText: {
            default: 'cancel',
        },
    },
    setup() {
        const state = reactive({
            loading: false,
        });

        const onClickOpen = () => {
            state.loading = true;
        };
        const onClickCancel = () => {
            state.loading = false;
        };

        return {
            ...toRefs(state),
            onClickOpen,
            onClickCancel,
        };
    },
});
