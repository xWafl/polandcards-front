import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        gameKey: null as string | null,
        gameId: null as number | null,
        gameFlipped: false
    },
    mutations: {
        setGameData (state, val) {
            console.log("Setting game key to " + val);
            state.gameKey = val.key;
            state.gameId = val.id;
            state.gameFlipped = val.flipped;
        },
        resetGameKey (state) {
            state.gameKey = null;
        }
    },
    actions: {},
    modules: {}
});
