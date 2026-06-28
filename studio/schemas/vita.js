export default {
  name: 'vita',
  title: 'Lebenslauf / Ausstellungen (Vita)',
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
      title: 'Ausstellungstitel',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'descriptionDe',
      title: 'Details / Beschreibung (DE)',
      type: 'text',
      description: 'Z.B. soloexhibition, Hollerei Galerie, Wien'
    },
    {
      name: 'descriptionEn',
      title: 'Details / Beschreibung (EN)',
      type: 'text',
      description: 'Z.B. soloexhibition, Hollerei Galerie, Vienna'
    }
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'year'
    }
  }
}
