import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        gameKey: null as string | null
    },
    mutations: {
        setGameKey (state, val) {
            console.log("Setting game key to " + val);
            state.gameKey = val;
        },
        resetGameKey (state) {
            state.gameKey = null;
        }
    },
    actions: {},
    modules: {}
});
