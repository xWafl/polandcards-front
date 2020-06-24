<template>
    <div class="queue" v-if="loaded">
        <button @click="join">Join queue</button>
        <button @click="leave">Leave queue</button>
        {{ status }}
    </div>
</template>

<script lang="ts">
import { setWsHeartbeat } from "ws-heartbeat/client";
import { Component, Vue } from "vue-property-decorator";
import * as config from "@/assets/config";
import { sendSocket, websocketHandler } from "@/helpers/websocket";

@Component
export default class Queue extends Vue {
    status = { message: null } as Record<string, unknown>;
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
        this.status = await resp.json();
        console.log(`Sending: ${this.status.id}`);
        sendSocket(this.socket, "awaitMatch", this.status.id);
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
        this.status = await resp.json();
    }

    mounted() {
        setWsHeartbeat(this.socket, '{"category":"ping"}');
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
