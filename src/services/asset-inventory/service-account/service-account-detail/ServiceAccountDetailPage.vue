<template>
    <div class="service-account-detail-page">
        {{ serviceAccountId }}
    </div>
</template>

<script lang="ts">
export default {
    name: 'ServiceAccountDetailPage',
    components: {},
    props: {
        serviceAccountId: {
            type: String,
            default: undefined,
        },
    },
    setup() {
        return {};
    },
};
</script>
