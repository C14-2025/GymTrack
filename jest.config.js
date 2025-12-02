const nextJest = require("next/jest")

const createJestConfig = nextJest({
  dir: "./", 
})

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jsdom",
  testMatch: ["**/__tests__/**/*.test.ts", "**/__tests__/**/*.test.tsx"],
  collectCoverageFrom: [
    "lib/**/*.{ts,tsx}",
    "app/api/**/*.{ts,tsx}",
    "!**/*.d.ts",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  reporters: [
    ["jest-html-reporter", {
      pageTitle: "Relatório de Testes", 
      outputPath: "test-reports/test-report.html", 
      includeConsoleLog: true,
    }]
  ],
}

module.exports = createJestConfig(customJestConfig)
