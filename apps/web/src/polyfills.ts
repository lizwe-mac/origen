// Node.js polyfills for browser environment
declare global {
  var process: any;
}

if (typeof globalThis.process === 'undefined') {
  globalThis.process = {
    env: {},
    browser: true,
    version: '',
    versions: { node: '18.0.0' },
    nextTick: (fn: Function, ...args: any[]) => setTimeout(() => fn(...args), 0),
    platform: 'browser',
    cwd: () => '/',
    argv: [],
    pid: 1,
    stdout: { write: () => {} },
    stderr: { write: () => {} },
    exit: () => {},
    kill: () => {},
    on: () => {},
    once: () => {},
    off: () => {},
    emit: () => {},
    prependListener: () => {},
    prependOnceListener: () => {},
    listeners: () => [],
    binding: () => {},
    umask: () => 0,
    chdir: () => {},
    memoryUsage: () => ({ rss: 0, heapTotal: 0, heapUsed: 0, external: 0 }),
    uptime: () => 0,
    hrtime: () => [0, 0]
  };
}

// Buffer polyfill
if (typeof globalThis.Buffer === 'undefined') {
  globalThis.Buffer = {
    from: (str: string) => new TextEncoder().encode(str),
    isBuffer: () => false,
    alloc: (size: number) => new Uint8Array(size),
    allocUnsafe: (size: number) => new Uint8Array(size),
    concat: (buffers: any[]) => {
      const totalLength = buffers.reduce((acc, buf) => acc + buf.length, 0);
      const result = new Uint8Array(totalLength);
      let offset = 0;
      for (const buf of buffers) {
        result.set(buf, offset);
        offset += buf.length;
      }
      return result;
    }
  };
}

export {};
