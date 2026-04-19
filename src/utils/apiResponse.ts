export class ApiResponse {
  static success<T>(data?: T, message: string = 'success') {
    return { success: true, message, data: data ?? null };
  }

  static error(message: any | string, statusCode: number) {
    return {
      success: false,
      message,
      statusCode,
    };
  }
}
