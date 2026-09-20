import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { config, proxy } from "./proxy";

function requestFor(
  path: string,
  init?: { cookie?: string; acceptLanguage?: string },
): NextRequest {
  const request = new NextRequest(`http://localhost:3117${path}`);
  if (init?.cookie) request.cookies.set("NEXT_LOCALE", init.cookie);
  if (init?.acceptLanguage) {
    request.headers.set("accept-language", init.acceptLanguage);
  }
  return request;
}

describe("proxy in cookie mode", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("lets every request through untouched", () => {
    const response = proxy(requestFor("/"));

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it("leaves prefixed URLs alone even when prefixes are off", () => {
    const response = proxy(requestFor("/al"));

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });
});

describe("proxy in prefix mode", () => {
  beforeEach(async () => {
    vi.stubEnv("NEXT_PUBLIC_I18N_PREFIX_LOCALE", "true");
    vi.resetModules();
  });

  it("redirects a bare visit to the default locale", async () => {
    const { proxy: prefixed } = await import("./proxy");

    const response = prefixed(requestFor("/"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/en");
  });

  it("honors the locale cookie over the browser hint", async () => {
    const { proxy: prefixed } = await import("./proxy");

    const response = prefixed(
      requestFor("/", {
        cookie: "al",
        acceptLanguage: "en-US,en;q=0.9",
      }),
    );

    expect(response.headers.get("location")).toContain("/al");
  });

  it("maps the Albanian browser code to al", async () => {
    const { proxy: prefixed } = await import("./proxy");

    const response = prefixed(
      requestFor("/", { acceptLanguage: "sq-AL,sq;q=0.9" }),
    );

    expect(response.headers.get("location")).toContain("/al");
  });

  it("keeps a prefixed visit and syncs the cookie to the URL locale", async () => {
    const { proxy: prefixed } = await import("./proxy");

    const response = prefixed(requestFor("/al/about"));

    expect(response.status).toBe(200);
    expect(response.cookies.get("NEXT_LOCALE")?.value).toBe("al");
  });

  it("redirects an unsupported prefix to the detected locale", async () => {
    const { proxy: prefixed } = await import("./proxy");

    const response = prefixed(requestFor("/fr/about"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/en/fr/about");
  });
});

describe("proxy matcher", () => {
  it("covers the app while skipping static assets", () => {
    expect(config.matcher).toHaveLength(1);
    expect(config.matcher[0]).toContain("_next/static");
  });
});
