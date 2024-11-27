<script setup lang="ts">
import { ref } from 'vue';
// import { useRoute, useRouter } from 'vue-router/composables';

import LSB from '@/common/modules/navigations/lsb/LSB.vue';
import type { LSBMenu } from '@/common/modules/navigations/lsb/type';

//
// const router = useRouter();
// const route = useRoute();

const menuSet = ref<LSBMenu[]>([]);

</script>

<template>
    <l-s-b :menu-set="menuSet" />
</template>
