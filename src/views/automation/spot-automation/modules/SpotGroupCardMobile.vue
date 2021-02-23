<template>
    <article class="mobile-wrapper">
        <div class="left-desc">
            spot interrupt
        </div>
        <div class="right-desc">
            load balancer
        </div>
    </article>
</template>

<script lang="ts">
export default {
    name: 'SpotGroupCardMobile',
};
</script>

<style lang="postcss" scoped>
.mobile-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    @screen sm {
        flex-direction: row;
    }

    @screen md {
        flex-direction: row;
    }
}
</style>
