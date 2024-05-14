export class HttpErrorResponse {
  constructor(
    public readonly status: number,
    public readonly code?: string,
    public readonly message?: string,
    public readonly requestId?: string,
    public readonly data?: any,
  ) {}

  toJSON(): object {
    return {
      status: this.status,
      code: this.code,
      message: this.message,
      request_id: this.requestId,
      data: this.data,
    };
  }
}
