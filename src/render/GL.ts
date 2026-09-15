export type Color = [number, number, number, number];

export interface Texture {
  id: WebGLTexture;
  width: number;
  height: number;
  u0: number;
  v0: number;
  u1: number;
  v1: number;
}

const vertex = (precision: string) =>
  `attribute vec2 a_position; attribute vec2 a_uv; attribute vec4 a_color; uniform vec2 u_resolution; varying ${precision} vec2 v_uv; varying lowp vec4 v_color; void main(){vec2 p=a_position/u_resolution*2.0-1.0;gl_Position=vec4(p.x,-p.y,0,1);v_uv=a_uv;v_color=a_color;}`;

const fragment = (precision: string) =>
  `precision ${precision} float; uniform sampler2D u_image; varying ${precision} vec2 v_uv; varying lowp vec4 v_color; void main(){gl_FragColor=texture2D(u_image,v_uv)*v_color;}`;

/** Small streaming sprite batch. All battlefield pixels are rendered through WebGL. */
export class GL {
  readonly gl: WebGLRenderingContext;
  private program: WebGLProgram;
  private buffer: WebGLBuffer;
  private resolution: WebGLUniformLocation;
  private vertices = new Float32Array(8 * 6 * 8192);
  private length = 0;
  private texture: Texture | null = null;
  private white: Texture;
  private atlas: WebGLTexture | null = null;
  private atlasX = 1;
  private atlasY = 1;
  private atlasRow = 0;
  private atlasSize = 2048;
  width = 1;
  height = 1;
  constructor(readonly canvas: HTMLCanvasElement) {
    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      preserveDrawingBuffer: true,
    });

    if (!gl)
      throw new Error(
        'This browser could not start WebGL. Enable hardware acceleration and reload.',
      );
    this.gl = gl;
    const preciseUV = !!gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT)?.precision;
    // A mediump-only fragment shader cannot address subtexels reliably in a
    // 2048px atlas. Keep its atlas within the available precision instead.
    const precision = preciseUV ? 'highp' : 'mediump';
    this.atlasSize = Math.min(preciseUV ? 2048 : 512, gl.getParameter(gl.MAX_TEXTURE_SIZE));

    const shader = (type: number, text: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, text);
      gl.compileShader(s);

      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
        throw new Error(gl.getShaderInfoLog(s) || 'Shader error');

      return s;
    };

    this.program = gl.createProgram()!;
    gl.attachShader(this.program, shader(gl.VERTEX_SHADER, vertex(precision)));
    gl.attachShader(this.program, shader(gl.FRAGMENT_SHADER, fragment(precision)));
    gl.linkProgram(this.program);
    gl.useProgram(this.program);

    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS))
      throw new Error('WebGL shader linking failed');
    this.buffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

    for (const [name, size, offset] of [
      ['a_position', 2, 0],
      ['a_uv', 2, 8],
      ['a_color', 4, 16],
    ] as const) {
      const loc = gl.getAttribLocation(this.program, name);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 32, offset);
    }

    this.resolution = gl.getUniformLocation(this.program, 'u_resolution')!;
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    const pixel = document.createElement('canvas');
    pixel.width = pixel.height = 1;
    pixel.getContext('2d')!.fillStyle = 'white';
    pixel.getContext('2d')!.fillRect(0, 0, 1, 1);
    this.white = this.createTexture(pixel);
  }
  createTexture(source: HTMLCanvasElement): Texture {
    this.flush();

    const gl = this.gl,
      w = source.width,
      h = source.height,
      size = this.atlasSize;

    if (w + 2 > size || h + 2 > size) throw new Error('Sprite exceeds the supported texture size');

    if (this.atlasX + w + 1 > size) {
      this.atlasX = 1;
      this.atlasY += this.atlasRow + 2;
      this.atlasRow = 0;
    }

    if (!this.atlas || this.atlasY + h + 1 > size) {
      this.atlas = gl.createTexture()!;
      this.atlasX = 1;
      this.atlasY = 1;
      this.atlasRow = 0;
      gl.bindTexture(gl.TEXTURE_2D, this.atlas);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    } else gl.bindTexture(gl.TEXTURE_2D, this.atlas);

    const x = this.atlasX,
      y = this.atlasY,
      id = this.atlas;

    this.uploadTexture(id, x, y, w, h, source);
    this.atlasX += w + 2;
    this.atlasRow = Math.max(this.atlasRow, h);
    this.texture = null;

    return {
      id,
      width: w,
      height: h,
      u0: x / size,
      v0: y / size,
      u1: (x + w) / size,
      v1: (y + h) / size,
    };
  }
  updateTexture(texture: Texture, source: HTMLCanvasElement) {
    if (source.width !== texture.width || source.height !== texture.height)
      throw new Error('Texture update dimensions changed');
    this.flush();
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture.id);
    this.uploadTexture(
      texture.id,
      Math.round(texture.u0 * this.atlasSize),
      Math.round(texture.v0 * this.atlasSize),
      texture.width,
      texture.height,
      source,
    );
    this.texture = null;
  }
  private uploadTexture(
    _id: WebGLTexture,
    x: number,
    y: number,
    w: number,
    h: number,
    source: HTMLCanvasElement,
  ) {
    // Extrude the outer texels into the existing atlas gutter. Nearest
    // sampling at a fractional scale must never pick an unrelated entry or
    // an uninitialized transparent gutter pixel along an opaque sprite edge.
    const padded = document.createElement('canvas');
    padded.width = w + 2;
    padded.height = h + 2;

    const ctx = padded.getContext('2d')!,
      image = source;

    ctx.drawImage(image, 1, 1);
    ctx.drawImage(image, 0, 0, w, 1, 1, 0, w, 1);
    ctx.drawImage(image, 0, h - 1, w, 1, 1, h + 1, w, 1);
    ctx.drawImage(image, 0, 0, 1, h, 0, 1, 1, h);
    ctx.drawImage(image, w - 1, 0, 1, h, w + 1, 1, 1, h);
    ctx.drawImage(image, 0, 0, 1, 1, 0, 0, 1, 1);
    ctx.drawImage(image, w - 1, 0, 1, 1, w + 1, 0, 1, 1);
    ctx.drawImage(image, 0, h - 1, 1, 1, 0, h + 1, 1, 1);
    ctx.drawImage(image, w - 1, h - 1, 1, 1, w + 1, h + 1, 1, 1);
    const gl = this.gl;
    gl.texSubImage2D(gl.TEXTURE_2D, 0, x - 1, y - 1, gl.RGBA, gl.UNSIGNED_BYTE, padded);
  }
  begin(width: number, height: number) {
    this.width = width;
    this.height = height;

    const ratio = Math.min(devicePixelRatio || 1, 2),
      w = Math.round(width * ratio),
      h = Math.round(height * ratio);

    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }

    this.gl.viewport(0, 0, w, h);
    this.gl.uniform2f(this.resolution, width, height);
    this.gl.clearColor(0, 0, 0, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.length = 0;
    this.texture = null;
  }
  flush() {
    if (!this.length) return;
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      this.vertices.subarray(0, this.length),
      this.gl.STREAM_DRAW,
    );
    this.gl.drawArrays(this.gl.TRIANGLES, 0, this.length / 8);
    this.length = 0;
  }
  private bind(texture: Texture) {
    if (this.texture?.id !== texture.id) {
      this.flush();
      this.gl.bindTexture(this.gl.TEXTURE_2D, texture.id);
    }

    this.texture = texture;

    if (this.length + 48 > this.vertices.length) this.flush();
  }
  private v(x: number, y: number, u: number, v: number, color: Color) {
    this.vertices.set([x, y, u, v, ...color], this.length);
    this.length += 8;
  }
  sprite(
    texture: Texture,
    x: number,
    y: number,
    width: number,
    height: number,
    color: Color = [1, 1, 1, 1],
  ) {
    this.bind(texture);
    const { u0, v0, u1, v1 } = texture;
    this.v(x, y, u0, v0, color);
    this.v(x + width, y, u1, v0, color);
    this.v(x, y + height, u0, v1, color);
    this.v(x, y + height, u0, v1, color);
    this.v(x + width, y, u1, v0, color);
    this.v(x + width, y + height, u1, v1, color);
  }
  polygon(points: [number, number][], color: Color) {
    this.bind(this.white);

    const u = (this.white.u0 + this.white.u1) / 2,
      v = (this.white.v0 + this.white.v1) / 2;

    for (let i = 1; i < points.length - 1; i++) {
      if (this.length + 24 > this.vertices.length) this.flush();

      for (const p of [points[0], points[i], points[i + 1]]) this.v(p[0], p[1], u, v, color);
    }
  }
  rect(x: number, y: number, w: number, h: number, c: Color) {
    this.sprite(this.white, x, y, w, h, c);
  }
  line(x1: number, y1: number, x2: number, y2: number, width: number, c: Color) {
    const d = Math.hypot(x2 - x1, y2 - y1) || 1,
      x = ((-(y2 - y1) / d) * width) / 2,
      y = (((x2 - x1) / d) * width) / 2;

    this.polygon(
      [
        [x1 + x, y1 + y],
        [x2 + x, y2 + y],
        [x2 - x, y2 - y],
        [x1 - x, y1 - y],
      ],
      c,
    );
  }
  ring(x: number, y: number, rx: number, ry: number, color: Color, width = 1) {
    for (let i = 0; i < 32; i++) {
      const a = (i / 32) * Math.PI * 2,
        b = ((i + 1) / 32) * Math.PI * 2;

      this.line(
        x + Math.cos(a) * rx,
        y + Math.sin(a) * ry,
        x + Math.cos(b) * rx,
        y + Math.sin(b) * ry,
        width,
        color,
      );
    }
  }
}
