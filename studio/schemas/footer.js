export default {
  name: 'footer',
  title: 'Footer & Kontakt & Rechtliches',
  type: 'document',
  fields: [
    {
      name: 'email',
      title: 'Kontakt-E-Mail',
      type: 'string',
      initialValue: 'info@alexkiessling.com'
    },
    {
      name: 'instagramUrl',
      title: 'Instagram Profil-Link',
      type: 'string'
    },
    {
      name: 'facebookUrl',
      title: 'Facebook Page-Link',
      type: 'string'
    },
    {
      name: 'youtubeChannelUrl',
      title: 'YouTube Kanal-Link',
      type: 'string'
    },
    {
      name: 'raribleUrl',
      title: 'Rarible NFT-Link',
      type: 'string'
    },
    {
      name: 'gtCooperationTextDe',
      title: 'Grant Thornton Info (DE)',
      type: 'text',
      description: 'Hintergrundtext zur Grant Thornton Kooperation.'
    },
    {
      name: 'gtCooperationTextEn',
      title: 'Grant Thornton Info (EN)',
      type: 'text'
    },
    {
      name: 'gtVerification',
      title: 'NFT-Verifizierungstext (Englisch)',
      type: 'text',
      description: 'Die detaillierte Anleitung zur NFT-Verifizierung (Smart Contracts).'
    },
    {
      name: 'impressumDe',
      title: 'Impressum (DE)',
      type: 'text',
      description: 'Gesetzlich vorgeschriebenes Impressum.'
    },
    {
      name: 'impressumEn',
      title: 'Impressum (EN)',
      type: 'text'
    },
    {
      name: 'privacyDe',
      title: 'Datenschutz (DE)',
      type: 'text',
      description: 'Datenschutzerklärung nach DSGVO.'
    },
    {
      name: 'privacyEn',
      title: 'Datenschutz (EN)',
      type: 'text'
    }
  ]
}
