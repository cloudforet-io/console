<template>
    <section class="provider-add-page">
        <!--song-lang-->
        <p-page-title
            child
            :title="$t('Add Provider')"
            @goBack="$router.go(-1)"
        />
        <p-divider />
        <p>Add Page</p>
    </section>
</template>

<script lang="ts">


import { PPageTitle, PDivider } from '@spaceone/design-system';


export default {
    name: 'ProviderAddPage',
    components: {
        PPageTitle,
        PDivider,
    },
    setup() {
        return {

        };
    },
};
</script>
