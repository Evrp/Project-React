import './Food.css';

function ProductList({ product,addToCart }) {
    return (
        <div className='flex'>
            {
                product.map((productItem, productIndex) => {
                    return (
                        <div style={{ width: '33%' }}>
                            <div className='product-item'>
                                <img src={productItem.url} width="100%" />
                                <p>{productItem.name}<br/>{productItem.category} </p>
                                <p> ฿ {productItem.price}</p>
                                <button
                                    onClick={() => addToCart(productItem)}
                                >Pick Up Order</button>
                            </div>
                        </div>
                    )
                })
            }
        </div>
    )
}

export default ProductList