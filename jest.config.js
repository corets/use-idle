module.exports = {
  roots: ["src"],
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["./jest.react.js"],
}
