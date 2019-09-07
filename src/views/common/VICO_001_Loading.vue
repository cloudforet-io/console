<template>
  <div class="spinner-container" :class="{fadeout: !isLoading}">
    <span class="spinner"><i class="fal fa-spinner fa-pulse" /></span>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
export default {
    name: 'Loading',
    computed: {
        ...mapGetters('page', [
            'isLoading'
        ])
    }
};
</script>

<style lang="scss" scoped>
.spinner-container {
    position: absolute;
    width: 100vw;
    height: 100vh;
    .spinner {
        position: absolute;
        display: inline-block;
        top: 50%;
        left: 50%;
        width: 60px;
        height: 60px;
        transform: translate(-50%, -50%);
        font-size: 50px;
        color: $violet;
        text-align: center;
        overflow: hidden;
        i {
            vertical-align: top;
            background: linear-gradient(to right, $blue, $violet);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
    }
}

.fadeout {
    animation: fadeout 1s forwards;
}

@keyframes fadeout {
    to {
        opacity: 0;
        visibility: hidden;
    }
}
</style>
