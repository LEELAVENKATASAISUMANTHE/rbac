import { getclient } from "./dbset.js";
import { handlePostgresError } from "../utils/postgresErrorHandler.js";

const createpermission = async(name, description)=>{
    const client = await getclient();
    try {
        const res = await client.query("INSERT INTO permissions (name, description) VALUES ($1, $2) RETURNING *", [name, description]);
        return res.rows[0];
    } catch (error) {
        console.error('Error creating permission:', error);
        handlePostgresError(error);
    } finally {
        client.release();
    }
};
const getpermissionbyid = async(id)=>{
    const client = await getclient();
    try {
        const res = await client.query("SELECT * FROM permissions WHERE id = $1", [id]);
        return res.rows[0];
    } catch (error) {
        console.error('Error fetching permission by ID:', error);
        handlePostgresError(error);
    } finally {
        client.release();
    }
};
const getallpermissions = async()=>{
    const client = await getclient();
    try {
        const res = await client.query("SELECT * FROM permissions");
        return res.rows;
    } catch (error) {
        console.error('Error fetching permissions:', error);
        handlePostgresError(error);
    } finally {
        client.release();
    }
};

const deletepermission = async(id)=>{
    const client = await getclient();
    try {
        const res = await client.query("DELETE FROM permissions WHERE id = $1", [id]);
        return res.rowCount > 0;
    } catch (error) {
        console.error('Error deleting permission:', error);
        handlePostgresError(error);
    } finally {
        client.release();
    }
};

export { createpermission, getpermissionbyid, getallpermissions, deletepermission };
