<template>
    <div class="login">
        <div id="register">
            <label for="registerEmail">E-mail</label
            ><input v-model="email" placeholder="E-mail" id="registerEmail" />
            <label for="registerUsername">Username</label
            ><input
                v-model="username"
                placeholder="Username"
                id="registerUsername"
            />
            <label for="registerPassword">Password</label>
            <input
                v-model="password"
                placeholder="Password"
                id="registerPassword"
            />
            <button @click="register">Register</button>
        </div>
        <div id="login">
            <label for="loginEmail">Email</label
            ><input v-model="email" placeholder="E-mail" id="loginEmail" />
            <label for="loginPassword">Password</label
            ><input
                v-model="password"
                placeholder="Password"
                id="loginPassword"
            />
            <button @click="login">Log in</button>
        </div>
        <div id="logout">
            <button @click="logout">Log out</button>
        </div>
        {{ status }}
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import * as config from "../assets/config";

@Component
export default class Login extends Vue {
    email = "";
    username = "";
    password = "";
    status = null as unknown;
    async register() {
        if (this.email && this.password) {
            const resp = await fetch(`${config.httpUrl}/api/auth/register`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: this.username,
                    email: this.email,
                    password: this.password
                })
            });
            this.status = await resp.json();
        }
    }
    async login() {
        if (this.email && this.password) {
            const resp = await fetch(`${config.httpUrl}/api/auth/login`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: this.email,
                    password: this.password
                })
            });
            this.status = await resp.json();
        }
    }
    async logout() {
        const resp = await fetch(`${config.httpUrl}/api/auth/logout`, {
            method: "GET",
            credentials: "include"
        });
        this.status = await resp.json();
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss"></style>
