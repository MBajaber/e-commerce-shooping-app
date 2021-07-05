import React, { useState, useEffect } from 'react';
import './CardPage.css';
import CartItem from '../../components/CartItem/CartItem';
import { HiEmojiSad } from 'react-icons/hi';
import Currency from 'react-currency-formatter';
import { getTotal } from '../../store/actions/PdoductActions';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from'react-router-dom';
import { pageInfo } from '../../store/actions/UserActions';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';

const stripePromise = loadStripe('pk_test_51J7Lu3F4TDOSFmXihWdyjEQ3VJ0MLS7boJTvBijeu8C9P0ejskQDuJQxHDcsCJ9MNLND0ObKTbrqaAyhPeaQpVEO00BL2eA2D9');

function CartPage() {
    const products = useSelector(state => state.product.products);
    const [total, setTotal] = useState(0);
    const user = useSelector(state => state.user.user)
    const email = useSelector(state => user ? state.user.user.email : null);
    const displayName = useSelector(state => user ? state.user.user.displayName : null);

    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(pageInfo('card'));
    }, []);

    useEffect(() => {
        let allTotalPrice = [];
        products.map(el => allTotalPrice.push(el.price * el.quantity));
        let reduseAllValue = +allTotalPrice.reduce((a,b) => a + b, 0).toFixed(2);
        dispatch(getTotal(reduseAllValue));
        setTotal(reduseAllValue);
    }, [products]);

    const checkoutHandler = async () => {

        const stripe = await stripePromise;
        // Send To Backend

        try {
            // const checkoutSession = await fetch('http://localhost:4000/payment', {
            // const checkoutSession = await fetch('https://e-commerce-shopping-1.herokuapp.com/payment', {
            const checkoutSession = await fetch('https://first-app-shopping.herokuapp.com/payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    products: products,
                    email: email !== null ? email : displayName
                })
            });
            const response = await checkoutSession.json();
            console.log(response.id);
            const redirect = await stripe.redirectToCheckout({
                sessionId: response.id
            });
        } catch(error) {
            alert(error.message);
        }

    //     try {
    //         const checkoutSession = await axios.post('http://localhost:4000/payment', {
    //             products: products,
    //             email: email !== null ? email : displayName
    //         });
    //         // const response = await checkoutSession.json();
    //         // console.log(response.id);
    //         await stripe.redirectToCheckout({
    //             sessionId: checkoutSession.id
    //         });
    //     } catch(error) {
    //         alert(error.message);
    //     }
    }

    return (
        <div className='container'>
            <div className='cart'>
                <div className="products_container">
                    {
                        products.length > 0
                        ? products.map(item => (
                            <CartItem
                                key={item.id}
                                id={item.id}
                                image={item.image}
                                category={item.category}
                                title={item.title}
                                price={item.price}
                                quantity={item.quantity}
                            />             
                            ))
                        :
                        <div className='no_items_cart'>No Items In The Cart... <HiEmojiSad /></div>
                    }
                </div>
                <div className="total">Total: <span>{<Currency quantity={total} currency='usd' />}</span></div>
                {
                    products.length > 0
                    ?   (
                            <div className="checkout">
                                {
                                    user !== null
                                    ? <button role='link' onClick={checkoutHandler} >checkout</button>
                                    : <Link to='signIn'>Sign In to Checkout</Link>
                                }
                            </div>
                        )
                    :  null
                }
            </div>
        </div>
    )
}

export default CartPage;
