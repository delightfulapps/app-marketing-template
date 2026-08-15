// Template data file for guides.webc — the /guides/ index page.
//
// Not to be confused with src/guides/guides.11tydata.js, which is the directory
// data file for the guides themselves. The two never see each other: Eleventy
// looks up template data beside the template and directory data inside the
// directory, so nothing here reaches an individual guide.
//
// This lives here rather than in the page's front matter for the same reason
// changelog.11tydata.js does: a computed value written as "{{ … }}" is rendered
// by the page's own template engine, and WebC has no {{ }} syntax, so it fails
// silently. Computing in JS is both clearer and engine-independent.
export default {
  eleventyComputed: {
    // The index is as fresh as the most recently revised guide, which drives
    // <lastmod> and og:updated_time without anyone bumping a date by hand.
    // Undefined when no guide carries a date at all, which correctly omits
    // both rather than claiming the build date as a revision.
    updated: (data) => {
      const times = (data.collections?.guides ?? [])
        .map((guide) => new Date(guide.data.updated ?? guide.data.date).valueOf())
        .filter((time) => !Number.isNaN(time));
      return times.length
        ? new Date(Math.max(...times)).toISOString().slice(0, 10)
        : undefined;
    },
  },
};
