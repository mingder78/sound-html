class PCMProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.chunkSize = 1024; // default

    this.buffer = new Float32Array(this.chunkSize);
    this.bufferIndex = 0;

    this.port.onmessage = (e) => {
      if (e.data.chunkSize) {
        this.chunkSize = e.data.chunkSize;
        this.buffer = new Float32Array(this.chunkSize);
        this.bufferIndex = 0;
      }
    };
  }

  process(inputs) {
    const input = inputs[0];
    if (!input[0]) return true;

    const samples = input[0]; // Float32Array (128 frames per block by default)

    for (let i = 0; i < samples.length; i++) {
      this.buffer[this.bufferIndex++] = samples[i];

      // When filled enough → send a chunk
      if (this.bufferIndex >= this.chunkSize) {
        this.port.postMessage(this.buffer.slice(0));
        this.bufferIndex = 0;
      }
    }

    // Debug: dump buffer length
    this.port.postMessage({ debug: "process-called", samples: input[0]?.length });
    return true; // keep processor alive
  }
}

registerProcessor("pcm-processor", PCMProcessor);

