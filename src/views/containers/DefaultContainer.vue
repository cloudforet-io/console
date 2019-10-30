<template>
    <div class="app">
        <GNB class="gnb" />

        <div class="app-body">
            <div class="lnb">
                <router-view name="lnb" />
            </div>

            <main class="main">
                <router-view name="main" />
            </main>
        </div>
    </div>
</template>

<script>
import GNB from '@/views/containers/gnb/GNB.vue';

export default {
    name: 'DefaultContainer',
    components: { GNB },
};
</script>

<style lang="scss" scoped>
.app {
    overflow-y: hidden;
    min-height: 100vh;
    .gnb {
        display: inline-block;
        position: fixed;
        height: 100vh;
        width: $gnb-width;
        border: 1px solid red;
        z-index: 100;
    }
    .app-body {
        margin-left: $gnb-width;
        width: calc(100vw - #{$gnb-width});
        border: 1px solid blue;
        min-height: 100vh;
        .lnb {
            height: $lnb-height;
        }
        .main {
            margin: 0;
            min-height: calc(100vh - #{$lnb-height});
            border: 1px solid orange;
        }
    }
}
</style>
