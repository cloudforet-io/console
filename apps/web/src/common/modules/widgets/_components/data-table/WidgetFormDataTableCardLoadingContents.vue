<script setup lang="ts">
import { PSkeleton, PDivider } from '@cloudforet/mirinae';
</script>

<template>
    <div class="widget-form-data-table-card-loading-contents"
         :class="{ 'selected': true }"
    >
        <div class="card-header">
            <p-skeleton class="skeleton-a"
                        width="80%"
                        height="1rem"
            />
            <p-skeleton class="skeleton-b"
                        width="30%"
                        height="1rem"
            />
            <p-skeleton width="100%"
                        height="2rem"
            />
        </div>
        <div class="card-body">
            <div class="body-item">
                <p-skeleton class="skeleton-b"
                            width="30%"
                            height="1rem"
                />
                <p-skeleton width="100%"
                            height="2rem"
                />
            </div>
            <div class="body-item">
                <p-skeleton class="skeleton-b"
                            width="25%"
                            height="1rem"
                />
                <p-skeleton width="50%"
                            height="2rem"
                />
            </div>
            <div class="body-item">
                <p-skeleton class="skeleton-b"
                            width="30%"
                            height="1rem"
                />
                <p-skeleton width="100%"
                            height="2rem"
                />
            </div>
            <div class="body-item">
                <p-skeleton class="skeleton-b"
                            width="30%"
                            height="1rem"
                />
                <p-skeleton class="mb-4"
                            width="70%"
                            height="2rem"
                />
            </div>
        </div>
        <p-divider />
        <div class="card-footer">
            <p-skeleton class="ml-4"
                        width="25%"
                        height="2rem"
            />
            <div class="footer-right">
                <p-skeleton width="50%"
                            height="2rem"
                />
                <p-skeleton width="50%"
                            height="2rem"
                />
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.widget-form-data-table-card-loading-contents {
    @apply border border-gray-200 rounded-lg w-full bg-white;
    width: 25vw;
    min-width: 21rem;
    max-width: 24rem;
    padding-top: 0.125rem;
    margin-bottom: 2rem;

    &.selected {
        @apply border-violet-600;
        box-shadow: 0 0 0 0.1875rem rgba(137, 124, 214, 0.6);
        .card-header {
            @apply bg-violet-100 border border-violet-200;
        }
    }

    .card-header {
        @apply flex flex-col gap-1 bg-gray-100 rounded-lg border border-gray-200;
        width: calc(100% - 0.5rem);
        padding: 0.75rem;
    }
    .card-body {
        @apply flex flex-col gap-4;
        padding: 0.75rem;
        .body-item {
            @apply flex flex-col gap-1;
        }
    }
    .card-footer {
        @apply flex justify-between;
        padding: 0.75rem 0;
        .footer-right {
            @apply inline-flex gap-2;
            width: calc(50% + 0.5rem);
            margin-right: 1rem;
        }
    }
}
.skeleton-a {
    margin: 0.5rem 0;
}
.skeleton-b {
    margin: 0.375rem 0;
}

</style>
