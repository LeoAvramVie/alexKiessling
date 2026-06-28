export default {
  name: 'vitaEntry',
  title: 'Vita Eintrag (Chronologisch)',
  type: 'document',
  fields: [
    {
      name: 'year',
      title: 'Jahr',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'eventsDe',
      title: 'Ereignisse (DE)',
      type: 'array',
      of: [{ type: 'string' }],
      validation: Rule => Rule.required()
    },
    {
      name: 'eventsEn',
      title: 'Ereignisse (EN)',
      type: 'array',
      of: [{ type: 'string' }],
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
      title: 'year',
      subtitle: 'eventsDe.0'
    }
  }
}
