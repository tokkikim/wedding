/**
 * Rate Limit 테스트
 */

import { checkRateLimit, getClientIp } from "../rate-limit";
import { RateLimitError } from "../error-handler";

describe("Rate Limiter", () => {
  describe("checkRateLimit", () => {
    it("should allow requests within limit", async () => {
      const userId = "test-user-1";

      // 첫 번째 요청은 허용되어야 함
      await expect(checkRateLimit(userId, "general")).resolves.not.toThrow();
    });

    it("should throw RateLimitError when limit exceeded", async () => {
      const userId = "test-user-2";

      // imageGeneration은 분당 5회 제한
      for (let i = 0; i < 5; i++) {
        await expect(
          checkRateLimit(userId, "imageGeneration")
        ).resolves.not.toThrow();
      }

      // 6번째 요청은 거부되어야 함
      await expect(checkRateLimit(userId, "imageGeneration")).rejects.toThrow(
        RateLimitError
      );
    }, 10000); // 10초 타임아웃

    it("should handle different users separately", async () => {
      const user1 = "test-user-3";
      const user2 = "test-user-4";

      // 두 사용자 모두 허용되어야 함
      await expect(checkRateLimit(user1, "general")).resolves.not.toThrow();
      await expect(checkRateLimit(user2, "general")).resolves.not.toThrow();
    });
  });

  describe("getClientIp", () => {
    it("should extract IP from x-forwarded-for header", () => {
      const request = new Request("http://localhost", {
        headers: {
          "x-forwarded-for": "192.168.1.1, 10.0.0.1",
        },
      });

      expect(getClientIp(request)).toBe("192.168.1.1");
    });

    it("should extract IP from x-real-ip header", () => {
      const request = new Request("http://localhost", {
        headers: {
          "x-real-ip": "192.168.1.2",
        },
      });

      expect(getClientIp(request)).toBe("192.168.1.2");
    });

    it("should return unknown if no IP headers present", () => {
      const request = new Request("http://localhost");

      expect(getClientIp(request)).toBe("unknown");
    });

    it("should prefer x-forwarded-for over x-real-ip", () => {
      const request = new Request("http://localhost", {
        headers: {
          "x-forwarded-for": "192.168.1.1",
          "x-real-ip": "192.168.1.2",
        },
      });

      expect(getClientIp(request)).toBe("192.168.1.1");
    });
  });
});
