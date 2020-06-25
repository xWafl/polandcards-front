<template>
    <div class="game" v-if="gameLoaded">
        <div class="opponent">
            {{ flipped ? player1username : player2username }}
            <CardSlot
                v-for="[index, val] in Object.entries(
                    Array(4)
                        .fill(null)
                        .map((_, idx) => opponentCards[idx])
                )"
                :key="index"
                class="cardSlot"
                @click.native="parseClick('opponent', val ? val.id : null)"
            >
                <Card :cardData="val" v-if="!!val"></Card>
            </CardSlot>
        </div>
        <div class="player">
            {{ flipped ? player2username : player1username }}
            <CardSlot
                v-for="[index, val] in Object.entries(
                    Array(4)
                        .fill(null)
                        .map((_, idx) => allyCards[idx])
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
        <button @click="endTurn">End turn</button>
        {{ selections }} | {{ gameData }} | {{ gameKey }} | {{ gameID }} |
        {{ flipped }} | {{ allyCards }} | {{ player1username }} | {{ player2username }}
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import CardSlot from "@/components/CardSlot.vue";
import Card from "@/components/Card.vue";
import { sendSocket, websocketHandler } from "@/helpers/websocket";
import * as config from "../assets/config";
import { setWsHeartbeat } from "ws-heartbeat/client";
import { httpUrl } from "../assets/config";
@Component({
    components: { Card, CardSlot }
})
export default class Game extends Vue {
    gameKey = this.$store.state.gameKey;
    gameID = this.$store.state.gameId;
    flipped = this.$store.state.gameFlipped;
    gameLoaded = false;
    socket: WebSocket = new WebSocket(config.wsUrl);
    playerData: Record<string, unknown> = {};
    gameData: Record<string, any> = {};
    player1username = null as string | null;
    player2username = null as string | null;
    status = "play";
    selections = {
        hand: -1,
        ally: -1,
        opponent: -1
    };
    get currentHand() {
        return this.playerData.hand;
    }
    get allyCards() {
        return this.flipped
            ? this.gameData.board.player2.cards
            : this.gameData.board.player1.cards;
    }
    get opponentCards() {
        return !this.flipped
            ? this.gameData.board.player2.cards
            : this.gameData.board.player1.cards;
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
                this.selections.ally = this.allyCards[value].id;
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
                    gameId: this.gameID,
                    key: this.gameKey,
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
        console.log("Attacking");
        if (this.status === "attack") {
            if (
                this.selections.ally !== -1 &&
                this.selections.opponent !== -1
            ) {
                console.log(this.selections);
                sendSocket(this.socket, "attackCard", {
                    gameId: this.gameID,
                    key: this.gameKey,
                    cardId: this.selections.ally,
                    receiverId: this.selections.opponent
                });
                this.status = "play";
                this.selections.opponent = -1;
                this.selections.ally = -1;
            }
        }
    }
    endTurn() {
        sendSocket(this.socket, "endTurn", {
            gameId: this.gameID,
            key: this.gameKey
        });
    }
    mounted() {
        setWsHeartbeat(this.socket, '{"category":"ping"}');
        // Connection opened
        this.socket.addEventListener("open", () => {
            sendSocket(this.socket, "joinGame", {
                gameId: this.gameID,
                key: this.gameKey
            });
        });

        // Listen for messages
        this.socket.addEventListener("message", async event => {
            const { category, data } = websocketHandler(event.data);
            if (category === "playerData") {
                this.playerData = data;
            } else if (category === "gameData") {
                this.gameData = data;
                if (!this.player1username) {
                    const resp = await fetch(
                        `${httpUrl}/api/users/userData/id/${data.player1}`
                    );
                    if (resp.status === 400) {
                        this.player1username = "Undefined user";
                    } else {
                        const response = await resp.json();
                        this.player1username = response.username;
                    }
                }
                if (!this.player2username) {
                    const resp = await fetch(
                        `${httpUrl}/api/users/userData/id/${data.player2}`
                    );
                    if (resp.status === 400) {
                        this.player2username = "Undefined user";
                    } else {
                        const response = await resp.json();
                        this.player2username = response.username;
                    }
                }
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
