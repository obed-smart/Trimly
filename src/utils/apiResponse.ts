export class ApiResponse {
  static success<T>(data?: T) {
    return { success: true, data: data ?? null };
  }

  static error(message: any | string) {
    return {
      success: false,
      message,
    };
  }
}
