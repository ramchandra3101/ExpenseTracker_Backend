import { DataTypes } from '@sequelize/core';
import { sequelize } from '../config/db.config.js';
import bcrypt from 'bcrypt';


const User = sequelize.define('user', {
    user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    first_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    last_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail:true,
        },  
    },
    password_hash: {
        type: DataTypes.STRING,
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    last_logged: {
        type: DataTypes.DATE,
        allowNull: true
    },
    last_pwd_change: {
        type: DataTypes.DATE,
        allowNull: true
    }},
    {
        timestamps:true,
        hooks:{
            beforeCreate: async(user)=>{
                if(user.password_hash){
                    const salt = await bcrypt.genSalt(10);
                    user.password_hash = await bcrypt.hash(user.password_hash, salt);
                }
            },
            beforeUpdate: async(user)=>{
                if (user.changed('password_hash') && user.password_hash){
                    const salt = await bcrypt.genSalt(10);
                    user.password_hash = await bcrypt.hash(user.password_hash, salt);
                }
            },
        },
        schema: 'expensestrack'
    }
);
//Method to check if the password is correct
User.prototype.validatePassword = async function(password) {
    return await bcrypt.compare(password, this.password_hash);
};


export default User;

    
    

    
