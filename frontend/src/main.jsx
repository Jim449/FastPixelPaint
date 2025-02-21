import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import Layout from 'src/components/Layout';
import Home from 'src/pages/Home';
import Paint from 'src/pages/Paint';
import About from 'src/pages/About';
import Folder from 'src/pages/Folder';

const router = createBrowserRouter([{
    path: "/",
    element: <Layout />,
    children: [{
        path: "home",
        element: <Home />
    }, {
        path: "folder/:id",
        element: <Folder />
    }, {
        path: "about",
        element: <About />
    }]
}, {
    path: "paint",
    element: <Paint />
}]);

createRoot(document.getElementById('root')).render(
    <RouterProvider router={router}></RouterProvider>
);
