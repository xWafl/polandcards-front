<template>
    <div class="game">
        <div class="opponent">
            <CardSlot class="cardSlot"></CardSlot>
            <CardSlot class="cardSlot"></CardSlot>
            <CardSlot class="cardSlot"></CardSlot>
            <CardSlot class="cardSlot"></CardSlot>
        </div>
        <div class="player">
            <CardSlot class="cardSlot"></CardSlot>
            <CardSlot class="cardSlot"></CardSlot>
            <CardSlot class="cardSlot"></CardSlot>
            <CardSlot class="cardSlot"></CardSlot>
        </div>
        <CardSlot v-for="card in currentHand" :key="card.id">
            <Card :cardData="card" @click.native="blah(card)"></Card>
        </CardSlot>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import CardSlot from "@/components/CardSlot.vue";
import Card from "@/components/Card.vue";
import { sendSocket, websocketHandler } from "@/helpers/websocket";
@Component({
    components: { Card, CardSlot }
})
export default class Game extends Vue {
    playerData: Record<string, unknown> = {};
    get currentHand() {
        return this.playerData.hand;
    }
    blah(card) {
        console.log(card.name);
    }
    mounted() {
        // Create WebSocket connection.
        const socket = new WebSocket("ws://localhost:5900");

        // Connection opened
        socket.addEventListener("open", () => {
            sendSocket(socket, "newgame", "Hi!");
            sendSocket(socket, "playCard", {id: 0, cardId: 2, slot: 0})
        });

        // Listen for messages
        socket.addEventListener("message", event => {
            const { category, data } = websocketHandler(event.data);
            console.log(`Category: ${category} | ${JSON.stringify(data)}`);
            if (category === "playerData") {
                this.playerData = data;
            }
        });

    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.cardSlot {
    display: inline-block;
}
</style>
