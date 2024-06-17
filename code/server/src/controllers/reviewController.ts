import { ProductReview } from "../components/review";
import { User } from "../components/user";
import ReviewDAO from "../dao/reviewDAO";
import ProductController from "./productController";

class ReviewController {
    private dao: ReviewDAO

    constructor() {
        this.dao = new ReviewDAO
    }

    /**
     * Adds a new review for a product
     * @param model The model of the product to review
     * @param user The username of the user who made the review
     * @param score The score assigned to the product, in the range [1, 5]
     * @param comment The comment made by the user
     * @returns A Promise that resolves to nothing
     */
    async addReview(model: string, user: User, score: number, comment: string) :Promise<void> { 
        const productController = new ProductController();
        const products = await productController.getProducts('model',null,model);
        const today = new Date().toISOString().slice(0,10);
        return this.dao.createReview(products[0].model,user.username,score,comment,today);
    }

    /**
     * Returns all reviews for a product
     * @param model The model of the product to get reviews from
     * @returns A Promise that resolves to an array of ProductReview objects
     */
    async getProductReviews(model: string) :Promise<ProductReview[]> { 
        // const productController = new ProductController();
        // const products = await productController.getProducts('model',null,model);
        return this.dao.getReviewsForAProduct(model/*products[0].model*/);
    }

    /**
     * Deletes the review made by a user for a product
     * @param model The model of the product to delete the review from
     * @param user The user who made the review to delete
     * @returns A Promise that resolves to nothing
     */
    async deleteReview(model: string, user: User) :Promise<void>  { 
        const productController = new ProductController();
        const products = await productController.getProducts('model',null,model);
        return this.dao.deleteUserReview(products[0].model,user.username);
    }

    /**
     * Deletes all reviews for a product
     * @param model The model of the product to delete the reviews from
     * @returns A Promise that resolves to nothing
     */
    async deleteReviewsOfProduct(model: string) :Promise<void> {

        const productController = new ProductController();
        const products = await productController.getProducts('model',null,model);
        return this.dao.deleteReviews(products[0].model);
        
     }

    /**
     * Deletes all reviews of all products
     * @returns A Promise that resolves to nothing
     */
    async deleteAllReviews() :Promise<void> { 
        return this.dao.deleteAllReviews();
    }
}

export default ReviewController;