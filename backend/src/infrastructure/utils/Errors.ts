export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class ServiceError extends Error {
  constructor(
    message: string,
    public service: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = "ServiceError";
  }
}

export class ExternalAPIError extends Error {
  constructor(
    message: string,
    public apiName: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = "ExternalAPIError";
  }
}

export class FileStorageError extends Error {
  constructor(message: string, public filePath?: string) {
    super(message);
    this.name = "FileStorageError";
  }
}

export class RenderingError extends Error {
  constructor(message: string, public scriptId?: string) {
    super(message);
    this.name = "RenderingError";
  }
}
