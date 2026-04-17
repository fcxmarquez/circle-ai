module.exports = {
  // this will check Typescript files (excluding storybook and test files)
  "**/*.(ts|tsx)": (filenames) => {
    const filteredFiles = filenames.filter(
      (file) => !file.includes("stories/") && !file.includes(".storybook/")
    );
    return filteredFiles.length > 0 ? "npx tsc --noEmit" : [];
  },

  // This will lint and format TypeScript and JavaScript files (excluding storybook)
  "**/*.(ts|tsx|js)": (filenames) => {
    const filteredFiles = filenames.filter(
      (file) => !file.includes("stories/") && !file.includes(".storybook/")
    );
    return filteredFiles.length > 0
      ? [`npx biome check --write ${filteredFiles.join(" ")}`]
      : [];
  },

  // this will Format JSON (biome does not support markdown)
  "**/*.json": (filenames) =>
    `npx biome format --write ${filenames.join(" ")}`,
};
