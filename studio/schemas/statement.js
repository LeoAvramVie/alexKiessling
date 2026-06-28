export default {
  name: 'statement',
  title: 'Statements & Essays',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Titel',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'author',
      title: 'Autor / Künstlernennung',
      type: 'string',
      description: 'Z.B. Alex Kiessling (Artist) oder Günther Oberhollenzer (Kunsthistoriker)'
    },
    {
      name: 'textDe',
      title: 'Text (DE)',
      type: 'text',
      validation: Rule => Rule.required()
    },
    {
      name: 'textEn',
      title: 'Text (EN)',
      type: 'text',
      validation: Rule => Rule.required()
    },
    {
      name: 'image',
      title: 'Begleitbild / Porträt',
      type: 'image',
      options: { hotspot: true },
      description: 'Optionales Bild, das neben dem Text angezeigt wird.'
    },
    {
      name: 'order',
      title: 'Sortiernummer',
      type: 'number',
      description: 'Niedrige Nummern stehen weiter oben.',
      initialValue: 0
    }
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'author'
    }
  }
}
