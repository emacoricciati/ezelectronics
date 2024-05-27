import { ProductReview } from "../components/review";
import db from "../db/db"
import { ExistingReviewError, NoReviewProductError } from "../errors/reviewError";
/**
 * A class that implements the interaction with the database for all review-related operations.
 * You are free to implement any method you need here, as long as the requirements are satisfied.
 */
class ReviewDAO {

    private getUserReviewForAProduct(model: string, username: string): Promise<ProductReview> {
        return new Promise<ProductReview>((resolve, reject) => {
            const sql = "SELECT * FROM reviews WHERE model = ? AND user = ?"
            db.get(sql,[model, username], (err: Error | null, row: any) => {
                if (err) {
                    reject(err)
                    return
                }
                if(!row){
                    reject(new NoReviewProductError)
                    return
                }
                const review = new ProductReview(row.model,row.user,row.score,row.date,row.comment);
                resolve(review)
            })
        })
    }

    createReview(model: string, username: string, score: number, comment: string, date: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const sql = "INSERT INTO reviews(score, date, comment, user, model) VALUES(?, ?, ?, ?, ?)"
            db.run(sql, [score,date,comment,username,model], (err: Error | null) => {
                if (err) {
                    if (err.message.includes("UNIQUE constraint failed: reviews.user, reviews.model")) reject(new ExistingReviewError)
                    reject(err)
                    return
                }
                resolve()
            })
        })
    }

    getReviewsForAProduct(model: string): Promise<ProductReview[]> {
        return new Promise<ProductReview[]>((resolve, reject) => {
            const sql = "SELECT * FROM reviews WHERE model = ?"
            db.all(sql,[model], (err: Error | null, rows: any[]) => {
                if (err) {
                    reject(err)
                    return
                }
                const reviews: ProductReview[] = rows.map(row => {
                    return new ProductReview(row.model,row.user,row.score,row.date,row.comment);
                })
                resolve(reviews)
            })
        })
    }

    deleteReviews(model: string, username?: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const sql = `DELETE FROM reviews WHERE model = ? ${username ? "AND user = ?" : ""}`
            db.run(sql, [model,username], (err: Error | null) => {
                if (err) {
                    reject(err)
                    return
                }
                resolve()
            })
        })
    }

    async deleteUserReview(model: string, username: string){
        try{
            const _ = await this.getUserReviewForAProduct(model, username);
            return this.deleteReviews(model, username);
        }
        catch(err){
            throw(err)
        }
    }

    deleteAllReviews(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const sql = "DELETE FROM reviews"
            db.run(sql, (err: Error | null) => {
                if (err) {
                    reject(err)
                    return
                }
                resolve()
            })
        })
    }

}

export default ReviewDAO;