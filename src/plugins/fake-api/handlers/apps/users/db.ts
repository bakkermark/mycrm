import type { UserProperties } from './types'
import avatar1 from '@images/avatars/avatar-1.png'
import avatar2 from '@images/avatars/avatar-2.png'
import avatar3 from '@images/avatars/avatar-3.png'
import avatar4 from '@images/avatars/avatar-4.png'
import avatar5 from '@images/avatars/avatar-5.png'
import avatar6 from '@images/avatars/avatar-6.png'

interface DB {
  users: UserProperties[]
}

export const db: DB = {
  users: [
    {
      id: 1,
      fullName: 'Sigrid Bakker',
      company: 'MultiMediaMarkers BV',
      role: 'Admin',
      username: 'gslixby0',
      country: 'El Salvador',
      contact: '(479) 232-9151',
      email: 'sigrid@multimediamarkers.com',
      plan: 'Basic',
      status: 'Active',
      avatar: '',
      billing: 'Manual-Credit Card',
    },
    {
      id: 2,
      fullName: 'Mark Bakker',
      company: 'Marcenzie BV',
      role: 'Standard User',
      username: 'hredmore1',
      country: 'Albania',
      contact: '(472) 607-9137',
      email: 'mark@marcenzie.nl',
      plan: 'Extended',
      status: 'Active',
      avatar: avatar2,
      billing: 'Auto debit',
    },
    {
      id: 3,
      fullName: 'Jackie Weijts',
      company: 'Group Joos NV',
      role: 'Standard User',
      username: 'msicely2',
      country: 'Russia',
      contact: '(321) 264-4599',
      email: 'jackie@groupjoos.com',
      plan: 'Platinum',
      status: 'Inactive',
      avatar: avatar3,
      billing: 'Manual-Credit Card',
    }
  ],
}
