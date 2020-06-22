<template>
    <div class="cardSlot">
        <slot class="card"></slot>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component
export default class CardSlot extends Vue {}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.cardSlot {
    position: relative;
    width: 150px;
    height: 225px;
    border: 1px solid black;
}
.card {
    position: absolute;
}
</style>
