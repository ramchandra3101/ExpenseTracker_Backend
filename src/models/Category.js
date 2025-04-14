import { DataTypes } from "@sequelize/core";
import { sequelize } from "../config/db.config.js";


const Category = sequelize.define('category', {
    category_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    icon: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    color: {
        type: DataTypes.STRING,
        allowNull: true,    
    },
    is_default: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    is_income: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
},
{
    timestamps: true,

})

export default Category;