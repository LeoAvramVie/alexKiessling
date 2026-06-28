export default {
  name: 'homepage',
  title: 'Startseite',
  type: 'document',
  fields: [
    {
      name: 'titleDe',
      title: 'Titel (DE)',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'titleEn',
      title: 'Titel (EN)',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'subtitleDe',
      title: 'Untertitel (DE)',
      type: 'string'
    },
    {
      name: 'subtitleEn',
      title: 'Untertitel (EN)',
      type: 'string'
    },
    {
      name: 'videoPath',
      title: 'Hintergrundvideo (Pfad oder YouTube-URL)',
      type: 'string',
      description: 'Z.B. /assets/videos/NEON-Alex-Kiessling.webm oder eine YouTube-URL'
    },
    {
      name: 'fallbackImage',
      title: 'Hintergrund-Vorschaubild (Fallback)',
      type: 'image',
      description: 'Wird geladen, bevor das Video startet, und auf Mobilgeräten verwendet.',
      options: {
        hotspot: true
      }
    },
    {
      name: 'statementDe',
      title: 'Artist Statement (DE)',
      type: 'text',
      description: 'Der deutsche Text von Alex Kiessling.'
    },
    {
      name: 'statementEn',
      title: 'Artist Statement (EN)',
      type: 'text',
      description: 'Der englische Text von Alex Kiessling.'
    }
  ]
}
