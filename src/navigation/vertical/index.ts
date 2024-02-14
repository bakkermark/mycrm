export default [
  {
    title: 'Home',
    to: { name: 'root' },
    icon: { icon: 'tabler-smart-home' },
  },
  {
    title: 'Contacts',
    to: { name: 'contacts' },
    icon: { icon: 'tabler-file' },
  },
  {
    title: 'Licenses',
    icon: { icon: 'tabler-file-certificate' },
    children: [
      { title: 'List', to: 'license-list' },
      { title: 'Add', to: 'license-add' },
    ],
  },
  {
    title: 'Gebruikers',
    icon: { icon: 'tabler-users' },
    children: [
      { title: 'List', to: 'user-list' },
      { title: 'Add', to: 'user-add' },
    ],
  },
]
