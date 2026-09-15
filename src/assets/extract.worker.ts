import { extractAssets, type ExtractionInput } from './extractAssets';

self.onmessage = ({ data }: MessageEvent<ExtractionInput>) => {
  void extractAssets(data, {
    postMessage: (message, transfer = []) => self.postMessage(message, { transfer }),
  });
};
