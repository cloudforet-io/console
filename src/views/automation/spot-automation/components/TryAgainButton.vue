<template>
    <div>
        <p class="error-desc">
            {{ $t('AUTOMATION.SPOT_AUTOMATION.ADD.TRY_AGAIN_DESC') }}
        </p>
        <p-icon-text-button name="ic_refresh" style-type="gray900" outline
                            icon-color="transparent inherit"
                            @click="$emit('refresh')"
        >
            {{ $t('AUTOMATION.SPOT_AUTOMATION.ADD.TRY_AGAIN') }}
        </p-icon-text-button>
    </div>
</template>

<script lang="ts">
import { PIconTextButton } from '@spaceone/design-system';

export default {
    name: 'TryAgain',
    components: {
        PIconTextButton,
    },
    setup() {
        return {
        };
    },
};
</script>

<style lang="postcss" scoped>
.error-desc {
    @apply text-alert;
    font-size: 0.875rem;
    line-height: 1.5;
    margin-bottom: 0.5rem;
}
</style>
