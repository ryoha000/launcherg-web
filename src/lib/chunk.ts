export type ChunkMetadata = {
  path: string;
  key: number;
  totalChunkLength: number;
  mimeType: string;
};

export const useChunk = () => {
  const constructingImages = new Map<
    number,
    {
      metadata: ChunkMetadata;
      chunks: Uint8Array[];
      remainIndexes: number[];
    }
  >();
  // metadata がまだ来ていない場合は pendingChunks に入れる
  const pendingChunks = new Map<
    number,
    { chunkId: number; index: number; entireChunk: ArrayBuffer }
  >();
  const onImageMetadata = (metadata: ChunkMetadata) => {
    const { key } = metadata;
    const current = constructingImages.get(key);
    if (current) {
      console.warn("metadata が重複してきた", metadata);
      return;
    }
    const remainIndexes = Array.from(
      { length: metadata.totalChunkLength },
      (_, i) => i
    );
    constructingImages.set(key, {
      metadata,
      chunks: Array.from(
        { length: metadata.totalChunkLength },
        () => new Uint8Array()
      ),
      remainIndexes,
    });
    const pending = pendingChunks.get(key);
    if (pending) {
      const res = onArrayBufferData(pending.entireChunk);
      pendingChunks.delete(key);
      return res;
    }
  };
  const onArrayBufferData = (data: ArrayBuffer) => {
    const uint8Array = new Uint8Array(data);
    const [chunkId, index] = uint8Array;
    const current = constructingImages.get(chunkId);
    if (!current) {
      pendingChunks.set(chunkId, { chunkId, index, entireChunk: data });
      return;
    }
    current.chunks[index] = uint8Array.slice(2);
    current.remainIndexes = current.remainIndexes.filter((i) => i !== index);

    return createDataUrlIfCompleted(current);
  };
  const createDataUrlIfCompleted = (
    current: NonNullable<ReturnType<(typeof constructingImages)["get"]>>
  ) => {
    if (current.remainIndexes.length > 0) return;
    const metadata = current.metadata;
    const blob = new Blob(current.chunks, { type: metadata.mimeType });
    const dataUrl = URL.createObjectURL(blob);
    constructingImages.delete(current.metadata.key);
    return { path: current.metadata.path, dataUrl };
  };

  return { onArrayBufferData, onImageMetadata };
};
