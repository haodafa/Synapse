import { describe, expect, it } from "vitest";
import { resolveCliInstallSourcePath } from "./path";

describe("cli-install-path", () => {
  it("uses the bundled shim for packaged macOS installs", () => {
    expect(
      resolveCliInstallSourcePath({
        platform: "darwin",
        isPackaged: true,
        executablePath: "/Applications/Synapse.app/Contents/MacOS/Synapse",
        shimPath: "/Applications/Synapse.app/Contents/Resources/bin/synapse",
      }),
    ).toBe("/Applications/Synapse.app/Contents/Resources/bin/synapse");
  });

  it("prefers the original AppImage path on linux", () => {
    expect(
      resolveCliInstallSourcePath({
        platform: "linux",
        isPackaged: true,
        executablePath: "/tmp/.mount_synapse123/synapse",
        shimPath: "/tmp/.mount_synapse123/resources/bin/synapse",
        appImagePath: "/home/user/Applications/Synapse.AppImage",
      }),
    ).toBe("/home/user/Applications/Synapse.AppImage");
  });

  it("falls back to the shim on windows and in development", () => {
    expect(
      resolveCliInstallSourcePath({
        platform: "win32",
        isPackaged: true,
        executablePath: "C:\\Users\\user\\AppData\\Local\\Programs\\Synapse\\Synapse.exe",
        shimPath: "C:\\Users\\user\\AppData\\Local\\Programs\\Synapse\\resources\\bin\\synapse.cmd",
      }),
    ).toBe("C:\\Users\\user\\AppData\\Local\\Programs\\Synapse\\resources\\bin\\synapse.cmd");

    expect(
      resolveCliInstallSourcePath({
        platform: "linux",
        isPackaged: false,
        executablePath: "/opt/Synapse/synapse",
        shimPath: "/opt/Synapse/resources/bin/synapse",
      }),
    ).toBe("/opt/Synapse/resources/bin/synapse");
  });
});
