/**
 * 에러 핸들러 테스트
 */

import {
  formatErrorMessage,
  getErrorStatusCode,
  ValidationError,
  UnauthorizedError,
  NotFoundError,
  RateLimitError,
} from "../error-handler";

describe("Error Handler", () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  describe("formatErrorMessage", () => {
    it("should return error message in development", () => {
      process.env.NODE_ENV = "development";
      const error = new Error("Specific error message");

      expect(formatErrorMessage(error)).toBe("Specific error message");
    });

    it("should return default message in production", () => {
      process.env.NODE_ENV = "production";
      const error = new Error("Specific error message");

      expect(formatErrorMessage(error, "일반 오류")).toBe("일반 오류");
    });

    it("should handle non-Error objects", () => {
      const error = "String error";

      expect(formatErrorMessage(error, "기본 메시지")).toBe("기본 메시지");
    });
  });

  describe("getErrorStatusCode", () => {
    it("should return 400 for ValidationError", () => {
      const error = new ValidationError("Invalid input");
      expect(getErrorStatusCode(error)).toBe(400);
    });

    it("should return 401 for UnauthorizedError", () => {
      const error = new UnauthorizedError();
      expect(getErrorStatusCode(error)).toBe(401);
    });

    it("should return 404 for NotFoundError", () => {
      const error = new NotFoundError();
      expect(getErrorStatusCode(error)).toBe(404);
    });

    it("should return 429 for RateLimitError", () => {
      const error = new RateLimitError();
      expect(getErrorStatusCode(error)).toBe(429);
    });

    it("should return 500 for generic errors", () => {
      const error = new Error("Generic error");
      expect(getErrorStatusCode(error)).toBe(500);
    });

    it("should return 500 for non-Error objects", () => {
      expect(getErrorStatusCode("string error")).toBe(500);
    });
  });

  describe("Custom Error Classes", () => {
    it("should create ValidationError with message", () => {
      const error = new ValidationError("Invalid email");
      expect(error.name).toBe("ValidationError");
      expect(error.message).toBe("Invalid email");
    });

    it("should create UnauthorizedError with default message", () => {
      const error = new UnauthorizedError();
      expect(error.name).toBe("UnauthorizedError");
      expect(error.message).toBe("인증이 필요합니다.");
    });

    it("should create UnauthorizedError with custom message", () => {
      const error = new UnauthorizedError("Custom auth message");
      expect(error.message).toBe("Custom auth message");
    });

    it("should create NotFoundError with default message", () => {
      const error = new NotFoundError();
      expect(error.message).toBe("리소스를 찾을 수 없습니다.");
    });

    it("should create RateLimitError with default message", () => {
      const error = new RateLimitError();
      expect(error.message).toBe("요청 한도를 초과했습니다.");
    });
  });
});
