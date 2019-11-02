<template>
    <div>
        <p-button class="activator" @click="show">
            <template>
                <f-i icon="fa-archive" />
            </template>
        </p-button>
    </div>
</template>

<script>
import PButton from '@/components/atoms/buttons/Button';
import FI from '@/components/atoms/icons/FI';

export default {
    name: 'LanguageMenu',
    components: {
        PButton,
        FI,
    },
};
</script>

<style lang="scss" scoped>

</style>
