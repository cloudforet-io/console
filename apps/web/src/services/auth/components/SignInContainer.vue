<script lang="ts" setup>
import ConsoleLogo from '@/services/auth/components/ConsoleLogo.vue';
import SignInLeftContainer from '@/services/auth/components/SignInLeftContainer.vue';


</script>

<template>
    <div class="sign-in-container">
        <console-logo />
        <div class="contents-wrapper">
            <sign-in-left-container />
            <router-view />
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.sign-in-container {
    .contents-wrapper {
        @apply flex absolute;
        width: 100%;
        height: 100%;
        top: 0;
        bottom: 0;
    }
}
</style>
