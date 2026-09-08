import { useEffect, useRef } from 'react';

interface Props {
  active: boolean;
}

const vertexSource = `
  attribute vec2 aPosition;
  void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }
`;

const fragmentSource = `
  precision mediump float;
  uniform vec2 uResolution;
  uniform vec2 uPointer;
  uniform float uTime;

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution;
    vec2 pointer = uPointer / uResolution;
    vec2 drift = vec2(sin(uTime * 0.19), cos(uTime * 0.13)) * 0.04;
    float distanceToTorch = distance(uv, pointer);
    float torch = smoothstep(0.42, 0.0, distanceToTorch);

    vec3 violet = vec3(0.32, 0.16, 0.56);
    vec3 amber = vec3(0.88, 0.48, 0.18);
    vec3 blue = vec3(0.12, 0.28, 0.62);
    float violetField = smoothstep(0.52, 0.0, distance(uv, vec2(0.18, 0.32) + drift));
    float amberField = smoothstep(0.48, 0.0, distance(uv, pointer + vec2(0.02, -0.01)));
    float blueField = smoothstep(0.58, 0.0, distance(uv, vec2(0.82, 0.72) - drift));
    vec3 color = violet * violetField * 0.30 + amber * amberField * 0.52 + blue * blueField * 0.20;
    float alpha = (violetField * 0.08 + amberField * 0.20 + blueField * 0.06) * torch;
    gl_FragColor = vec4(color, alpha);
  }
`;

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
}

/** WebGL-only light field. Notes and controls remain accessible DOM. */
export function WebGLTorchField({ active }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { alpha: true, antialias: false });
    if (!gl) {
      canvas.dataset.webglReady = 'false';
      return;
    }

    const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    if (!vertex || !fragment) {
      canvas.dataset.webglReady = 'false';
      return;
    }
    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'aPosition');
    const resolution = gl.getUniformLocation(program, 'uResolution');
    const pointer = gl.getUniformLocation(program, 'uPointer');
    const time = gl.getUniformLocation(program, 'uTime');
    const pointerPosition = { x: 0, y: 0 };
    let frame = 0;
    const started = performance.now();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    const move = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointerPosition.x = Math.max(0, Math.min(canvas.width, (event.clientX - rect.left) * (canvas.width / rect.width)));
      pointerPosition.y = Math.max(0, Math.min(canvas.height, (rect.bottom - event.clientY) * (canvas.height / rect.height)));
    };
    const render = (now: number) => {
      if (active) {
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(program);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.enableVertexAttribArray(position);
        gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
        gl.uniform2f(resolution, canvas.width, canvas.height);
        gl.uniform2f(pointer, pointerPosition.x, pointerPosition.y);
        gl.uniform1f(time, (now - started) / 1000);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
      frame = requestAnimationFrame(render);
    };

    resize();
    canvas.dataset.webglReady = 'true';
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', move);
    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', move);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
    };
  }, [active]);

  return <canvas ref={canvasRef} className={`webgl-torch-field${active ? ' webgl-torch-field--active' : ''}`} aria-hidden="true" />;
}
