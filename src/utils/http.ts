class ApiError extends Error {
  data: null
  success: boolean
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message)
    this.success = false
    this.data = null
    Error.captureStackTrace(this, this.constructor)
  }
}

class ApiResponse<T> {
  success: boolean
  constructor(
    public statusCode: number,
    public data: T,
    public message: string
  ) {
    this.success = statusCode < 400
  }
}

export { ApiError, ApiResponse }
