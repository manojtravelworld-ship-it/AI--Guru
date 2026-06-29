export const litertEngine = {
  initialize: () => console.log('Litert engine initialized'),
  isLoaded: () => true,
  setLogListener: (callback: (log: string) => void) => console.log('Log listener set'),
  loadModel: async (
    progressCallback: (progress: number, loaded: number, total: number) => void,
    successCallback: () => void,
    errorCallback: (error: string) => void,
    modelUrl?: string,
    modelId?: string
  ) => console.log('Model loaded'),
  pauseDownload: () => console.log('Download paused'),
  resumeDownload: (
    progressCallback: (progress: number, loaded: number, total: number) => void,
    successCallback: () => void,
    errorCallback: (error: string) => void,
    modelUrl?: string
  ) => console.log('Download resumed'),
  unload: () => console.log('Engine unloaded'),
  generate: async (prompt: string) => 'Generated response',
};
