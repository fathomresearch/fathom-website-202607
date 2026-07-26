export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ public: "/" });

  eleventyConfig.addCollection("employees", (collectionApi) =>
    collectionApi
      .getFilteredByGlob("src/employees/*.md")
      .sort((a, b) => a.data.order - b.data.order)
  );

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
}
