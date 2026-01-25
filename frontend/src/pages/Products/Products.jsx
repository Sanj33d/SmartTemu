import React from 'react';
import ProductCard from '../Shared/ProductCard';

const Products = ({products}) => {
    // Ensure products is always an array
    const productsList = Array.isArray(products) ? products : [];

    return (
        <div>
            <p className='text-center'>Available Total Products: {productsList.length}</p>

            {productsList.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500">No products available</p>
                </div>
            ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {
                        productsList.map(product => <ProductCard product={product} key={product._id}></ProductCard>)
                    }
                </div>
            )}
        </div>
    );
};

export default Products;