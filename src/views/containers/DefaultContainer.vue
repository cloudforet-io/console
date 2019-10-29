<template>
    <div class="app">
        <!--
            IN CASE OF SEPARATING GNB PER EACH SERVICE
            <router-view name="gnb" />
        -->
        <GNB class="gnb"/>

        <div class="app-body">
            <router-view name="lnb" />

            <main class="main">
                <router-view name="main" />
            </main>

            <!--
                IN CASE OF SEPARATING GNB PER EACH SERVICE
                <router-view name="fnb" />
            -->
            <FNB class="fnb"/>
        </div>
    </div>
</template>

<script>
import GNB from '@/views/containers/gnb/GNB.vue';
import FNB from '@/views/containers/fnb/FNB.vue';

export default {
    name: 'DefaultContainer',
    components: { GNB, FNB },
};
</script>

<style lang="scss" scoped>
$gnb-width: 56px;
$fnb-height: 40px;
.app {
    overflow-y: hidden;
    min-height: 100vh;
    .app-header {
        position: fixed;
        width: 100vw;
        background-color: transparent;
        border-bottom: none;
    }
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
        .main {
            margin: 0;
        }
        .fnb {
            height: $fnb-height;
            border: 1px solid aqua;
        }
    }
}
</style>
