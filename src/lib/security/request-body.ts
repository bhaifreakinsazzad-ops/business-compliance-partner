export class RequestBodyError extends Error {
  constructor(
    public readonly code: "BODY_TOO_LARGE" | "INVALID_JSON",
    message: string,
  ) {
    super(message);
    this.name = "RequestBodyError";
  }
}

/** Reads JSON with an explicit byte ceiling before validation runs. */
export async function readJsonBody(
  request: Request,
  maxBytes = 64 * 1024,
): Promise<unknown> {
  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    throw new RequestBodyError("BODY_TOO_LARGE", "Request body is too large");
  }
  if (!request.body) throw new RequestBodyError("INVALID_JSON", "Missing body");

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      throw new RequestBodyError("BODY_TOO_LARGE", "Request body is too large");
    }
    chunks.push(value);
  }

  const combined = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return JSON.parse(new TextDecoder().decode(combined)) as unknown;
  } catch {
    throw new RequestBodyError("INVALID_JSON", "Invalid JSON body");
  }
}
