import {DataTypes} from 'sequelize';
import {sequelize} from '../config/db.config';

const Entry = sequelize.define('entry', {
    input_type: {
        type: DataTypes.ENUM('text', 'manual', 'voice'),
        defaultValue: 'manual'
    },
    input_prompt: {
        type: DataTypes.STRING,
        allowNull: false
    },
    logged_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
},{
        timestamps: true
    });
export default Entry;