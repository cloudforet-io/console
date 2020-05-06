<template>
    <p-button v-bind="buttonBind"
              v-on="$listeners"
    >
        <div class="loading-btn">
            <p-lottie v-if="loading" class="spinner"
                      name="spinner" auto
                      :size="1.5"
            />
            <slot />
        </div>
    </p-button>
</template>

<script lang="ts">
import { computed, defineComponent, reactive } from '@vue/composition-api';
import PButton from '@/components/atoms/buttons/Button.vue';
import PLottie from '@/components/molecules/lottie/PLottie.vue';

export default defineComponent({
    name: 'PLoadingButton',
    props: {
        disabled: {
            type: Boolean,
            default: false,
        },
        loading: {
            type: Boolean,
            required: true,
        },
        buttonBind: {
            type: Object,
            default: () => ({
                styleType: 'primary-dark',
            }),
        },
    },
    components: { PLottie, PButton },
    setup(props) {
        const state = reactive({
            mergedButtonBind: computed(() => {
                const res = {
                    disabled: props.loading || props.disabled,
                    ...props.buttonBind,
                };
                return res;
            }),
        });
        return {

        };
    },
});
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
