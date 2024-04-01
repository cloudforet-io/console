<script setup lang="ts">
import { PFieldTitle } from '@spaceone/design-system';
</script>

<template>
    <div class="landing-recent-visits">
        <p-field-title :label="$t('LADING.RECENT')"
                       color="dark"
                       font-weight="bold"
                       size="md"
        />
        <!--        <p-board :board-sets="tempData"-->
        <!--                 selectable-->
        <!--                 style-type="card"-->
        <!--        >-->
        <!--            <template #item-content="{board}">-->
        <!--                {{ board }}-->
        <!--                <strong>Left Icon</strong>-->
        <!--                <p>Collector tags icon</p>-->
        <!--            </template>-->
        <!--        </p-board>-->
    </div>
</template>

<style scoped lang="postcss">
.landing-recent-visits {
    @apply flex flex-col;
    gap: 1rem;
}
</style>
