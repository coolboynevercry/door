<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <Header />
    <main class="min-h-screen pt-20">
      <router-view />
    </main>
    <Footer />
  </div>
</template>

<script setup>
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
</script> 