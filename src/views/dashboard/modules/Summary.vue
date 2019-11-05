<template>
    <div>
        <p v-if="showTitle" class="board-title">
            Summary
        </p>
        <div class="board-container">
            <Spinner v-model="isLoading" />
            <template v-if="!isLoading">
                <div v-for="(item, key) in summaryData" :key="key" class="board">
                    <p class="title">
                        {{ item.title }}
                    </p>
                    <span class="count">
                        {{ item.count }}
                    </span>
                </div>
            </template>
        </div>
    </div>
</template>

<script>
import Spinner from '@/components/base/spinner/BaseSpinner';

export default {
    name: 'Summary',
    components: {
        Spinner,
    },
    props: {
        showTitle: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {
            isLoading: true,
            summaryData: {
                project: {
                    title: 'Project',
                    count: 0,
                },
                server: {
                    title: 'Server',
                    count: 0,
                },
                network: {
                    title: 'Network',
                    count: 0,
                },
            },
        };
    },
    created() {
        this.listSummary();
    },
    methods: {
        async listSummary() {
            try {
                const res = await this.$axios.post('/statistics/summary');
                this.setSummaryData(res.data);
                this.isLoading = false;
            } catch (err) {
                console.error(err);
            }
        },
        setSummaryData(data) {
            this._.forIn(data, (val, key) => {
                this.summaryData[key].count = data[key];
            });
        },
    },
};
</script>

<style lang="scss" scoped>
.board-container {
    display: flex;
    flex-wrap: wrap;
    height: 100px;
    background-color: $skyblue;
    padding: 15px 30px;
    .board {
        padding-left: 10px;
        padding-right: 40px;
        .title {
            text-transform: uppercase;
            color: $navy;
            font-size: 0.85em;
            font-weight: 700;
        }
        .count {
            color: $navy;
            padding: 0 7px;
            font-size: 1.75em;
            font-weight: 900;
        }
    }
}
</style>
