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
      fullName: 'Mark Bakker',
      Company: 'TempPro VOF',
      role: 'Admin',
      username: 'gslixby0',
      country: 'El Salvador',
      contact: '(479) 232-9151',
      email: 'mark@temppro.nl',
      CurrentPlan: 'enterprise',
      Active: true,
      avatar: '',
      billing: 'Manual-Credit Card',
    },
    {
      id: 2,
      fullName: 'Sigrid Bakker',
      Company: 'TempPro VOF',
      role: 'Standard User',
      username: 'hredmore1',
      country: 'Albania',
      contact: '(472) 607-9137',
      email: 'sigrid.bakker@outlook.com',
      CurrentPlan: 'Platinum',
      Active: false,
      avatar: avatar2,
      billing: 'Auto debit',
    },
    {
      id: 3,
      fullName: 'Jan Klaassen',
      Company: 'MultiMediaMarkers',
      role: 'Standard User',
      username: 'msicely2',
      country: 'Russia',
      contact: '(321) 264-4599',
      email: 'jan@temppro.nl',
      CurrentPlan: 'Extended',
      Active: true,
      avatar: avatar3,
      billing: 'Manual-Credit Card',
    },
    {
      id: 4,
      fullName: 'User 2',
      Company: 'MultiMediaMarkers',
      role: 'Standard User',
      username: 'crisby3',
      country: 'China',
      contact: '(923) 690-6806',
      email: 'user2@multimediamarkers.com',
      CurrentPlan: 'Basic',
      Active: true,
      avatar: '',
      billing: 'Auto debit',
    },
    {
      id: 5,
      fullName: 'User 1',
      Company: 'MultiMediaMarkers',
      role: 'Admin',
      username: 'mhurran4',
      country: 'Pakistan',
      contact: '(669) 914-1078',
      email: 'user1@multimediamarkers.com',
      CurrentPlan: 'Basic',
      Active: true,
      avatar: avatar5,
      billing: 'Manual-Cash',
    },
  ],
}
