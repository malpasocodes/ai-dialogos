import innovationCover from '../../images/shaping-future-innovation.jpeg';
import strategyCover from '../../images/rethinking-business-strategy.jpeg';

// Schema.org data for the AI Essentials for Leaders volumes, shared by the
// homepage, the volume pages and /book. Dates, ISBNs and DOIs come from the
// publisher's Crossref records (api.crossref.org/works/<doi>).

const SITE_URL = import.meta.env.SITE_URL ?? 'https://ai-dialogos.com';

const publisher = {
  '@type': 'Organization',
  name: 'De Gruyter Brill',
  url: 'https://www.degruyterbrill.com',
};

const person = (name: string) => ({ '@type': 'Person', name });

export const bookSeries = {
  '@type': 'BookSeries',
  name: 'AI Essentials for Leaders',
  url: `${SITE_URL}/series`,
  publisher,
  editor: [person('Alfred Essa'), person('Teresa Martín-Retortillo')],
};

const book = (b: {
  name: string;
  author: string;
  description: string;
  datePublished: string;
  isbn: string;
  doi: string;
  path: string;
  cover: ImageMetadata;
}) => ({
  '@type': 'Book',
  name: b.name,
  author: person(b.author),
  description: b.description,
  publisher,
  datePublished: b.datePublished,
  isbn: b.isbn,
  inLanguage: 'en',
  url: `${SITE_URL}${b.path}`,
  sameAs: `https://doi.org/${b.doi}`,
  image: new URL(b.cover.src, SITE_URL).toString(),
  isPartOf: { '@type': 'BookSeries', name: bookSeries.name, url: bookSeries.url },
});

export const innovationBook = book({
  name: 'Artificial Intelligence: Shaping the Future of Innovation',
  author: 'Alfred Essa',
  description:
    'A concise, non-technical introduction to artificial intelligence as a general purpose technology driving innovation across business, government, and society.',
  datePublished: '2025-10-03',
  isbn: '9783111582382',
  doi: '10.1515/9783111583549',
  path: '/volumes/shaping-the-future-of-innovation',
  cover: innovationCover,
});

export const strategyBook = book({
  name: 'Artificial Intelligence: Rethinking Business Strategy',
  author: 'Teresa Martín-Retortillo',
  description:
    'How business leaders can use foresight techniques to read the signposts of change and build strategy for the era of AI.',
  datePublished: '2025-11-14',
  isbn: '9783111582405',
  doi: '10.1515/9783111583495',
  path: '/volumes/rethinking-business-strategy',
  cover: strategyCover,
});
