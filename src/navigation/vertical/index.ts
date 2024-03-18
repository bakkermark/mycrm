export default [
  {
    title: 'Home',
    to: { name: 'root' },
    icon: { icon: 'tabler-smart-home' },
  },
  {
    title: 'Licenses',
    icon: { icon: 'tabler-certificate-2' },
    children: [
      { title: 'List', to: 'license-list' },
      { title: 'Add', to: 'license-add' },
    ],
  },
  {
    title: 'Users',
    icon: { icon: 'tabler-users' },
    children: [
      { title: 'List', to: 'user-list' },
      { title: 'Add', to: 'user-add' },
    ],
  },
  {
    title: 'Relations',
    icon: { icon: 'tabler-users-group'},
    children: [
      { title: 'List', to: 'relation-list' },
      { title: 'Add', to: 'relation-add' },
    ]
  },
]
