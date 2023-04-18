const mysql = require("mysql2");
const inquirer = require("inquirer");

// Established connection between database and server.
const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "qx3e47zU!",
  database: "employee_db",
});

connection.connect((err) => {
  if (err) throw err;
  console.log("Connected to employee_db");
});

function menu() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "action",
        message: "What would you like to do?",
        choices: [
          "View all employees",
          "View all employees by department",
          "View all employees by manager",
          "Update employee role",
          "Update employee manager",
          "Add employee",
          "Remove employee",
          "View all roles",
          "Add role",
          "Remove role",
          "View all departments",
          "Add department",
          "Remove department",
          "Quit",
        ],
      },
    ])
    .then((answer) => {
      switch (answer.action) {
        case "View all employees":
          viewAllEmployees();
          break;
        case "View all employees by department":
          viewEmployeesByDepartment();
          break;
        case "View all employees by manager":
          viewEmployeesByManager();
          break;
        case "Add employee":
          addEmployee();
          break;
        case "Remove employee":
          removeEmployee();
          break;
        case "Update employee role":
          updateEmployeeRole();
          break;
        case "Update employee manager":
          updateEmployeeManager();
          break;
        case "View all roles":
          viewAllRoles();
          break;
        case "Add role":
          addRole();
          break;
        case "Remove role":
          removeRole();
          break;
        case "View all departments":
          viewAllDepartments();
          break;
        case "Add department":
          addDepartment();
          break;
        case "Remove department":
          removeDepartment();
          break;
        case "Quit":
          connection.end();
          break;
      }
    });
}

menu();

function viewAllEmployees() {
  connection.query("SELECT * FROM employees", function (err, res) {
    if (err) throw err;
    console.table(res);
    menu();
  });
}

function viewEmployeesByDepartment() {
  connection.query(
    `SELECT employees.id, employees.first_name, employees.last_name, departments.name AS department
      FROM employees
      INNER JOIN roles ON employees.role_id = roles.id
      INNER JOIN departments ON roles.department_id = departments.id
      ORDER BY departments.name, employees.last_name`,
    function (err, res) {
      if (err) throw err;
      console.table(res);
      menu();
    }
  );
}

function viewEmployeesByManager() {
  connection.query(
    `SELECT CONCAT(m.first_name, ' ', m.last_name) AS manager, 
      CONCAT(e.first_name, ' ', e.last_name) AS employee
      FROM employees e
      LEFT JOIN employees m ON e.manager_id = m.id
      ORDER BY manager`,
    (err, res) => {
      if (err) throw err;
      console.table(res);
      menu();
    }
  );
}

// Add Employee //

function addEmployee() {
  // Retrieve roles from the database to be used in the prompt.
  const sql = "SELECT * FROM roles";
  connection.query(sql, async (err, results) => {
    if (err) throw err;

    const roles = results.map((result) => ({
      name: result.title,
      value: result.id,
    }));

    // Prompt the user for employee details.
    const employeeData = await inquirer.prompt([
      {
        type: "input",
        name: "first_name",
        message: "What is the employee's first name?",
      },
      {
        type: "input",
        name: "last_name",
        message: "What is the employee's last name?",
      },
      {
        type: "list",
        name: "role_id",
        message: "What is the employee's role?",
        choices: roles,
      },
      {
        type: "input",
        name: "manager_id",
        message: "What is the employee's manager ID?",
      },
    ]);

    // Insert the new employee into the database.
    const sql =
      "INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)";
    const params = [
      employeeData.first_name,
      employeeData.last_name,
      employeeData.role_id,
      employeeData.manager_id,
    ];

    connection.query(sql, params, (err, result) => {
      if (err) throw err;

      console.log("Employee added successfully.");
      menu();
    });
  });
}
