// Template data file for changelog.webc.
//
// This lives here rather than in the page's front matter because a computed
// value written as "{{ … }}" is rendered by the page's own template engine —
// and WebC has no {{ }} syntax, so it fails silently. Computing in JS is both
// clearer and engine-independent.
export default {
  eleventyComputed: {
    // The page is as fresh as its newest release, which drives <lastmod> and
    // og:updated_time without anyone remembering to bump a date by hand.
    updated: (data) => data.collections?.releases?.[0]?.data?.date,
  },
};
