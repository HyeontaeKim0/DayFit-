import { describe, expect, it } from "vitest";

// 테스트 환경이 동작하는지 확인하는 용도. 실제 테스트를 쓰기 시작하면 지워도 돼요.
describe("테스트 환경", () => {
  it("Vitest가 실행된다", () => {
    expect(1 + 1).toBe(2);
  });
});
