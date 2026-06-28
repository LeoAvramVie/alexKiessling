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
    }
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'slug.current'
    }
  }
}
