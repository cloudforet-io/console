<template>
    <p-empty
        show-image
        image-size="md"
    >
        {{ $t('DASHBOARDS.WIDGET.NO_DATA') }}
        <template #image>
            <img alt="empty-image"
                 src="@/assets/images/illust_microscope.svg"
            >
        </template>
    </p-empty>
</template>

<script setup lang="ts">
import { PEmpty } from '@spaceone/design-system';
</script>

<style scoped lang="postcss">
.p-empty {
    margin-top: 3rem;
    background-color: initial;
    border: none;
}
</style>
