import {getclient} from "./dbset.js";
import { handlePostgresError } from "../utils/postgresErrorHandler.js";

const createstudent=async(data)=>{
    const client =await getclient();
    try {
        const res = await client.query(
            `INSERT INTO students (id, offical_email, personal_email, resume, "LeetCode", "HackerRank", "HackerEarth", linkedin, "CGPA", created_at, phone_number)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
            [data.id, data.offical_email, data.personal_email, data.resume, data.LeetCode, data.HackerRank, data.HackerEarth, data.linkedin, data.CGPA, data.created_at, data.phone_number]
        );
        return res.rows[0];
    } catch (error) {
        // Translate/log the error and rethrow so callers can handle it
        handlePostgresError(error);
        throw error;
    }finally{
        client.release();
    }
}

const getstudentbyid=async(id)=>{
    const client =await getclient();
    try {
        const res = await client.query("SELECT * FROM students WHERE id = $1", [id]);
        return res.rows[0];
    } catch (error) {
        handlePostgresError(error);
        throw error;
    }finally{
        client.release();
    }
};

const deletesudentbyid=async(id)=>{
    const client =await getclient();
    try {
        const res = await client.query("DELETE FROM students WHERE id = $1", [id]);
        return res.rowCount > 0;
    } catch (error) {
        handlePostgresError(error);
        throw error;
    }finally{
        client.release();
    }
};
const updatestudentbyid=async(id, data)=>{
    const client =await getclient();
    try {
        const res = await client.query(
            `UPDATE students SET offical_email = $1, personal_email = $2, resume = $3, "LeetCode" = $4, "HackerRank" = $5, "HackerEarth" = $6, linkedin = $7, "CGPA" = $8, created_at = $9, phone_number = $10 WHERE id = $11 RETURNING *`,
            [data.offical_email, data.personal_email, data.resume, data.LeetCode, data.HackerRank, data.HackerEarth, data.linkedin, data.CGPA, data.created_at, data.phone_number, id]
        );
        return { success: true, student: res.rows[0] };
    } catch (error) {
        handlePostgresError(error);
        throw error;
    }finally{
        client.release();
    }
};

const getallstudents=async()=>{
    const client =await getclient();
    try {
        const res = await client.query("SELECT * FROM students");
        return res.rows;
    } catch (error) {
        handlePostgresError(error);
        throw error;
    }finally{
        client.release();
    }
};



export { createstudent, getstudentbyid, deletesudentbyid, updatestudentbyid, getallstudents };