import { suscribirScroll } from "../utils/scrollEngine.js";

// =========================================================
// CONFIGURACIÓN DE TUS DOS IMÁGENES
// =========================================================
const RUTA_IMAGEN_BASE = "/fondos/textura-base.jpg";
const RUTA_IMAGEN_MAREA = "/fondos/24000001-large.png";

const VERTEX_SHADER_SRC = `
  attribute vec2 a_position;
  varying vec2 v_uv;
  void main() {
    v_uv = (a_position + 1.0) * 0.5;
    v_uv.y = 1.0 - v_uv.y;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER_SRC = `
  precision mediump float;
  varying vec2 v_uv;

  uniform sampler2D u_tex_base;
  uniform sampler2D u_tex_liquid;

  uniform float u_time;
  uniform float u_scroll_progress;
  uniform float u_limite_marea;
  uniform float u_telon_progreso;
  uniform vec2 u_resolution;
  uniform vec2 u_tex_base_size;
  uniform vec2 u_tex_liquid_size;

  // Algoritmo Cover Universal con Clamping de Seguridad
  vec2 getCoverUV(vec2 uv, vec2 screenRes, vec2 texRes, float zoomFactor, float offsetY) {
    vec2 s = max(screenRes, vec2(1.0, 1.0));
    vec2 i = max(texRes, vec2(1.0, 1.0));

    float rs = s.x / s.y;
    float ri = i.x / i.y;

    vec2 uvCover = uv;
    if (rs < ri) {
      float factor = rs / ri;
      uvCover.x = (uv.x - 0.5) * factor + 0.5;
    } else {
      float factor = ri / rs;
      uvCover.y = (uv.y - 0.5) * factor + 0.5;
    }

    uvCover.y += offsetY;
    uvCover = (uvCover - 0.5) * (0.88 / max(zoomFactor, 0.01)) + 0.5;
    return clamp(uvCover, 0.002, 0.998);
  }

  void main() {
    vec2 uv = v_uv;
    bool esMovil = u_resolution.x < u_resolution.y;

    float zoomBase = esMovil ? 2.20 : 1.0;
    vec2 uvBase = getCoverUV(uv, u_resolution, u_tex_base_size, zoomBase, 0.0);

    float zoomMarea = esMovil ? 2.35 : 1.0;
    vec2 uvLiquid = getCoverUV(uv, u_resolution, u_tex_liquid_size, zoomMarea, 0.0);

    uvBase.y = clamp(uvBase.y + (u_scroll_progress - 0.5) * 0.08, 0.002, 0.998);
    uvLiquid.y = clamp(uvLiquid.y + (u_scroll_progress - 0.5) * 0.10, 0.002, 0.998);

    // 1. FISICA DE LA MAREA (DERECHA A IZQUIERDA)
    float tiempoMarea = u_time * 0.75;
    float vaivenMarea = pow(sin(tiempoMarea) * 0.5 + 0.5, 0.85);

    float limiteMaximo = clamp(u_limite_marea, 0.05, 0.95);
    float anchoBaseAgua = (limiteMaximo - 0.04) * (0.84 + vaivenMarea * 0.16);

    float curvaOrilla = 
      sin(uv.y * 5.0 + tiempoMarea * 0.9) * 0.038 + 
      cos(uv.y * 11.5 - tiempoMarea * 0.6) * 0.016 + 
      sin(uv.y * 22.0 + tiempoMarea * 1.8) * 0.007;

    float anchoTotalAgua = clamp(anchoBaseAgua + curvaOrilla, 0.04, limiteMaximo);
    float xOrilla = 1.0 - anchoTotalAgua;
    float distOrilla = uv.x - xOrilla;
    float factorAgua = smoothstep(-0.008, 0.008, distOrilla);

    // 2. FONDO A (BASE) Y AVANCE DEL TELON NEGRO
    vec4 texColorBase = texture2D(u_tex_base, uvBase);
    vec3 colorBaseLuz = texColorBase.rgb;

    float frenteTelon;
    if (u_telon_progreso <= 1.0) {
      frenteTelon = u_telon_progreso * (xOrilla + 0.06) - 0.06;
    } else {
      float t2 = u_telon_progreso - 1.0;
      frenteTelon = mix(xOrilla, 1.18, t2);
    }

    float distTelon = frenteTelon - uv.x;
    float factorNegro = smoothstep(-0.04, 0.04, distTelon);
    float sombraAvance = smoothstep(0.09, 0.0, abs(distTelon)) * (1.0 - factorNegro) * 0.65;
    vec3 colorNegroCarbon = vec3(0.047, 0.039, 0.031);

    vec3 colorBaseConTelon = mix(colorBaseLuz - vec3(sombraAvance), colorNegroCarbon, factorNegro);

    // 3. FONDO B (MAREA LIQUIDA)
    vec2 refraccionLiquida = vec2(
      sin(uv.y * 20.0 + u_time * 1.8) * 0.004,
      cos(uv.x * 24.0 - u_time * 2.2) * 0.003
    );
    vec2 uvLiquidRefract = clamp(uvLiquid + refraccionLiquida, 0.002, 0.998);
    vec4 texColorLiquid = texture2D(u_tex_liquid, uvLiquidRefract);
    vec3 colorLiquidFinal = texColorLiquid.rgb;

    vec3 colorAguaConTelon = mix(colorLiquidFinal - vec3(sombraAvance), colorNegroCarbon, factorNegro);

    float intensidadOla = smoothstep(0.40, 0.85, limiteMaximo);
    float grosorEspuma = mix(0.014, 0.026, intensidadOla);
    float bordeOrilla = smoothstep(grosorEspuma, 0.0, abs(distOrilla)) * mix(0.42, 0.75, intensidadOla);
    vec3 colorEspumaSuave = vec3(1.0, 0.99, 0.96);

    vec3 colorComposicion = mix(colorBaseConTelon, colorAguaConTelon, factorAgua);
    vec3 colorMezcla = mix(colorComposicion, colorEspumaSuave, bordeOrilla * factorAgua * (1.0 - factorNegro));

    // 4. SALIDA Y SATURACION (DECLARADA UNA SOLA VEZ)
    float saturacion = 1.15;
    float luminancia = dot(colorMezcla, vec3(0.299, 0.587, 0.114));
    vec3 colorSalidaFinal = mix(vec3(luminancia), colorMezcla, saturacion);

    gl_FragColor = vec4(colorSalidaFinal, 1.0);
  }
