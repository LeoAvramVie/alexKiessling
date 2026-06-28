export default {
  name: 'video',
  title: 'Video-Dokumentationen',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Titel',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'youtubeUrl',
      title: 'YouTube URL',
      type: 'string',
      validation: Rule => Rule.required()
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
      subtitle: 'youtubeUrl'
    }
  }
}
