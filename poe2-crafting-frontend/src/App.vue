<script setup lang="ts">
import POE2Dashboard from './components/POE2Dashboard.vue'

// App configuration
const appName = import.meta.env.VITE_APP_NAME || 'POE2 Auto-Craftmanship'
const appVersion = import.meta.env.VITE_APP_VERSION || '1.0.0'
</script>

<template>
  <div id="app">
    <header class="app-header">
      <h1>{{ appName }}</h1>
      <p class="subtitle">Path of Exile 2 Auto-Craftmanship Tool</p>
    </header>
    
    <main class="app-main">
      <POE2Dashboard />
    </main>
    
    <footer class="app-footer">
      <p>&copy; 2025 POE2 Auto-Craftmanship v{{ appVersion }}</p>
    </footer>
  </div>
</template>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8fafc;
}

.app-header {
  background-color: darkslateblue;
  color: white;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.app-header h1 {
  margin: 0 0 8px 0;
  font-size: 2.5rem;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.subtitle {
  margin: 0;
  font-size: 1.1rem;
  opacity: 0.9;
  font-weight: 300;
}

.app-main {
  flex: 1;
  padding: 20px;
}

.app-footer {
  background-color: #374151;
  color: #9ca3af;
  text-align: center;
  padding: 16px;
  margin-top: auto;
}

.app-footer p {
  margin: 0;
  font-size: 14px;
}
</style>
