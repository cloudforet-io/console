<template>
    <p-button v-bind="mergedButtonBind"
              :style-type="styleType"
              v-on="$listeners"
    >
        <div class="loading-btn">
            <p-lottie v-if="loading" class="spinner"
                      name="thin-spinner" auto
                      :size="1.5"
            />
            <slot />
        </div>
    </p-button>
</template>

<script lang="ts">
import { computed, reactive, toRefs } from '@vue/composition-api';
import PButton from '@/inputs/buttons/button/PButton.vue';
import PLottie from '@/foundation/lottie/PLottie.vue';
import { LoadingButtonProps } from '@/others/deprecated/loading-button/type';
import { BUTTON_STYLE } from '@/inputs/buttons/button/type';

export default {
    name: 'PLoadingButton',
    components: { PLottie, PButton },
    props: {
        disabled: {
            type: Boolean,
            default: false,
        },
        loading: {
            type: Boolean,
            required: true,
        },
        styleType: {
            type: String,
            default: undefined,
            validator(value) {
                if (value === undefined) return true;
                return Object.keys(BUTTON_STYLE).indexOf(value) !== -1;
            },
        },
        buttonBind: {
            type: Object,
            default: () => ({
                styleType: 'primary-dark',
            }),
        },
    },
    setup(props: LoadingButtonProps) {
        const state = reactive({
            mergedButtonBind: computed(() => ({
                disabled: props.loading || props.disabled,
                ...props.buttonBind,
            })),
        });
        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss" scoped>
.loading-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    .spinner {
        display: inline-flex;
        padding-right: 0.25rem;
    }
}
</style>
