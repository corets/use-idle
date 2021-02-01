module.exports = {
  roots: ["src"],
  preset: "ts-jest",
  moduleNameMapper: { "^lodash-es$": "lodash" },
  testEnvironment: "jsdom",
  setupFiles: ["./jest.react.js"],
}
