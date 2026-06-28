export default {
  name: 'category',
  title: 'Galerie Kategorien (Zyklen)',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Titel (Anzeigename)',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'slug',
      title: 'Slug (Technischer Filter-Name)',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'order',
      title: 'Reihenfolge der Tabs',
      type: 'number',
      initialValue: 0,
      description: 'Bestimmt, an welcher Position dieser Tab in der Galerie steht (kleine Zahlen zuerst).'
    },
    {
      name: 'artworks',
      title: 'Werke in dieser Kategorie',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'artworkInline',
          title: 'Werk',
          fields: [
            {
              name: 'title',
              title: 'Titel',
              type: 'string',
              validation: Rule => Rule.required()
            },
            {
              name: 'year',
              title: 'Jahr',
              type: 'string',
              validation: Rule => Rule.required()
            },
            {
              name: 'dimensions',
              title: 'Abmessungen',
              type: 'string',
              description: 'Z.B. 140x140cm'
            },
            {
              name: 'techniqueDe',
              title: 'Technik (DE)',
              type: 'string',
              description: 'Z.B. Acryl auf Leinwand'
            },
            {
              name: 'techniqueEn',
              title: 'Technik (EN)',
              type: 'string',
              description: 'Z.B. Acrylic on Canvas'
            },
            {
              name: 'image',
              title: 'Hauptbild',
              type: 'image',
              options: { hotspot: true },
              validation: Rule => Rule.required()
            },
            {
              name: 'inSituImages',
              title: 'Raumansichten / Detailbilder (In-Situ)',
              type: 'array',
              of: [{ type: 'image' }],
              description: 'Fotos des Werkes aufgehängt in einer Galerie oder Detailaufnahmen.'
            },
            {
              name: 'descriptionDe',
              title: 'Beschreibung (DE)',
              type: 'text'
            },
            {
              name: 'descriptionEn',
              title: 'Beschreibung (EN)',
              type: 'text'
            }
          ],
          preview: {
            select: {
              title: 'title',
              subtitle: 'year',
              media: 'image'
            }
          }
        }
      ],
      description: 'Füge hier alle Werke für diese Kategorie hinzu und ordne sie per Drag & Drop.'
    }
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'slug.current'
    }
  }
}
