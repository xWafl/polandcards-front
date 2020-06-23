<template>
    <div class="queue" v-if="loaded">
        <button @click="join">Join queue</button>
        <button @click="leave">Leave queue</button>
        {{ status }}
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import * as config from "@/assets/config";
import { sendSocket, websocketHandler } from "@/helpers/websocket";

@Component
export default class Queue extends Vue {
    status = null as unknown;
    loaded = false;
    socket: WebSocket = new WebSocket(config.wsUrl);

    async join() {
        const resp = await fetch(`${config.httpUrl}/api/game/joinQueue`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({})
        });
        this.status = await resp.text();
        sendSocket(this.socket, "awaitMatch", "");
    }

    async leave() {
        const resp = await fetch(`${config.httpUrl}/api/game/leaveQueue`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({})
        });
        this.status = await resp.text();
    }

    mounted() {
        // Connection opened
        this.socket.addEventListener("open", () => {
            this.loaded = true;
        });

        // Listen for messages
        this.socket.addEventListener("message", event => {
            const { category, data } = websocketHandler(event.data);
            console.log(`Category: ${category} | ${JSON.stringify(data)}`);
        });
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss"></style>
