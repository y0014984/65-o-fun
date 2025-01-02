<script setup lang="ts">
import { onMounted } from 'vue';

onMounted(() => {
    /*     const canvas1 = document.getElementById('canvas1') as HTMLCanvasElement;
    const canvas2 = document.getElementById('canvas2') as HTMLCanvasElement;

    const ctx1 = canvas1.getContext('2d');
    const ctx2 = canvas2.getContext('2d');

    if (ctx1 === null) return;

    ctx1.fillStyle = 'rgb(255 0 0 / 50%)';
    ctx1.fillRect(0, 0, 320, 240);

    if (ctx2 === null) return;

    ctx2.fillStyle = 'rgb(0 255 0 / 50%)';
    ctx2.fillRect(0, 0, 32, 24); */
});
</script>

<template>
    <!--     <div id="container">
        <canvas id="canvas1" width="320" height="240"></canvas>
        <canvas id="canvas2" width="320" height="240"></canvas>
    </div> -->
</template>

<style>
#container {
    width: 100px;
    height: 100px;
    position: relative;
}

#canvas1 {
    width: 640px;
    height: 480px;
    position: absolute;
    top: 0;
    left: 0;
}

#canvas2 {
    width: 640px;
    height: 480px;
    position: absolute;
    top: 1;
    left: 1;
}
</style>
