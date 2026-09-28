import path from "node:path";
import Image from "@11ty/eleventy-img";

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ public: "/" });

  eleventyConfig.addAsyncShortcode(
    "siteImage",
    async (sourcePath, alt, className = "", loading = "lazy") => {
      const source = path.join("src", sourcePath);
      const sourceDirectory = path.dirname(sourcePath);
      const imageDirectory = sourceDirectory.replace(
        /^(?:assets|content)(?:[\\/]|$)/,
        ""
      );
      const outputDirectory = path.join("_site", "images", imageDirectory);
      const urlDirectory = path.posix.join(
        "/images",
        imageDirectory.split(path.sep).join("/")
      );

      return Image(source, {
        widths: [800],
        formats: ["webp"],
        outputDir: outputDirectory,
        urlPath: `${urlDirectory}/`,
        filenameFormat: (id, src, width, format) =>
          `${path.parse(src).name}.${format}`,
        fixOrientation: true,
        sharpWebpOptions: {
          quality: 80,
        },
        returnType: "html",
        htmlOptions: {
          imgAttributes: {
            class: className,
            alt,
            loading,
            decoding: "async",
          },
        },
      });
    }
  );

  eleventyConfig.addFilter("isoDate", (value) =>
    (value instanceof Date ? value : new Date(value)).toISOString().slice(0, 10)
  );

  eleventyConfig.addCollection("employees", (collectionApi) =>
    collectionApi
      .getFilteredByGlob("src/content/team/*.md")
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
