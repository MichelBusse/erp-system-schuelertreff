import {
  AccountBalance as AccountBalanceIcon,
  Layers as LayersIcon,
  ManageAccounts as ManageAccountsIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  TableChart as TableChartIcon,
} from '@mui/icons-material'
import ExploreIcon from '@mui/icons-material/Explore'
import PersonAddIcon from '@mui/icons-material/PersonAdd'

const MenuItems = [
  {
    icon: ExploreIcon,
    text: 'Dashboard',
    href: '/dashboard',
    roles: ['admin'],
  },
  {
    icon: TableChartIcon,
    text: 'Stundenplan',
    href: '/timetable',
  },
  {
    icon: SchoolIcon,
    text: 'Lehrkräfte',
    href: '/teachers',
    roles: ['admin'],
  },
  {
    icon: PersonAddIcon,
    text: 'Bewerber',
    href: '/applicants',
    roles: ['admin'],
  },
  {
    icon: PeopleIcon,
    text: 'Privatkunden',
    href: '/privateCustomers',
    roles: ['admin'],
  },
  {
    icon: AccountBalanceIcon,
    text: 'Schulen',
    href: '/schools',
    roles: ['admin'],
  },
  {
    icon: LayersIcon,
    text: 'Fächer',
    href: '/subjects',
    roles: ['admin'],
  },
  {
    icon: ManageAccountsIcon,
    text: 'Profil',
    href: '/profile',
    roles: ['teacher', 'school'],
  },
]

export default MenuItems;