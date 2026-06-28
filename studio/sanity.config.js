import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './schemas';

// Define singleton actions and types (only one document allowed)
const singletonActions = new Set(["publish", "discardChanges", "restore"]);
const singletonTypes = new Set(["homepage", "footer"]);

export default defineConfig({
  name: 'default',
  title: 'Alex Kiessling Studio',

  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'vlyuixi5', // Fallback or loaded via environment variables
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',

  plugins: [
    structureTool({
      structure: (S) =>
          S.list()
              .title('Alex Kiessling CMS')
              .items([
                S.listItem()
                    .title('Startseite & Hero (Homepage)')
                    .id('homepage')
                    .child(S.document().schemaType('homepage').documentId('homepage')),
                S.listItem()
                    .title('Galerie Kategorien (Zyklen)')
                    .id('category')
                    .child(S.documentTypeList('category').title('Alle Kategorien')),
                S.listItem()
                    .title('Vita-Highlights (Top Slider)')
                    .id('vitaHighlight')
                    .child(S.documentTypeList('vitaHighlight').title('Timeline Highlights')),
                S.listItem()
                    .title('Vita-Einträge (Gesamte Liste)')
                    .id('vitaEntry')
                    .child(S.documentTypeList('vitaEntry').title('Alle Vita-Jahre')),
                S.listItem()
                    .title('Statements & Essays')
                    .id('statement')
                    .child(S.documentTypeList('statement').title('Alle Statements')),
                S.listItem()
                    .title('Video-Dokumentationen')
                    .id('video')
                    .child(S.documentTypeList('video').title('Videos')),
                S.listItem()
                    .title('Footer & Kontakt')
                    .id('footer')
                    .child(S.document().schemaType('footer').documentId('footer')),
              ]),
    }),
  ],

  schema: {
    types: schemaTypes,
    templates: (templates) =>
        templates.filter((template) => !singletonTypes.has(template.schemaId)),
  },

  document: {
    actions: (input, context) =>
        singletonTypes.has(context.schemaType)
            ? input.filter(({ action }) => action && singletonActions.has(action))
            : input,
  },
});
