const mysql = require('mysql2');
const inquirer = require('inquirer');

// Established connection between database and server.
const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'employee_db',
});

connection.connect ((err) => {
    if (err) throw err;
    console.log('Connected to employee_db');
});


function menu() {
    inquirer.prompt([{
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
            'View all employees',
            'View all employees by department',
            'View all employees by manager',
            'Update employee role',
            'Update employee manager',
            'Add employee',
            'Remove employee',
            'View all roles',
            'Add role',
            'Remove role',
            'View all departments',
            'Add department',
            'Remove department',
            'Quit'            
        ]
    }])
    .then((answer) => {
        switch (answer.action) {
          case 'View all employees':
            viewAllEmployees();
            break;
          case 'View all employees by department':
            viewEmployeesByDepartment();
            break;
          case 'View all employees by manager':
            viewEmployeesByManager();
            break;
          case 'Add employee':
            addEmployee();
            break;
          case 'Remove employee':
            removeEmployee();
            break;
          case 'Update employee role':
            updateEmployeeRole();
            break;
          case 'Update employee manager':
            updateEmployeeManager();
            break;
          case 'View all roles':
            viewAllRoles();
            break;
          case 'Add role':
            addRole();
            break;
          case 'Remove role':
            removeRole();
            break;
          case 'View all departments':
            viewAllDepartments();
            break;
          case 'Add department':
            addDepartment();
            break;
          case 'Remove department':
            removeDepartment();
            break;
          case 'Quit':
            connection.end();
            break;
        }
    });
}
