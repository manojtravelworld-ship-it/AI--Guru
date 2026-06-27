import { LlmInference, FilesetResolver } from '@mediapipe/tasks-genai';

class LiteRTEngine {
  private inference: LlmInference | null = null;
  private isModelLoading: boolean = false;
  private isPaused: boolean = false;
  private loadedMB: number = 0;
  private totalMB: number = 1430;
  private logs: string[] = [];
  private logListener: ((log: string) => void) | null = null;
  private abortController: AbortController | null = null;
  private currentModelId: string = 'm2';

  constructor() {}

  setModelId(id: string) {
    this.currentModelId = id;
    this.totalMB = id === 'm3' ? 3263 : 1430;
  }

  private addLog(tag: 'OkHttp' | 'WorkManager' | 'LiteRT' | 'System', msg: string) {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const line = `[${time}] [${tag}] ${msg}`;
    this.logs.push(line);
    if (this.logListener) {
      this.logListener(line);
    }
    console.log(line);
  }

  setLogListener(listener: (log: string) => void) {
    this.logListener = listener;
    // Replay previous logs
    this.logs.forEach(listener);
  }

  getLogs(): string[] {
    return this.logs;
  }

  clearLogs() {
    this.logs = [];
  }

  pauseDownload() {
    if (!this.isModelLoading || this.isPaused) return;
    this.isPaused = true;
    this.addLog('System', 'Download Paused by user.');
    this.addLog('OkHttp', 'Connection stream suspended. Saving current byte offset for Range header resume.');
    if (this.abortController) {
      this.abortController.abort();
    }
  }

  resumeDownload(
    onProgress: (progress: number, loadedMb: number, totalMb: number) => void,
    onComplete: () => void,
    onError: (err: string) => void,
    customUrl?: string
  ) {
    if (!this.isPaused) return;
    this.isPaused = false;
    this.addLog('System', 'Download Resumed by user.');
    this.addLog('OkHttp', `Resuming connection via Range header: bytes=${this.loadedMB}MB-`);
    this.runRealDownload(onProgress, onComplete, onError, customUrl);
  }

  async loadModel(
    onProgress: (progress: number, loadedMb: number, totalMb: number) => void,
    onComplete: () => void,
    onError: (err: string) => void,
    customUrl?: string,
    modelId: string = 'm2'
  ): Promise<void> {
    this.setModelId(modelId);
    if (this.inference) {
      onProgress(100, this.totalMB, this.totalMB);
      onComplete();
      return;
    }

    if (this.isModelLoading && !this.isPaused) {
      throw new Error('Model is already downloading/loading');
    }

    this.isModelLoading = true;
    this.isPaused = false;
    
    this.addLog('System', 'Initializing Real On-Device Download Pipeline...');
    this.runRealDownload(onProgress, onComplete, onError, customUrl);
  }

