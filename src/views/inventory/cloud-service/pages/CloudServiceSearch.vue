<template>
    <router-view />
</template>

<script lang="ts">

import { ComponentInstance } from '@vue/composition-api/dist/component';

export default {
    name: 'CloudServiceSearch',
    beforeRouteEnter(to, from, next) {
        next((vm: ComponentInstance) => {
            vm.$router.push('/');
        });
    },
    setup() {
        const getDynamicLink = () => {
        }
        return {

        };
    },
};
</script>
