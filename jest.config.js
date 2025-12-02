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
    'default', 
    ['jest-junit', { 
      outputDirectory: 'test-reports', 
      outputName: 'junit.xml' 
    }]
  ],
}

module.exports = createJestConfig(customJestConfig)
