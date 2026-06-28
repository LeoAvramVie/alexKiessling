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
    },
    {
      name: 'bgArt1',
      title: 'Hintergrund-Wasserzeichen 1',
      type: 'image',
      description: 'Erstes ambient Kunstwerk im Hintergrund.',
      options: { hotspot: true }
    },
    {
      name: 'bgArt2',
      title: 'Hintergrund-Wasserzeichen 2',
      type: 'image',
      description: 'Zweites ambient Kunstwerk im Hintergrund.',
      options: { hotspot: true }
    },
    {
      name: 'bgArt3',
      title: 'Hintergrund-Wasserzeichen 3',
      type: 'image',
      description: 'Drittes ambient Kunstwerk im Hintergrund.',
      options: { hotspot: true }
    },
    {
      name: 'videoFile',
      title: 'Hintergrundvideo (Datei-Upload)',
      type: 'file',
      description: 'Optional. Lade eine eigene WebM/MP4-Videodatei hoch (überschreibt den obigen Pfad).',
      options: {
        accept: 'video/*'
      }
    }
  ]
}
