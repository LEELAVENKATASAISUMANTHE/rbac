import { getclient } from "./dbset.js";
import { handlePostgresError } from "../utils/postgresErrorHandler.js";
const getrolebyid = async(id)=>{
    const client = await getclient();
    try {
        const res = await client.query("SELECT * FROM roles WHERE id = $1", [id]);
        return res.rows[0];
    } catch (error) {
        console.error('Error fetching role by ID:', error);
        handlePostgresError(error);
    } finally {
        client.release();
    }
};

const createrole = async(name, description,is_active)=>{
    const client = await getclient();
    try {
        const res = await client.query("INSERT INTO roles (name, description, is_active) VALUES ($1, $2, $3) RETURNING *", [name, description, is_active]);
        return res.rows[0];
    } catch (error) {
        console.error('Error creating role:', error);
        handlePostgresError(error);
    } finally {
        client.release();
    }
};
const updaterole = async(id, name, description,is_active)=>{
    const client = await getclient();
    try {
        const existingRole = await getrolebyid(id);
        if (!existingRole) {
            throw new Error(`Role with id ${id} does not exist`);
        }   
        const res = await client.query("UPDATE roles SET name = $1, description = $2, is_active = $3 WHERE id = $4 RETURNING *", [name || existingRole.name, description || existingRole.description, is_active !== undefined ? is_active : existingRole.is_active, id]);
        return res.rows[0];
    } catch (error) {
        console.error('Error updating role:', error);
        handlePostgresError(error);
    } finally {
        client.release();
    }
};
const deleterole = async(id)=>{
    const client = await getclient();
    try {
        const existingRole = await getrolebyid(id);
        if (!existingRole) {
            throw new Error(`Role with id ${id} does not exist`);
        }
        const res = await client.query("DELETE FROM roles WHERE id = $1 RETURNING *", [id]);
        return res.rows[0];
    } catch (error) {
        console.error('Error deleting role:', error);
        handlePostgresError(error);
    } finally {
        client.release();
    }
};
const getallroles = async()=>{
    const client = await getclient();
    try {
        const res = await client.query("SELECT * FROM roles ORDER BY id");
        return res.rows;
    }
    catch (error) {
        console.error('Error fetching roles:', error);
        handlePostgresError(error);
    }   finally {
        client.release();
    }

};
export { getrolebyid, createrole, updaterole, deleterole, getallroles };
