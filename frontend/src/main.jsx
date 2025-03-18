import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import Layout from 'src/components/Layout';
import Home from 'src/pages/Home';
import Paint from 'src/pages/Paint';
import Files from 'src/pages/Files';
import Login from 'src/pages/Login';
import Registration from './pages/Registration';

const router = createBrowserRouter([{
    path: "/",
    element: <Layout />,
    children: [{
        path: "",
        element: <Home />
    }, {
        path: "files",
        element: <Files />
    }, {
        path: "login",
        element: <Login />
    }, {
        path: "register",
        element: <Registration />
    }]
}, {
    path: "paint",
    element: <Paint />
}]);

createRoot(document.getElementById('root')).render(
    <RouterProvider router={router}></RouterProvider>
);
