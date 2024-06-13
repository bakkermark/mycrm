export default [
  {
    title: 'Home',
    to: { name: 'root' },
    icon: { icon: 'tabler-smart-home' },
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
    title: 'Emailtemplates',
    icon: { icon: 'tabler-template'},
    children: [
      { title: 'List', to: 'emailtemplate-list' },
      { title: 'Add', to: 'emailtemplate-add' },
    ]
  },
  {
    title: 'Trivia Questions',
    icon: { icon: 'tabler-users-group'},
    children: [
      { title: 'List', to: 'trivia-question-list' },
      { title: 'Add', to: 'trivia-question-add' },
    ]
  }
]
