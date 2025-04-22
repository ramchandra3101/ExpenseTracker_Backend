import User from "./User.js";
import Category from "./Category.js";
import Expense from "./Expense.js";
import PaymentMethod from "./PaymentMethod.js";
import Entry from "./Entry.js";


//One User has many categories
User.hasMany(Category, {
    foreignKey: 'user_id',
});
Category.belongsTo(User, {
    foreignKey: 'user_id',
});


//One user has many expenses
User.hasMany(Expense, {
    foreignKey: 'user_id',
});
Expense.belongsTo(User, {
    foreignKey: 'user_id',
});

// One category has many expenses


//One paymentMethod used for many expenses
PaymentMethod.hasMany(Expense, {
    foreignKey: 'payment_method_id',
    sourceKey: 'payment_method_id',

});
Expense.belongsTo(PaymentMethod, {
    foreignKey: 'payment_method_id',
    targetKey: 'payment_method_id',
});

//One user has many entries
User.hasMany(Entry, {
    foreignKey: 'user_id',
});
Entry.belongsTo(User, {
    foreignKey: 'user_id',
});

//One user has many payment methods
User.hasMany(PaymentMethod, {
    foreignKey: 'user_id',
});
PaymentMethod.belongsTo(User, {
    foreignKey: 'user_id',
});


export {User,Category, Expense, PaymentMethod};
