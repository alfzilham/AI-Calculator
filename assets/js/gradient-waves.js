/* Gradient Waves background - vanilla WebGL2 port (no React / no ogl) */

(function () {
  const VERTEX_SRC = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

  const FRAGMENT_SRC = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uSpeed;
uniform float uAmplitude;
uniform float uWaveScale;
uniform float uWaveRatio;
uniform float uSwell;
uniform float uTurbulence;
uniform float uTilt;
uniform float uZoom;
uniform float uHeight;
uniform float uFogDepth;
uniform float uSteps;
uniform float uBrightness;
uniform float uOpacity;
uniform float uGrain;
uniform float uGrainIntensity;
uniform vec2 uMouse;
uniform float uParallax;
uniform bool uEnableMouse;
uniform vec3 uHorizonColor;
uniform vec3 uWaveColor;
uniform vec3 uCrestColor;
out vec4 fragColor;

const float MAX_DIST = 20000.0;

float hash21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float plasma(vec3 r, vec2 freq, vec4 tc) {
  float mx = r.x + tc.x;
  mx += uSwell * sin((r.y + mx) / 20.0 + tc.y);
  float my = r.y - tc.z;
  my += uTurbulence * cos(r.x / 23.0 + tc.w);
  return r.z - (sin(mx * freq.x) * uAmplitude + sin(my * freq.y) * uAmplitude + uHeight);
}

float raymarch(vec3 pos, vec3 dir, vec2 freq, vec4 tc) {
  float dist = 0.0;
  for (int i = 0; i < 128; i++) {
    if (float(i) >= uSteps) break;
    float dscene = plasma(pos + dist * dir, freq, tc);
    if (abs(dscene) < 0.1) break;
    dist += 0.9 * dscene;
    if (!(abs(dist) < MAX_DIST)) return MAX_DIST;
  }
  return dist;
}

void main() {
  float T = iTime * uSpeed;
  vec2 freq = vec2(uWaveScale / 7.0, (uWaveScale * uWaveRatio) / 3.0);
  vec4 tc = vec4(T / 0.130, T / 0.810, T / 0.200, T / 0.710);
  float c, s;
  float vfov = (3.14159 / 2.3) / max(uZoom, 0.05);
  vec3 cam = vec3(0.0, 0.0, 30.0);
  vec2 uv = (gl_FragCoord.xy / iResolution.xy) - 0.5;
  uv.x *= iResolution.x / iResolution.y;
  uv.y *= -1.0;

  vec3 dir = vec3(0.0, 0.0, -1.0);
  float ulen = length(uv);
  float xrot = vfov * ulen;
  c = cos(xrot); s = sin(xrot);
  dir = mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c) * dir;
  vec2 nuv = ulen > 1e-5 ? uv / ulen : vec2(1.0, 0.0);
  c = nuv.x; s = nuv.y;
  dir = mat3(c, -s, 0.0, s, c, 0.0, 0.0, 0.0, 1.0) * dir;
  c = cos(uTilt); s = sin(uTilt);
  dir = mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c) * dir;

  if (uEnableMouse) {
    float yaw = (uMouse.x - 0.5) * uParallax * 0.4;
    float pitch = (uMouse.y - 0.5) * uParallax * 0.4;
    c = cos(yaw); s = sin(yaw);
    dir = mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c) * dir;
    c = cos(pitch); s = sin(pitch);
    dir = mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c) * dir;
  }

  float dist = raymarch(cam, dir, freq, tc);
  vec3 pos = cam + dist * dir;

  float t = clamp(uFogDepth / max(dist, 0.001), 0.0, 1.0);
  vec3 body = mix(uWaveColor, uCrestColor, clamp(pos.z * 0.08 + 0.5, 0.0, 1.0));
  vec3 col = mix(uHorizonColor, body, t);
  col *= uBrightness;
  col = clamp(col, 0.0, 1.0);

  float alpha = clamp(t, 0.0, 1.0) * uOpacity;
  if (uGrain > 0.5) {
    float g = hash21(gl_FragCoord.xy + mod(iTime, 64.0) * 11.0);
    alpha += (g - 0.5) * uGrainIntensity;
  }
  alpha = clamp(alpha, 0.0, 1.0);
  fragColor = vec4(col * alpha, alpha);
}
`;

  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return [1, 1, 1];
    return [
      parseInt(result[1], 16) / 255,
      parseInt(result[2], 16) / 255,
      parseInt(result[3], 16) / 255
    ];
  }

  function detailToSteps(detail) {
    if (detail === 'low') return 40.0;
    if (detail === 'high') return 110.0;
    return 70.0;
  }

  function compileShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  function createProgram(gl, vertexSrc, fragmentSrc) {
    const vs = compileShader(gl, gl.VERTEX_SHADER, vertexSrc);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSrc);
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return null;
    }
    return program;
  }

  function GradientWaves(container, opts) {
    opts = opts || {};
    const options = {
      horizonColor: opts.horizonColor || '#5227FF',
      waveColor: opts.waveColor || '#FF9FFC',
      crestColor: opts.crestColor || '#FFFFFF',
      speed: opts.speed !== undefined ? opts.speed : 0.4,
      amplitude: opts.amplitude !== undefined ? opts.amplitude : 2.5,
      waveScale: opts.waveScale !== undefined ? opts.waveScale : 0.6,
      waveRatio: opts.waveRatio !== undefined ? opts.waveRatio : 0.9,
      swell: opts.swell !== undefined ? opts.swell : 35,
      turbulence: opts.turbulence !== undefined ? opts.turbulence : 20,
      tilt: opts.tilt !== undefined ? opts.tilt : 1.11,
      zoom: opts.zoom !== undefined ? opts.zoom : 1.0,
      height: opts.height !== undefined ? opts.height : 5.5,
      fogDepth: opts.fogDepth !== undefined ? opts.fogDepth : 15,
      detail: opts.detail || 'medium',
      brightness: opts.brightness !== undefined ? opts.brightness : 1.0,
      opacity: opts.opacity !== undefined ? opts.opacity : 1.0,
      mouseInteraction: opts.mouseInteraction !== undefined ? opts.mouseInteraction : true,
      parallaxStrength: opts.parallaxStrength !== undefined ? opts.parallaxStrength : 0.5,
      grain: opts.grain !== undefined ? opts.grain : true,
      grainIntensity: opts.grainIntensity !== undefined ? opts.grainIntensity : 0.05
    };

    const canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    container.appendChild(canvas);

    const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false });
    if (!gl) {
      console.warn('WebGL2 not supported, gradient waves background disabled.');
      return null;
    }
    gl.clearColor(0, 0, 0, 0);

    const program = createProgram(gl, VERTEX_SRC, FRAGMENT_SRC);
    gl.useProgram(program);

    // Fullscreen triangle
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(program, 'position');
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uniforms = {};
    [
      'iTime', 'iResolution', 'uSpeed', 'uAmplitude', 'uWaveScale', 'uWaveRatio',
      'uSwell', 'uTurbulence', 'uTilt', 'uZoom', 'uHeight', 'uFogDepth', 'uSteps',
      'uBrightness', 'uOpacity', 'uGrain', 'uGrainIntensity', 'uMouse', 'uParallax',
      'uEnableMouse', 'uHorizonColor', 'uWaveColor', 'uCrestColor'
    ].forEach((name) => {
      uniforms[name] = gl.getUniformLocation(program, name);
    });

    function applyStaticUniforms() {
      gl.uniform1f(uniforms.uSpeed, options.speed);
      gl.uniform1f(uniforms.uAmplitude, options.amplitude);
      gl.uniform1f(uniforms.uWaveScale, options.waveScale);
      gl.uniform1f(uniforms.uWaveRatio, options.waveRatio);
      gl.uniform1f(uniforms.uSwell, options.swell);
      gl.uniform1f(uniforms.uTurbulence, options.turbulence);
      gl.uniform1f(uniforms.uTilt, options.tilt);
      gl.uniform1f(uniforms.uZoom, options.zoom);
      gl.uniform1f(uniforms.uHeight, options.height);
      gl.uniform1f(uniforms.uFogDepth, options.fogDepth);
      gl.uniform1f(uniforms.uSteps, detailToSteps(options.detail));
      gl.uniform1f(uniforms.uBrightness, options.brightness);
      gl.uniform1f(uniforms.uOpacity, options.opacity);
      gl.uniform1f(uniforms.uGrain, options.grain ? 1.0 : 0.0);
      gl.uniform1f(uniforms.uGrainIntensity, options.grainIntensity);
      gl.uniform1f(uniforms.uParallax, options.parallaxStrength);
      gl.uniform1i(uniforms.uEnableMouse, options.mouseInteraction ? 1 : 0);

      const h = hexToRgb(options.horizonColor);
      const w = hexToRgb(options.waveColor);
      const cr = hexToRgb(options.crestColor);
      gl.uniform3f(uniforms.uHorizonColor, h[0], h[1], h[2]);
      gl.uniform3f(uniforms.uWaveColor, w[0], w[1], w[2]);
      gl.uniform3f(uniforms.uCrestColor, cr[0], cr[1], cr[2]);
    }
    applyStaticUniforms();

    function setSize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = container.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width * dpr));
      const h = Math.max(1, Math.floor(rect.height * dpr));
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uniforms.iResolution, gl.drawingBufferWidth, gl.drawingBufferHeight);
    }

    const ro = new ResizeObserver(setSize);
    ro.observe(container);
    setSize();

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const currentMouse = [0.5, 0.5];
    const targetMouse = [0.5, 0.5];

    function onPointerMove(e) {
      const rect = canvas.getBoundingClientRect();
      targetMouse[0] = (e.clientX - rect.left) / rect.width;
      targetMouse[1] = 1.0 - (e.clientY - rect.top) / rect.height;
    }
    function onPointerLeave() {
      targetMouse[0] = 0.5;
      targetMouse[1] = 0.5;
    }
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerleave', onPointerLeave);

    let raf = 0;
    let isVisible = true;
    let isPageVisible = !document.hidden;
    const t0 = performance.now();

    function loop(t) {
      gl.uniform1f(uniforms.iTime, (t - t0) * 0.001);
      const tx = options.mouseInteraction && !reduceMotion ? targetMouse[0] : 0.5;
      const ty = options.mouseInteraction && !reduceMotion ? targetMouse[1] : 0.5;
      currentMouse[0] += 0.05 * (tx - currentMouse[0]);
      currentMouse[1] += 0.05 * (ty - currentMouse[1]);
      gl.uniform2f(uniforms.uMouse, currentMouse[0], currentMouse[1]);

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.bindVertexArray(vao);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(loop);
    }

    function tryStart() {
      if (reduceMotion) return;
      if (isVisible && isPageVisible && raf === 0) raf = requestAnimationFrame(loop);
    }
    function tryStop() {
      if (raf !== 0) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    }

    const io = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0].isIntersecting;
        isVisible ? tryStart() : tryStop();
      },
      { threshold: 0 }
    );
    io.observe(container);

    document.addEventListener('visibilitychange', () => {
      isPageVisible = !document.hidden;
      isPageVisible ? tryStart() : tryStop();
    });

    tryStart();

    return {
      setColors(horizonColor, waveColor, crestColor) {
        const h = hexToRgb(horizonColor);
        const w = hexToRgb(waveColor);
        const cr = hexToRgb(crestColor);
        gl.uniform3f(uniforms.uHorizonColor, h[0], h[1], h[2]);
        gl.uniform3f(uniforms.uWaveColor, w[0], w[1], w[2]);
        gl.uniform3f(uniforms.uCrestColor, cr[0], cr[1], cr[2]);
      },
      destroy() {
        tryStop();
        ro.disconnect();
        io.disconnect();
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerleave', onPointerLeave);
        try {
          container.removeChild(canvas);
        } catch (e) {}
      }
    };
  }

  window.GradientWaves = GradientWaves;
})();
