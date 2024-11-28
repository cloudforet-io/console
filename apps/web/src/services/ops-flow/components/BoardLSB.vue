<script setup lang="ts">
import LSBContainer from '@/common/modules/navigations/new-lsb/LSBContainer.vue';
import LSBDivider from '@/common/modules/navigations/new-lsb/LSBDivider.vue';
import LSBRouterButton from '@/common/modules/navigations/new-lsb/LSBRouterButton.vue';
import LSBRouterItem from '@/common/modules/navigations/new-lsb/LSBRouterItem.vue';
import LSBTopTitle from '@/common/modules/navigations/new-lsb/LSBTopTitle.vue';
</script>

<template>
    <l-s-b-container>
        <l-s-b-router-button icon="ic_dots-4-square">
            All Categories
        </l-s-b-router-button>
        <l-s-b-divider />
        <l-s-b-top-title>Category</l-s-b-top-title>
        <l-s-b-router-item id="test"
                           to="/test"
        >
            Test
        </l-s-b-router-item>
    </l-s-b-container>
</template>
