export class ResponseTemplate {
  private readonly _timeStamp: string;
  private readonly _statusCode: number;
  private readonly _status: string;
  private readonly _message: string | undefined;
  private readonly _data?: unknown;

  constructor(statusCode: number, status: string, message: string | undefined, data?: unknown) {
    this._timeStamp = new Date().toISOString();
    this._statusCode = statusCode;
    this._status = status;
    this._message = message;
    this._data = data;
  }

  get statusCode(): number {
    return this._statusCode;
  }

  get status(): string {
    return this._status;
  }

  get message(): string | undefined {
    return this._message;
  }

  get data(): unknown {
    return this._data;
  }

  get timeStamp(): string {
    return this._timeStamp;
  }
}
