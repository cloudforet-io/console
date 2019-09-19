<template>
  <div class="board-container">
    <div v-for="(item, idx) in boardData" :key="idx" class="board">
      <p class="title">
        {{ item.title }}
      </p>
      <span class="count">
        {{ item.count }}
      </span>
    </div>
  </div>
</template>

<script>
export default {
    name: 'Summary',
    data () {
        return {
            boardData: [{
                title: 'Servers',
                count: 14
            },
            {
                title: 'Projects',
                count: 28
            },
            {
                title: 'Networks',
                count: 6
            }]
        };
    },
    methods: {
        
    }
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