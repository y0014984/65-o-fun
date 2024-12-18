<script setup lang="ts"></script>

<template>
    <nav>
        <RouterLink class="menu-item" to="/65-o-fun/debug">Debug</RouterLink>
        <RouterLink class="menu-item" to="/65-o-fun/live">Live</RouterLink>
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
