<template>
    <div class="alert-list-page">
        <div>Alert List Page</div>
        <br>
        <router-link :to="{ name: 'alertDetail', params: { id: 'alert-1dc1e7fe3e4b' }}">
            <a>Alert Detail 페이지로 가즈아ㅏㅏㅏㅏ</a>
        </router-link>
    </div>
</template>

<script lang="ts">
export default {
    name: 'AlertListPage',
};
</script>

<style lang="postcss" scoped>

</style>
