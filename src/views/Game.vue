<template>
    <div class="game">
        <div class="opponent">
            <CardSlot
                v-for="[index, val] in Object.entries(
                    Array(4)
                        .fill(null)
                        .map((_, idx) => gameData.player2.cards[idx])
                )"
                :key="index"
                class="cardSlot"
                @click.native="parseClick('opponent', val.id)"
            >
                <Card :cardData="val" v-if="!!val"></Card>
            </CardSlot>
        </div>
        <div class="player">
            <CardSlot
                v-for="[index, val] in Object.entries(
                    Array(4)
                        .fill(null)
                        .map((_, idx) => playerData.cards[idx])
                )"
                :key="index"
                class="cardSlot"
                @click.native="parseClick('ally', index)"
            >
                <Card :cardData="val" v-if="!!val"></Card>
            </CardSlot>
        </div>
        <CardSlot v-for="card in currentHand" :key="card.id">
            <Card
                :cardData="card"
                @click.native="parseClick('hand', card.id)"
            ></Card>
        </CardSlot>
        {{ selections }}
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
    socket: WebSocket = new WebSocket("ws://localhost:5900");
    playerData: Record<string, unknown> = {};
    gameData: Record<string, unknown> = {};
    status = "play";
    selections = {
        hand: -1,
        ally: -1,
        opponent: -1
    };
    get currentHand() {
        return this.playerData.hand;
    }
    blah(_) {
        console.log(_);
    }
    parseClick(category: string, value: number) {
        if (category === "hand") {
            this.selections.hand = value;
            this.status = "place";
        } else if (category === "ally") {
            if (this.selections.hand !== -1) {
                this.selections.ally = value;
                if (this.status === "place") {
                    this.moveCard();
                }
                if (this.status === "play") {
                    this.status = "attack";
                }
            }
        }
    }
    moveCard() {
        if (this.status === "place") {
            if (this.selections.ally !== -1 && this.selections.hand !== -1) {
                sendSocket(this.socket, "playCard", {
                    id: 0,
                    cardId: this.selections.hand,
                    slot: this.selections.ally
                });
                this.selections.hand = -1;
                this.selections.ally = -1;
            }
        }
    }
    mounted() {
        // Connection opened
        this.socket.addEventListener("open", () => {
            sendSocket(this.socket, "newgame", "Hi!");
        });

        // Listen for messages
        this.socket.addEventListener("message", event => {
            const { category, data } = websocketHandler(event.data);
            console.log(`Category: ${category} | ${JSON.stringify(data)}`);
            if (category === "playerData") {
                this.playerData = data;
            } else if (category === "gameData") {
                this.gameData = data;
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
