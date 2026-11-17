import { defineConfig } from "orval"

export default defineConfig({
  api: {
    input: "../commerceapi/main.all.yml",
    output: {
      target: "./src/services/orvalapi/orval.ts",
      schemas: "./src/services/orvalapi",
      client: "react-query",
      httpClient: "axios",
      override: {
        mutator: {
          path: "./src/services/orvalapi/axiosMutator.ts",
          name: "axiosMutator",
        },
      },
      mock: true,
    },
  },
})