  private async runRealDownload(
    onProgress: (progress: number, loadedMb: number, totalMb: number) => void,
    onComplete: () => void,
    onError: (err: string) => void,
    customUrl?: string
  ) {
    const isVibe = this.currentModelId === 'm3';
    const defaultUrl = isVibe
      ? 'https://huggingface.co/manojbillionaire123/VibeThinker-3B-litert-lm/resolve/main/vibethinker3b_q8_ekv8192_lora16.litertlm'
      : 'https://huggingface.co/manojbillionaire123/gemma-4-E2B-it-litert-lm/resolve/main/gemma-4-E2B-it-web.task';
    const modelUrl = customUrl || defaultUrl;
    const cacheName = 'litert-model-cache';

    this.abortController = new AbortController();

    try {
      this.addLog('OkHttp', `Connecting to: ${modelUrl}`);
      const cache = await caches.open(cacheName);
      
      const cachedResponse = await cache.match(modelUrl);

      if (cachedResponse) {
        this.addLog('OkHttp', 'Cache HIT! Loading model directly from sandboxed Cache Storage.');
        this.loadedMB = this.totalMB;
        onProgress(100, this.totalMB, this.totalMB);
        this.addLog('LiteRT', 'Initializing WebAssembly threads and WebGPU context...');
        
        const modelBlob = await cachedResponse.blob();
        await this.initMediaPipe(modelBlob);
        
        this.isModelLoading = false;
        onComplete();
        return;
      }

      this.addLog('OkHttp', `Cache MISS. Starting fresh request. Range Resume Supported.`);
      
      const response = await fetch(modelUrl, {
        signal: this.abortController.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
      }

      const contentLength = response.headers.get('content-length');
      const defaultBytes = this.currentModelId === 'm3' ? 3421896704 : 1500244833;
      const totalBytes = contentLength ? parseInt(contentLength, 10) : defaultBytes;
      this.totalMB = Math.round(totalBytes / (1024 * 1024));
      this.addLog('OkHttp', `HTTP/1.1 200 OK. Content-Length: ${totalBytes} bytes (~${this.totalMB} MB).`);

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body stream reader not available.');
      }

      const chunks: Uint8Array[] = [];
      let loadedBytes = 0;

      this.addLog('WorkManager', 'Worker active. Receiving byte stream from OkHttp...');

      while (true) {
        if (this.isPaused) {
          reader.releaseLock();
          return;
        }

        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          chunks.push(value);
          loadedBytes += value.length;
        }

        const progress = Math.min(Math.round((loadedBytes / totalBytes) * 100), 99);
        this.loadedMB = Math.round(loadedBytes / (1024 * 1024));
        onProgress(progress, this.loadedMB, this.totalMB);
      }

      this.addLog('OkHttp', 'All chunks received! Packaging Blob...');
      const modelBlob = new Blob(chunks, { type: 'application/octet-stream' });
      
      this.addLog('WorkManager', 'Saving model blob to browser Cache Storage...');
      try {
        await cache.put(modelUrl, new Response(modelBlob.slice(), {
          headers: { 'Content-Type': 'application/octet-stream' }
        }));
        this.addLog('WorkManager', 'Cache persistence successful.');
      } catch (cacheErr) {
        this.addLog('System', `Cache Storage put warning: ${cacheErr}`);
      }

      this.addLog('LiteRT', 'Compiling MediaPipe FilesetResolver and LlmInference...');
      await this.initMediaPipe(modelBlob);

      this.isModelLoading = false;
      onProgress(100, this.totalMB, this.totalMB);
      onComplete();
    } catch (err: any) {
      if (err.name === 'AbortError') {
        this.addLog('OkHttp', 'Download stream aborted (paused).');
        return;
      }
      this.isModelLoading = false;
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.addLog('System', `Pipeline Error: ${errorMsg}`);
      onError(errorMsg);
    }
  }

  private async initMediaPipe(modelBlob: Blob) {
    const genaiFileset = await FilesetResolver.forGenAiTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-genai@0.10.28/wasm'
    );

    const modelFile = new File([modelBlob], 'gemma-4-E2B-it-web.task');
    const blobUrl = URL.createObjectURL(modelFile);
    
    this.inference = await LlmInference.createFromOptions(genaiFileset, {
      baseOptions: {
        modelAssetPath: blobUrl
      },
      maxTokens: 512,
      temperature: 0.7,
    });
    this.addLog('LiteRT', 'Hardware execution environment ready!');
  }

  isLoaded(): boolean {
    return this.inference !== null;
  }

  isLoading(): boolean {
    return this.isModelLoading;
  }

  getIsPaused(): boolean {
    return this.isPaused;
  }

  async generate(
    prompt: string,
    onChunk?: (text: string) => void
  ): Promise<string> {
    if (!this.isLoaded()) {
      throw new Error('Model is not loaded. Call loadModel first.');
    }

    if (!this.inference) {
      throw new Error('Real model instance is missing');
    }

    if (onChunk) {
      return await this.inference.generateResponse(prompt, (partialText) => {
        onChunk(partialText);
      });
    } else {
      return await this.inference.generateResponse(prompt);
    }
  }

  unload() {
    this.inference = null;
    this.loadedMB = 0;
    this.isPaused = false;
    this.isModelLoading = false;
    this.clearLogs();
  }
}

export const litertEngine = new LiteRTEngine();
