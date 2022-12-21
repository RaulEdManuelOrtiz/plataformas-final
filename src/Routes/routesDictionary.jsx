import AllServices from '../Views/AllServices';
import MyServices from '../Views/MyServices';
import Maps from '../Views/Maps';

const routesList = [
  {
    key: 'AllServices',
    title: 'Lista de servicios',
    name: 'AllServices',
    component: AllServices,
    icon: 'list',
  },
  {
    key: 'MyServices',
    title: 'Mis servicios',
    name: 'MyServices',
    component: MyServices,
    icon: 'clipboard',
  },
  {
    key: 'Map',
    title: 'Mapa de servicios',
    name: 'Map',
    component: Maps,
    icon: 'map-marker',
  },
];
export default routesList;
