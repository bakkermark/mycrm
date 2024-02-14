export default [
  {
    title: 'Home',
    to: { name: 'root' },
    icon: { icon: 'tabler-smart-home' },
  },
  {
    title: 'Second Page',
    to: { name: 'contacts' },
    icon: { icon: 'tabler-file' },
  },
  {
    title: 'Licenses',
    icon: { icon: 'tabler-file-certificate'},
    children: [
      { title: 'List', name: 'license-list' },
      { title: 'Add', name: 'license-add' }
    ]
  },
  {
    title: 'Users',
    icon: { icon: 'tabler-users'},
    children: [
      { title: 'List', name: 'user-list' },
      { title: 'Add', name: 'user-add' }
    ]
  }
]
