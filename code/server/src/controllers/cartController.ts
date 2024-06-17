import { ProductSoldError } from "../errors/productError";
import { Cart } from "../components/cart";
import { User } from "../components/user";
import CartDAO from "../dao/cartDAO";
import ProductController from "./productController";
import { CartNotFoundError, EmptyCartError } from "../errors/cartError";

/**
 * Represents a controller for managing shopping carts.
 * All methods of this class must interact with the corresponding DAO class to retrieve or store data.
 */
class CartController {
    private dao: CartDAO

    constructor() {
        this.dao = new CartDAO
    }

    /**
     * Adds a product to the user's cart. If the product is already in the cart, the quantity should be increased by 1.
     * If the product is not in the cart, it should be added with a quantity of 1.
     * If there is no current unpaid cart in the database, then a new cart should be created.
     * @param user - The user to whom the product should be added.
     * @param productId - The model of the product to add.
     * @returns A Promise that resolves to `true` if the product was successfully added.
     */
    async addToCart(user: User, product: string): Promise<Boolean> { 

        const productController = new ProductController();
        const productsInfo = await productController.getProducts('model', null, product);
        const productInfo = productsInfo[0];
        if(productInfo.quantity < 1){
            throw new ProductSoldError;
        }
        return this.dao.addToCart(user.username,productInfo);
    }


    /**
     * Retrieves the current cart for a specific user.
     * @param user - The user for whom to retrieve the cart.
     * @returns A Promise that resolves to the user's cart or an empty one if there is no current cart.
     */
    async getCart(user: User): Promise<Cart> { 
        return this.dao.getCurrentCart(user.username);
    }

    /**
     * Checks out the user's cart. We assume that payment is always successful, there is no need to implement anything related to payment.
     * @param user - The user whose cart should be checked out.
     * @returns A Promise that resolves to `true` if the cart was successfully checked out.
     * 
     */
    async checkoutCart(user: User) : Promise<Boolean> {

        const today = new Date();
        const paymentDate = today.toISOString().slice(0,10);
        const productController = new ProductController();
        const currentCart = await this.dao.getCurrentCart(user.username);
        const cartId = await this.dao.getCurrentCartId(user.username);
        if(cartId === -1){
            throw new CartNotFoundError;
        }
        if(!currentCart.products.length){
            throw new EmptyCartError;
        }
        for(const product of currentCart.products){
            await productController.sellProduct(product.model,product.quantity,paymentDate);
        }
        return this.dao.checkoutCart(user.username, paymentDate);
     }

    /**
     * Retrieves all paid carts for a specific customer.
     * @param user - The customer for whom to retrieve the carts.
     * @returns A Promise that resolves to an array of carts belonging to the customer.
     * Only the carts that have been checked out should be returned, the current cart should not be included in the result.
     */
    async getCustomerCarts(user: User) : Promise<Cart[]> { 
        return this.dao.getHistoryCarts(user.username);
    }

    /**
     * Removes one product unit from the current cart. In case there is more than one unit in the cart, only one should be removed.
     * @param user The user who owns the cart.
     * @param product The model of the product to remove.
     * @returns A Promise that resolves to `true` if the product was successfully removed.
     */
    async removeProductFromCart(user: User, product: string) :Promise<Boolean> { 

        const productController = new ProductController();
        const productsInfo = await productController.getProducts('model', null, product);
        const currentCart = await this.dao.getCurrentCart(user.username);
        const cartId = await this.dao.getCurrentCartId(user.username);
        if(cartId === -1){
            throw new CartNotFoundError;
        }
        if(!currentCart.products.length){
            throw new EmptyCartError;
        }
        return this.dao.removeFromCart(user.username,productsInfo[0].model);
    }


    /**
     * Removes all products from the current cart.
     * @param user - The user who owns the cart.
     * @returns A Promise that resolves to `true` if the cart was successfully cleared.
     */
    async clearCart(user: User) : Promise<Boolean>  { 
        const cartId = await this.dao.getCurrentCartId(user.username);
        if(cartId === -1){
            throw new CartNotFoundError;
        }
        return this.dao.clearCart(user.username);
    }

    /**
     * Deletes all carts of all users.
     * @returns A Promise that resolves to `true` if all carts were successfully deleted.
     */
    async deleteAllCarts() :Promise<Boolean> {
        return this.dao.deleteAllCarts();
     }

    /**
     * Retrieves all carts in the database.
     * @returns A Promise that resolves to an array of carts.
     */
    async getAllCarts() :Promise<Cart[]>  {
        return this.dao.getAllCarts();
     }
}

export default CartController