<template>
    <article class="desktop-wrapper">
        <div class="name-column">
            spot group name
        </div>
        <div class="spot-column">
            spot interrupt
        </div>
        <div class="instance-column">
            spot instance
        </div>
        <div class="load-balancer-column">
            load balancer
        </div>
    </article>
</template>

<script lang="ts">
export default {
    name: 'SpotGroupCardDesktop',
};
</script>

<style lang="postcss" scoped>
.desktop-wrapper {
    display: flex;
    flex-direction: row;
    justify-content: space-between;

    @screen md {
        height: 3rem;
        .name-column {
            display: none;
        }
    }

    @screen lg {
        .name-column {
            display: flex;
        }
    }
}
</style>
