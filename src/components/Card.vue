<template>
    <div class="card">
        <h3>{{ cardData.name }}</h3>
        <p>ATK - {{ cardData.attack }}</p>
        <p>HP - {{ cardData.health }}</p>
        <p>GOLD - {{ cardData.gold }}</p>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class Card extends Vue {
    @Prop({ default: {} })
    cardData: Record<string, unknown>;
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.card {
    width: 100%;
    height: 100%;
}
</style>
