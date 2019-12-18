<template>
    <div class="card-layout">
        <div v-for="(name) in slots" :key="name"
             class="card-container"
             :class="{'no-border': noBorders[name]}"
             :style="{ width: `${width}%` }"
        >
            <slot :name="name" />
        </div>
    </div>
</template>

<script>
export default {
    name: 'PCardLayout',
    props: {
        colMax: {
            type: Number,
            default: null,
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
            const obj = {}
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

<style lang="scss" scoped>
    .card-layout {
        display: flex;
        flex-wrap: wrap;
        width: 100%;
        table-layout: fixed;
        border: 1px solid $gray2;
        border-radius: 2px;
        .card-container {
            vertical-align: top;
            border-right: 1px solid $gray2;
            margin: 1rem 0;
            padding: 0 1rem;
            &.no-border {
                border-right: 0;
            }
        }
    }
</style>
