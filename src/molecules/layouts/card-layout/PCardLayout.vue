<template>
    <div class="card-layout">
        <div v-for="(name) in slots" :key="name"
             :class="{'card-container': true, 'card-margin': !noMargin, 'card-padding': !noPadding,'no-border': noBorders[name]}"
             :style="{ width: `${width}%` }"
        >
            <slot :name="name" />
        </div>
    </div>
</template>

<script lang="ts">
export default {
    name: 'PCardLayout',
    props: {
        colMax: {
            type: Number,
            default: null,
        },
        noMargin: {
            type: Boolean,
            default: false,
        },
        noPadding: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            slots: Object.keys(this.$slots),
        };
    },
    computed: {
        width() {
            return 100 / (this.colMax ? this.colMax : this.slots.length);
        },
        noBorders() {
            const obj = {};
            this.slots.forEach((s, i) => {
                if (i === this.slots.length - 1) obj[s] = true;
                else if (this.colMax && (i + 1) % this.colMax === 0) obj[s] = true;
                else obj[s] = false;
            });
            return obj;
        },
    },
};
</script>

<style lang="postcss" scoped>
.card-layout {
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    table-layout: fixed;
    .card-container {
        @apply border-r border-gray-200;
        vertical-align: top;
        &.no-border {
            border-right: 0;
        }
        &.card-margin {
            margin: 1rem 0;
        }
        &.card-padding {
            padding: 0 1rem;
        }
    }
}
</style>
