<script setup lang="ts">
import { PI, PBadge, PIconButton } from '@cloudforet/mirinae';
</script>

<template>
    <div>
        <p-i name="ic_chevron-right" />
        <p-i name="ic_short=text" />
        Title
        <p-badge>Required</p-badge>
        <p-icon-button shape="square"
                       size="sm"
                       style-type="transparent"
                       icon="ic_delete"
        />
    </div>
</template>
