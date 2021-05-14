import { reactive, toRefs } from '@vue/composition-api';
import PIconModal from '@/feedbacks/modals/icon-modal/PIconModal.vue';
import PButton from '@/inputs/buttons/button/PButton.vue';
import { withKnobs } from '@storybook/addon-knobs';

export default {
    title: 'Feedbacks/Modals/Icon Modal',
    component: PIconModal,
    decorators: [withKnobs],
    parameters: {
        centered: { disable: true },
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=5973%3A130841',
        },
    },
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
                :header-desc="headerDesc"
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
        headerDesc: {
            default: 'Please wait around 10 seconds!',
        },
        buttonText: {
            default: 'Cancel',
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

export const iconModalMdType = () => ({
    components: { PIconModal, PButton },
    template: `
        <div>
            <p-button styleType="primary" @click="onClickOpen">Open Modal</p-button>
            <p-icon-modal
                :visible.sync="loading"
                :icon-name="iconName"
                :header-title="headerTitle"
                :button-text="buttonText"
                size="md"
                @clickButton="onClickCancel"
            >
                <template #body>
                    Content
                </template>
            </p-icon-modal>
        </div>`,
    props: {
        iconName: {
            default: 'ic_dashboard',
        },
        headerTitle: {
            default: 'Loading...',
        },
        buttonText: {
            default: 'Cancel',
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
