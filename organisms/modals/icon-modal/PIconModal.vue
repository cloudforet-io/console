<template>
    <p-modal
        :visible.sync="proxyVisible"
        :backdrop="true"
        class="p-icon-modal-container"
    >
        <div class="content-lap">
            <p-lottie v-if="lottieName"
                      class="block" :name="lottieName"
                      auto :size="5"
            />
            <p-i v-if="iconName"
                 class="block" :name="iconName"
                 width="5rem" height="5rem"
            />
            <div class="text-lap">
                <p v-if="headerTitle" class="header-title">
                    {{ headerTitle }}
                </p>
                <span v-if="bodyText">
                    {{ bodyText }}
                </span>
            </div>
            <p-button
                style-type="gray900" :outline="true"
                @click="onClickButton"
            >
                {{ buttonText }}
            </p-button>
        </div>
    </p-modal>
</template>

<script lang="ts">
import { reactive, toRefs } from '@vue/composition-api';

import PModal from '@/components/molecules/modals/PModal.vue';
import PLottie from '@/components/molecules/lottie/PLottie.vue';
import PI from '@/components/atoms/icons/PI.vue';
import PButton from '@/components/atoms/buttons/PButton.vue';
import { IconModalProps } from '@/components/organisms/modals/icon-modal/type';

import { makeProxy } from '@/components/util/composition-helpers';

export default {
    name: 'PIconModal',
    components: {
        PI,
        PModal,
        PLottie,
        PButton,
    },
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
        lottieName: {
            type: String,
            default: undefined,
        },
        iconName: {
            type: String,
            default: undefined,
        },
        headerTitle: {
            type: String,
            default: undefined,
        },
        bodyText: {
            type: String,
            default: undefined,
        },
        buttonText: {
            type: String,
            default: '',
        },
    },
    setup(props: IconModalProps, { emit }) {
        const state = reactive({
            proxyVisible: makeProxy('visible', props, emit),
        });

        const onClickButton = () => {
            state.proxyVisible = false;
            emit('clickButton');
        };

        return {
            ...toRefs(state),
            onClickButton,
        };
    },
};

</script>

<style lang="postcss">
.p-icon-modal-container {
    .content-lap {
        @apply bg-white;
        text-align: center;
        opacity: 0.9;
        border-radius: 1rem;
        padding: 3.75rem;
        margin-top: calc(50% - 1rem);
        .p-i-icon {
            margin: auto;
        }
        .text-lap {
            padding-top: 1.5rem;
            padding-bottom: 1.5rem;
            .header-title {
                @apply text-primary-dark;
                font-size: 1.375rem;
                font-weight: bold;
                padding-bottom: 0.5rem;
            }
        }
    }
}
</style>
