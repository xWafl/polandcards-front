<template>
    <div class="game" v-if="gameLoaded">
        <div class="opponent">
            <CardSlot
                v-for="[index, val] in Object.entries(
                    Array(4)
                        .fill(null)
                        .map((_, idx) => gameData.player2.cards[idx])
                )"
                :key="index"
                class="cardSlot"
                @click.native="parseClick('opponent', val ? val.id : null)"
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
        {{ selections }} | {{ status }}
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import CardSlot from "@/components/CardSlot.vue";
import Card from "@/components/Card.vue";
import { sendSocket, websocketHandler } from "@/helpers/websocket";
import * as config from "../assets/config";
@Component({
    components: { Card, CardSlot }
})
export default class Game extends Vue {
    gameLoaded = false;
    socket: WebSocket = new WebSocket(config.wsUrl);
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
    parseClick(category: string, value: number) {
        if (!value) {
            return;
        }
        console.log(value);
        if (category === "hand") {
            this.selections.hand = value;
            this.status = "place";
        } else if (category === "ally") {
            if (this.status === "place") {
                if (this.selections.hand !== -1) {
                    this.selections.ally = value;
                    this.moveCard();
                }
            } else if (this.status === "play") {
                this.status = "attack";
                this.selections.ally = this.playerData.cards[value].id;
            }
        } else if (category === "opponent") {
            if (this.selections.ally !== -1 && this.status === "attack") {
                this.selections.opponent = value;
                this.attackCard();
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
                this.status = "play";
                this.selections.hand = -1;
                this.selections.ally = -1;
            }
        }
    }
    attackCard() {
        if (this.status === "attack") {
            if (
                this.selections.ally !== -1 &&
                this.selections.opponent !== -1
            ) {
                console.log(this.selections);
                sendSocket(this.socket, "attackCard", {
                    id: 0,
                    cardId: this.selections.ally,
                    receiverId: this.selections.opponent
                });
                this.status = "play";
                this.selections.opponent = -1;
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
            } else if (category === "gameLoaded") {
                this.gameLoaded = true;
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
