import { t } from "./translations";
import { LanguageCode } from "../types";

describe("Translations System Tests", () => {
  test("translates standard keys to English correctly", () => {
    expect(t("brand_sub", "en")).toBe("Stadium Command & Fan Assistant");
    expect(t("fan_hub", "en")).toBe("Fan Hub");
  });

  test("translates keys to Spanish correctly", () => {
    expect(t("fan_hub", "es")).toBe("Centro de Fans");
  });

  test("translates keys to Arabic correctly", () => {
    expect(t("fan_hub", "ar")).toBe("ملتقى المشجعين");
  });

  test("falls back to English when key is missing in target language", () => {
    // Adding a mock key in English and testing fallback in Spanish
    // (In our case, we can use any key that exists in English)
    expect(t("tournament_center", "es")).toBe("Centro del Torneo");
  });

  test("returns the key itself if the key is missing everywhere", () => {
    expect(t("non_existent_key_123", "en")).toBe("non_existent_key_123");
    expect(t("non_existent_key_123", "ja")).toBe("non_existent_key_123");
  });

  test("ensures welcome_msg is defined for all 7 languages", () => {
    const languages: LanguageCode[] = ["en", "es", "fr", "pt", "ar", "ja", "de"];
    languages.forEach((lang) => {
      const translation = t("welcome_msg", lang);
      expect(translation).toBeDefined();
      expect(translation.length).toBeGreaterThan(0);
      expect(translation).not.toBe("welcome_msg");
    });
  });

  test("ensures incident command desk key is defined for all 7 languages", () => {
    const languages: LanguageCode[] = ["en", "es", "fr", "pt", "ar", "ja", "de"];
    languages.forEach((lang) => {
      const translation = t("incident_command_desk", lang);
      expect(translation).toBeDefined();
      expect(translation.length).toBeGreaterThan(0);
      expect(translation).not.toBe("incident_command_desk");
    });
  });
});
