export default {
  name: 'vitaHighlight',
  title: 'Vita Highlight (Top-Slider)',
  type: 'document',
  fields: [
    {
      name: 'year',
      title: 'Jahr',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'title',
      title: 'Titel',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'descriptionDe',
      title: 'Details (DE)',
      type: 'text',
      validation: Rule => Rule.required()
    },
    {
      name: 'descriptionEn',
      title: 'Details (EN)',
      type: 'text',
      validation: Rule => Rule.required()
    },
    {
      name: 'image',
      title: 'Ausstellungsbild',
      type: 'image',
      options: { hotspot: true },
      validation: Rule => Rule.required()
    },
    {
      name: 'order',
      title: 'Sortiernummer',
      type: 'number',
      initialValue: 0
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
