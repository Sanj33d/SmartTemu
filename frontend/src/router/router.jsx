import { createBrowserRouter } from "react-router";
import RootLayout from "../layouts/RootLayout";
import Home from "../pages/Home/Home";
import Register from "../pages/Register/Register";
import SignIn from "../pages/SignIn/SignIn";
import ProductReviews from "../pages/ProductReviews/ProductReviews";
import Chatbot from "../pages/Chatbot/Chatbot";
import ProductComparison from "../pages/ProductComparison/ProductComparison";

const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
        {index: true,
            Component: Home
        },
        {
        path: '/register',
        Component: Register 
        }, 
        {
            path: '/signIn',
            Component: SignIn
        },
        {
            path: '/reviews/:productId',
            Component: ProductReviews
        },
        {
            path: '/chatbot',
            Component: Chatbot
        },
        {
            path: '/compare',
            Component: ProductComparison
        }
    ]
  },
]);

export default router;