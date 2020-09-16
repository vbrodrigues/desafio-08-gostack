import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storagedProducts = await AsyncStorage.getItem('products');

      if (storagedProducts) {
        setProducts(JSON.parse(storagedProducts));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const productIndex = products.findIndex(
        onCartProduct => onCartProduct.id === product.id,
      );

      const updatedProducts = [...products];
      if (productIndex > -1) {
        updatedProducts[productIndex].quantity += 1;
        setProducts(updatedProducts);
      } else {
        product.quantity = 1;
        setProducts(oldProducts => [...oldProducts, product]);
      }
      await AsyncStorage.setItem('products', JSON.stringify(updatedProducts));
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const productIndex = products.findIndex(product => product.id === id);

      const updatedProducts = [...products];
      if (productIndex > -1) {
        updatedProducts[productIndex].quantity += 1;
        setProducts(updatedProducts);
      }
      await AsyncStorage.setItem('products', JSON.stringify(updatedProducts));
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productIndex = products.findIndex(product => product.id === id);

      const updatedProducts = [...products];
      if (productIndex > -1) {
        const currentQuantity = updatedProducts[productIndex].quantity;
        const newQuantity = currentQuantity - 1;
        if (newQuantity <= 0) {
          updatedProducts.splice(productIndex, 1);
        } else {
          updatedProducts[productIndex].quantity -= 1;
        }
      }
      setProducts(updatedProducts);
      await AsyncStorage.setItem('products', JSON.stringify(updatedProducts));
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
