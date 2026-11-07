import { suscribirScroll } from "../utils/scrollEngine.js";

// =========================================================
// CONFIGURACIÓN DE IMÁGENES
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

  // =========================================================
  // ALGORITMO COVER UNIVERSAL (PC Y MÓVIL VERTICAL)
  // =========================================================
  vec2 getCoverUV(vec2 uv, vec2 screenRes, vec2 texRes) {
    vec2 s = max(screenRes, vec2(1.0, 1.0));
    vec2 i = max(texRes, vec2(1.0, 1.0));

    float rs = s.x / s.y; // Proporción de la pantalla
    float ri = i.x / i.y; // Proporción de la imagen

    vec2 uvCover = uv;
    if (rs < ri) {
      // PANTALLA VERTICAL (SMARTPHONE): Escala horizontal centrada
      float factor = rs / ri;
      uvCover.x = (uv.x - 0.5) * factor + 0.5;
    } else {
      // PANTALLA HORIZONTAL (PC / ESCRITORIO): Escala vertical centrada
      float factor = ri / rs;
      uvCover.y = (uv.y - 0.5) * factor + 0.5;
    }

    // Zoom de seguridad del 12% para absorber ondulaciones
    uvCover = (uvCover - 0.5) * 0.88 + 0.5;

    // CLAMPING ESTRICTO: NUNCA permite salir de [0, 1] (Elimina líneas estiradas al 100%)
    return clamp(uvCover, 0.002, 0.998);
  }

  void main() {
    vec2 uv = v_uv;

    // UVs calculadas con el algoritmo universal
    vec2 uvBase = getCoverUV(uv, u_resolution, u_tex_base_size);
    vec2 uvLiquid = getCoverUV(uv, u_resolution, u_tex_liquid_size);

    // Parallax vertical seguro dentro de los márgenes clamp
    uvBase.y = clamp(uvBase.y + (u_scroll_progress - 0.5) * 0.08, 0.002, 0.998);
    uvLiquid.y = clamp(uvLiquid.y + (u_scroll_progress - 0.5) * 0.10, 0.002, 0.998);

    // =========================================================
    // 1. FÍSICA DE LA MAREA LÍQUIDA (DERECHA ➔ IZQUIERDA)
    // =========================================================
    float tiempoMarea = u_time * 0.75;
    float vaivenMarea = pow(sin(tiempoMarea) * 0.5 + 0.5, 0.85);

    // En móviles (pantallas estrechas), ajustamos la marea para que sea proporcional
    float limiteMaximo = u_limite_marea;
    float anchoBaseAgua = (limiteMaximo - 0.04) * (0.84 + vaivenMarea * 0.16);

    float curvaOrilla = 
      sin(uv.y * 5.0 + tiempoMarea * 0.9) * 0.038 + 
      cos(uv.y * 11.5 - tiempoMarea * 0.6) * 0.016 + 
      sin(uv.y * 22.0 + tiempoMarea * 1.8) * 0.007;

    float anchoTotalAgua = clamp(anchoBaseAgua + curvaOrilla, 0.04, limiteMaximo);

    // Posición de la orilla
    float xOrilla = 1.0 - anchoTotalAgua;
    float distOrilla = uv.x - xOrilla;
    float factorAgua = smoothstep(-0.008, 0.008, distOrilla);

    // =========================================================
    // 2. FONDO A (BASE) Y AVANCE DEL TELÓN NEGRO CONTROLADO
    // =========================================================
    vec4 texColorBase = texture2D(u_tex_base, uvBase);
    vec3 colorBaseLuz = texColorBase.rgb;

    // CORRECCIÓN CLAVE: El telón negro avanza desde la izquierda,
    // pero su límite MÁXIMO es exactamente donde empieza el agua (xOrilla).
    // Jamás invade el mar de la derecha.
    float frenteTelon = u_telon_progreso * (xOrilla + 0.06) - 0.06;
    float distTelon = frenteTelon - uv.x;
    float factorNegro = smoothstep(-0.03, 0.03, distTelon);
    
    // Borde de penumbra suave
    float sombraAvance = smoothstep(0.08, 0.0, abs(distTelon)) * (1.0 - factorNegro) * 0.60;
    vec3 colorNegroCarbon = vec3(0.047, 0.039, 0.031);

    vec3 colorBaseConTelon = mix(colorBaseLuz - vec3(sombraAvance), colorNegroCarbon, factorNegro);

    // =========================================================
    // 3. FONDO B (MAREA LÍQUIDA VIVA)
    // =========================================================
    vec2 refraccionLiquida = vec2(
      sin(uv.y * 20.0 + u_time * 1.8) * 0.004,
      cos(uv.x * 24.0 - u_time * 2.2) * 0.003
    );
    vec2 uvLiquidRefract = clamp(uvLiquid + refraccionLiquida, 0.002, 0.998);
    vec4 texColorLiquid = texture2D(u_tex_liquid, uvLiquidRefract);
    vec3 colorLiquidFinal = texColorLiquid.rgb;

    // Espuma en la rompiente
    float intensidadOla = smoothstep(0.40, 0.85, limiteMaximo);
    float grosorEspuma = mix(0.014, 0.026, intensidadOla);
    float bordeOrilla = smoothstep(grosorEspuma, 0.0, abs(distOrilla)) * mix(0.42, 0.75, intensidadOla);
    vec3 colorEspumaSuave = vec3(1.0, 0.99, 0.96);

    // =========================================================
    // 4. COMPOSICIÓN FINAL
    // =========================================================
    vec3 colorComposicion = mix(colorBaseConTelon, colorLiquidFinal, factorAgua);
    vec3 colorFinal = mix(colorComposicion, colorEspumaSuave, bordeOrilla * factorAgua);

    // Saturación viva de color
    float saturacion = 1.15;
    float luminancia = dot(colorFinal, vec3(0.299, 0.587, 0.114));
    colorFinal = mix(vec3(luminancia), colorFinal, saturacion);

    gl_FragColor = vec4(colorFinal, 1.0);
  }
`;

let oleadaActiva = false;
let tiempoInicioOleada = 0;
const DURACION_OLEADA_MS = 2100;

let telonActivoMeta = 0.0;
let telonProgresoActual = 0.0;

export function activarTelonNegro(activar = true) {
  telonActivoMeta = activar ? 1.0 : 0.0;
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
  if (!gl.getProgramParameter(programa, gl.LINK_STATUS)) return;
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

  // Inicialización de seguridad para evitar división por cero antes de cargar
  gl.uniform2f(uTexBaseSizeLoc, 1920.0, 1080.0);
  gl.uniform2f(uTexLiquidSizeLoc, 1920.0, 1080.0);

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
      if (img.src.includes(".png")) {
        img.src = url.replace(".png", ".jpg");
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
    telonProgresoActual += (telonActivoMeta - telonProgresoActual) * 0.06;

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
