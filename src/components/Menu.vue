<script setup lang="ts"></script>

<template>
    <nav>
        <RouterLink class="menu-item" to="/debug">Debug</RouterLink>
        <RouterLink class="menu-item" to="/live">Live</RouterLink>
    </nav>
</template>

<style scoped>
nav {
    padding: 10px;
    border: solid;
    margin: 5px;
}
.menu-item:not(:first-child) {
    margin-left: 10px;
}
</style>
