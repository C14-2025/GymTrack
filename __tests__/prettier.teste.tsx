const prettierConfig = require("../prettier.config.js");

describe("Prettier config", () => {
  it("deve exportar um objeto válido", () => {
    expect(typeof prettierConfig).toBe("object");
  });

  it("deve conter regras principais", () => {
    expect(prettierConfig).toHaveProperty("semi", true);
    expect(prettierConfig).toHaveProperty("singleQuote", true);
    expect(prettierConfig).toHaveProperty("printWidth", 80);
    expect(prettierConfig).toHaveProperty("tabWidth", 2);
  });
});