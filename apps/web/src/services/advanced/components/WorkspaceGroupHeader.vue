<script setup lang="ts">
import { PHeading, PButton } from '@cloudforet/mirinae';
</script>

<template>
    <section class="workspace-group-header">
        <p-heading class="workspace-group-header"
                   :title="$t('IAM.WORKSPACE_GROUP.TITLE')"
                   use-total-count
                   :total-count="12"
        >
            <template #extra>
                <p-button style-type="primary"
                          icon-left="ic_plus_bold"
                >
                    {{ $t('IAM.WORKSPACE_GROUP.CREATE') }}
                </p-button>
            </template>
        </p-heading>
    </section>
</template>
