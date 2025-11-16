/**
 * 환경 변수 검증 테스트
 */

import { validateEnv, getEnv, getBooleanEnv } from "../env";

describe("Environment Validation", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // 환경 변수 초기화
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // 원래 환경 복원
    process.env = originalEnv;
  });

  describe("validateEnv", () => {
    it("should validate required environment variables in production", () => {
      process.env.NODE_ENV = "production";
      process.env.DATABASE_URL = "postgresql://localhost:5432/test";
      process.env.NEXTAUTH_SECRET = "a".repeat(32);
      process.env.NEXTAUTH_URL = "http://localhost:3000";

      expect(() => validateEnv()).not.toThrow();
    });

    it("should throw error for invalid DATABASE_URL format", () => {
      process.env.NODE_ENV = "production";
      process.env.DATABASE_URL = "invalid-url";
      process.env.NEXTAUTH_SECRET = "a".repeat(32);
      process.env.NEXTAUTH_URL = "http://localhost:3000";

      expect(() => validateEnv()).toThrow();
    });

    it("should throw error for short NEXTAUTH_SECRET", () => {
      process.env.NODE_ENV = "production";
      process.env.DATABASE_URL = "postgresql://localhost:5432/test";
      process.env.NEXTAUTH_SECRET = "short"; // < 32 characters
      process.env.NEXTAUTH_URL = "http://localhost:3000";

      expect(() => validateEnv()).toThrow();
    });

    it("should reject TEST_SESSION_USER_ID in production", () => {
      process.env.NODE_ENV = "production";
      process.env.DATABASE_URL = "postgresql://localhost:5432/test";
      process.env.NEXTAUTH_SECRET = "a".repeat(32);
      process.env.NEXTAUTH_URL = "http://localhost:3000";
      process.env.TEST_SESSION_USER_ID = "test-user";

      expect(() => validateEnv()).toThrow(
        "TEST_SESSION_USER_ID is not allowed in production environment"
      );
    });

    it("should allow missing optional variables in development", () => {
      process.env.NODE_ENV = "development";
      process.env.DATABASE_URL = "postgresql://localhost:5432/test";
      process.env.NEXTAUTH_SECRET = "a".repeat(32);
      process.env.NEXTAUTH_URL = "http://localhost:3000";

      // Optional variables not set
      delete process.env.GOOGLE_CLIENT_ID;
      delete process.env.GEMINI_API_KEY;

      expect(() => validateEnv()).not.toThrow();
    });
  });

  describe("getEnv", () => {
    it("should return parsed environment variables", () => {
      process.env.NODE_ENV = "development";
      process.env.DATABASE_URL = "postgresql://localhost:5432/test";
      process.env.NEXTAUTH_SECRET = "a".repeat(32);
      process.env.NEXTAUTH_URL = "http://localhost:3000";

      const env = getEnv();

      expect(env.NODE_ENV).toBe("development");
      expect(env.DATABASE_URL).toBe("postgresql://localhost:5432/test");
      expect(env.NEXTAUTH_SECRET).toBe("a".repeat(32));
    });
  });

  describe("getBooleanEnv", () => {
    it('should return true for "true"', () => {
      process.env.DEBUG = "true";
      expect(getBooleanEnv("DEBUG")).toBe(true);
    });

    it('should return true for "1"', () => {
      process.env.DEBUG = "1";
      expect(getBooleanEnv("DEBUG")).toBe(true);
    });

    it('should return false for "false"', () => {
      process.env.DEBUG = "false";
      expect(getBooleanEnv("DEBUG")).toBe(false);
    });

    it("should return default value for undefined", () => {
      delete process.env.DEBUG;
      expect(getBooleanEnv("DEBUG", true)).toBe(true);
      expect(getBooleanEnv("DEBUG", false)).toBe(false);
    });
  });
});
