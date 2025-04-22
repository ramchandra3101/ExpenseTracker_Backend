import { DataTypes } from "@sequelize/core";
import { sequelize } from "../config/db.config.js";


const Category = sequelize.define('category', {
    category_id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,

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
    hooks:{
        beforeValidate:(category)=>{
            if (!category.categpry_id){
                const tiemstamp = new Date().getTime();
                category.category_id = `${category.user_id}_cat_${tiemstamp}`;
            }
        }
    }

})

export default Category;