const { defaults } = require("pg");
const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const Admin = sequelize.define("admin", {
    id_admin: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    username:{
        type: Sequelize.STRING(15),
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    }

    //Mau ditambah ini tapi error karena db yang udah ada beda
    // ,
    // lastPasswordChange : {
    //     type : Sequelize.BIGINT,
    //     defaultValue : Math.round(new Date().getTime()/1000)
    // }
});

module.exports = Admin;
