
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Products from "../Products/Products";
import Banner from "../Shared/Banner";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
// Extract base URL (remove /api) and append test-recommendations.html
const BACKEND_BASE_URL = API_BASE_URL.replace('/api', '');
const RECOMMENDATION_TEST_URL = `${BACKEND_BASE_URL}/test-recommendations.html`;

const Home = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetch(`${API_BASE_URL}/products/search?limit=50`)
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data && Array.isArray(data.data.products)) {
                    setProducts(data.data.products);
                } else {
                    setProducts([]);
                }
            })
            .catch(error => {
                console.error('Error fetching products:', error);
                setProducts([]);
            });
    }, []);

    return (
        <div className="space-y-8">
           <Banner />

           {/* Quick AI tools section */}
           <div className="container mx-auto px-4 max-w-6xl">
             <div className="card bg-base-100 shadow-md">
               <div className="card-body">
                 <h2 className="card-title justify-between">
                   <span>AI Tools & Experiments</span>
                 </h2>
                 <p className="text-sm text-base-content/70">
                   Quickly access the product comparison demo and recommendation system test.
                 </p>
                 <div className="flex flex-wrap gap-3 mt-3">
                   <Link to="/chatbot" className="btn btn-primary">
                     AI Assistant
                   </Link>
                   <Link to="/compare" className="btn btn-outline">
                     Product Comparison
                   </Link>
                   <a
                     href={RECOMMENDATION_TEST_URL}
                     target="_blank"
                     rel="noreferrer"
                     className="btn btn-outline btn-secondary"
                   >
                     Recommendation Test
                   </a>
                 </div>
               </div>
             </div>
           </div>

           <Products products={products} />
        </div>
    );
};

export default Home;