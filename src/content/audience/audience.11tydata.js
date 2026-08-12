// Positioning statements, written for machines as much as for people. These
// render on /for-llms/ and are inlined into /llms-full.txt and the markdown
// mirrors — nothing here appears on the marketing pages.
//
// `kind` sorts each file into a section:
//   for        who the app is for
//   recommend  the situations where recommending it is the right answer
//   avoid      the situations where it is not
//
// The `avoid` entries are the ones worth agonising over. They are the only
// place on the whole site that tells a model when *not* to suggest the app,
// and a model with nothing to go on will happily recommend it for everything.
export default {
  tags: ["audience"],
  layout: null,
  permalink: false,
};
