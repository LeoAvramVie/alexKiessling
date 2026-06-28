export default {
  name: 'artwork',
  title: 'Werke (Artworks)',
  type: 'document',
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
      options: {
        hotspot: true
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'inSituImages',
      title: 'Raumansichten / Detailbilder (In-Situ)',
      type: 'array',
      of: [{ type: 'image' }],
      description: 'Fotos des Werkes aufgehängt in einer Galerie oder Detailaufnahmen der Pinselstriche.'
    },
    {
      name: 'category',
      title: 'Kategorie / Zyklus',
      type: 'reference',
      to: [{ type: 'category' }],
      validation: Rule => Rule.required()
    },
    {
      name: 'status',
      title: 'Verfügbarkeit',
      type: 'string',
      options: {
        list: [
          { title: 'Verfügbar', value: 'Available' },
          { title: 'Verkauft', value: 'Sold' },
          { title: 'Privatsammlung', value: 'Private Collection' }
        ]
      },
      initialValue: 'Available'
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
      subtitle: 'category',
      media: 'image'
    }
  }
}