`;

let oleadaActiva = false;
let tiempoInicioOleada = 0;
const DURACION_OLEADA_MS = 2100;

let telonActivoMeta = 0.0;
let telonProgresoActual = 0.0;

export function fijarModoTelonNegro(modo) {
  if (modo === "total") {
    telonActivoMeta = 2.0;
  } else if (modo === "parcial") {
    telonActivoMeta = 1.0;
  } else {
    telonActivoMeta = 0.0;
  }
}

export function dispararOleadaMarea() {
  oleadaActiva = true;
  tiempoInicioOleada = performance.now();
}

function smootherstep(x) {
  const c = Math.max(0, Math.min(1, x));
  return c * c * c * (c * (c * 6 - 15) + 10);
}

export function iniciarFondoInmersivo() {
  if (document.querySelector("#canvas-inmersivo")) return;

  const canvas = document.createElement("canvas");
  canvas.id = "canvas-inmersivo";
  document.body.prepend(canvas);

  const gl =
    canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  if (!gl) return;

  function compilarShader(tipo, codigo) {
    const shader = gl.createShader(tipo);
    gl.shaderSource(shader, codigo);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error("Error al compilar Shader:", gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  const vertShader = compilarShader(gl.VERTEX_SHADER, VERTEX_SHADER_SRC);
  const fragShader = compilarShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SRC);
  if (!vertShader || !fragShader) return;

  const programa = gl.createProgram();
  gl.attachShader(programa, vertShader);
  gl.attachShader(programa, fragShader);
  gl.linkProgram(programa);
  if (!gl.getProgramParameter(programa, gl.LINK_STATUS)) {
    console.error(
      "Error al enlazar programa WebGL:",
      gl.getProgramInfoLog(programa),
    );
    return;
  }
  gl.useProgram(programa);

  const vertices = new Float32Array([
    -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0,
  ]);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  const posAttr = gl.getAttribLocation(programa, "a_position");
  gl.enableVertexAttribArray(posAttr);
  gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

  const uTimeLoc = gl.getUniformLocation(programa, "u_time");
  const uScrollProgLoc = gl.getUniformLocation(programa, "u_scroll_progress");
  const uLimiteMareaLoc = gl.getUniformLocation(programa, "u_limite_marea");
  const uTelonProgLoc = gl.getUniformLocation(programa, "u_telon_progreso");
  const uResLoc = gl.getUniformLocation(programa, "u_resolution");
  const uTexBaseLoc = gl.getUniformLocation(programa, "u_tex_base");
  const uTexLiquidLoc = gl.getUniformLocation(programa, "u_tex_liquid");
  const uTexBaseSizeLoc = gl.getUniformLocation(programa, "u_tex_base_size");
  const uTexLiquidSizeLoc = gl.getUniformLocation(
    programa,
    "u_tex_liquid_size",
  );

  function redimensionar() {
    const dpr = Math.min(
      window.devicePixelRatio || 1,
      window.innerWidth < 850 ? 1.25 : 1.5,
    );
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uResLoc, canvas.width, canvas.height);
  }
  window.addEventListener("resize", redimensionar);
  redimensionar();

  gl.uniform2f(uTexBaseSizeLoc, 1920.0, 1080.0);
  gl.uniform2f(uTexLiquidSizeLoc, 1920.0, 1080.0);
  gl.uniform1f(uLimiteMareaLoc, 0.395);
  gl.uniform1f(uTelonProgLoc, 0.0);

  function cargarTextura(unidad, url, fallbackUrl, uSamplerLoc, uSizeLoc) {
    const tex = gl.createTexture();
    gl.activeTexture(unidad);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([247, 243, 238, 255]),
    );

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;

    img.onload = () => {
      gl.activeTexture(unidad);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.uniform2f(
        uSizeLoc,
        img.naturalWidth || 1920,
        img.naturalHeight || 1080,
      );
    };

    img.onerror = () => {
      // Intento inteligente de reemplazo de extensión si la ruta era errónea
      if (img.src.includes(".png")) {
        img.src = url.replace(".png", ".jpg");
      } else if (img.src.includes(".jpg")) {
        img.src = url.replace(".jpg", ".png");
      } else if (fallbackUrl && img.src !== fallbackUrl) {
        img.src = fallbackUrl;
      }
    };

    const unidadIndex = unidad - gl.TEXTURE0;
    gl.uniform1i(uSamplerLoc, unidadIndex);
  }

  cargarTextura(
    gl.TEXTURE0,
    RUTA_IMAGEN_BASE,
    "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=1600&auto=format&fit=crop",
    uTexBaseLoc,
    uTexBaseSizeLoc,
  );
  cargarTextura(
    gl.TEXTURE1,
    RUTA_IMAGEN_MAREA,
    "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1600&auto=format&fit=crop",
    uTexLiquidLoc,
    uTexLiquidSizeLoc,
  );

  let scrollProgresoActual = 0.0;
  let tiempoInicio = performance.now();

  suscribirScroll((estado) => {
    scrollProgresoActual = estado.progreso;
  });

  function renderizar(tiempoActual) {
    const segundos = (tiempoActual - tiempoInicio) * 0.001;

    telonProgresoActual += (telonActivoMeta - telonProgresoActual) * 0.055;

    let limiteActual = 0.395;

    if (oleadaActiva) {
      const transcurrido = tiempoActual - tiempoInicioOleada;
      const p = transcurrido / DURACION_OLEADA_MS;

      if (p >= 1.0) {
        oleadaActiva = false;
        limiteActual = 0.395;
      } else if (p < 0.42) {
        const x = p / 0.42;
        limiteActual = 0.395 + smootherstep(x) * (0.85 - 0.395);
      } else if (p < 0.76) {
        const x = (p - 0.42) / (0.76 - 0.42);
        limiteActual = 0.85 - smootherstep(x) * (0.85 - 0.3);
      } else {
        const x = (p - 0.76) / (1.0 - 0.76);
        limiteActual = 0.3 + smootherstep(x) * (0.395 - 0.3);
      }
    }

    gl.uniform1f(uTimeLoc, segundos);
    gl.uniform1f(uScrollProgLoc, scrollProgresoActual);
    gl.uniform1f(uLimiteMareaLoc, limiteActual);
    gl.uniform1f(uTelonProgLoc, telonProgresoActual);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(renderizar);
  }

  requestAnimationFrame(renderizar);
}
