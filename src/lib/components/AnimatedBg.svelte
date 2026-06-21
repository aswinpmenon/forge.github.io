<div class="bg" aria-hidden="true">
  <div class="blob b1"></div>
  <div class="blob b2"></div>
  <div class="blob b3"></div>
</div>

<style>
  .bg {
    position: fixed;
    inset: 0;
    overflow: hidden;
    z-index: -1;
    background: transparent;
  }
  .blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(70px);
    will-change: transform;
  }
  .b1 {
    width: 42vmax;
    height: 42vmax;
    left: -10vmax;
    top: -8vmax;
    background: radial-gradient(circle, rgba(184, 255, 0, 0.55), transparent 65%);
    animation: d1 16s ease-in-out infinite alternate;
  }
  .b2 {
    width: 48vmax;
    height: 48vmax;
    right: -14vmax;
    top: 16vh;
    background: radial-gradient(circle, rgba(90, 139, 255, 0.42), transparent 65%);
    animation: d2 22s ease-in-out infinite alternate;
  }
  .b3 {
    width: 50vmax;
    height: 50vmax;
    left: 2vmax;
    bottom: -18vmax;
    background: radial-gradient(circle, rgba(150, 160, 180, 0.3), transparent 65%);
    animation: d3 19s ease-in-out infinite alternate;
  }
  @keyframes d1 {
    0% { transform: translate(0, 0) scale(1); }
    100% { transform: translate(14vmax, 16vmax) scale(1.25); }
  }
  @keyframes d2 {
    0% { transform: translate(0, 0) scale(1); }
    100% { transform: translate(-12vmax, 20vmax) scale(1.15); }
  }
  @keyframes d3 {
    0% { transform: translate(0, 0) scale(1.1); }
    100% { transform: translate(16vmax, -12vmax) scale(1); }
  }
  @media (prefers-reduced-motion: reduce) {
    .blob { animation: none; }
  }
</style>
