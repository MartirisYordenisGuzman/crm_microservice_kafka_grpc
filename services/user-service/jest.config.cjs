module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/tsconfig.test.json",
      },
    ],
  },
  roots: ["<rootDir>/src"],
  testMatch: ["**/*.spec.ts"],
  setupFiles: ["reflect-metadata"],
  clearMocks: true,
  moduleFileExtensions: ["ts", "js", "json"],
};
