/* global fetch, vueMounted, vueData, vueComputed, vueMethods, vueWatch */

let app = {
  el: '#app',
  vuetify: new Vuetify(),
  data: vueData,
  mounted: vueMounted,
  computed: vueComputed, 
  watch: vueWatch,
  methods: vueMethods
}

window.addEventListener('DOMContentLoaded', async () => {
  app = new Vue(app)
})

//let deferredPrompt
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault()
  // Stash the event so it can be triggered later.
  //deferredPrompt = e
  console.log('ok')
  app.setupPWAEvent(e)
})