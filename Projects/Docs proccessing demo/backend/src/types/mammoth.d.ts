declare module 'mammoth' {
  interface ExtractResult {
    value: string;
    messages: unknown[];
  }

  interface ExtractInput {
    path?: string;
    buffer?: Buffer;
    arrayBuffer?: ArrayBuffer;
  }

  export function extractRawText(input: ExtractInput): Promise<ExtractResult>;

  const mammoth: { extractRawText: typeof extractRawText };
  export default mammoth;
}
