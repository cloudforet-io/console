<template>
  <div class="board-container">
    <div v-for="count in [12, 10, 5]" :key="count" class="board">
      <p class="title">
        Servers
      </p>
      <span class="count">
        {{ count }}
      </span>
    </div>
  </div>
</template>

<script>
export default {
    name: 'Summary',
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
            font-size: 1.75em;
            font-weight: 900;
        }
    }
}
</style>