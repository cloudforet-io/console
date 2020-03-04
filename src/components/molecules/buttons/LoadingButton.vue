<template>
    <p-button v-bind="buttonBind"
              :disabled="loading"
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
import { defineComponent } from '@vue/composition-api';
import PButton from '@/components/atoms/buttons/Button.vue';
import PLottie from '@/components/molecules/lottie/PLottie.vue';

export default defineComponent({
    name: 'PLoadingButton',
    props: {
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
});
</script>

<style lang="scss" scoped>
.loading-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    .spinner {
        display: inline-flex;
        padding-right: .25rem;
    }
}
</style>
