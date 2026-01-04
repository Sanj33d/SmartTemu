
import { useEffect, useState } from "react";
import Products from "../Products/Products";
import Banner from "../Shared/Banner";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const Home = () => {
    const [products, setProducts] = useState([])

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
    }, [])

    // const productsPromise = 
    return (
        <div>
           <Banner></Banner>

           <Products products={products}></Products>
        </div>
        
    );
};

export default Home;