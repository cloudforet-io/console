<template>
    <div class="alert-list-page">
        <div>Alert List Page</div>
        <br>
        <router-link :to="{ name: 'alertDetail', params: { id: 'textIdxxxxxx' }}">
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
