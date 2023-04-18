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
        case "Add role": // <---- Here
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

// View All Employees //

function viewAllEmployees() {
  connection.query("SELECT * FROM employees", function (err, res) {
    if (err) throw err;
    console.table(res);
    menu();
  });
}

// View Employees By Department //

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

// View Employees By Manager //

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

// Remove Employee //

function removeEmployee() {
  // Get a list of all employees from the database
  connection.query("SELECT * FROM employees", (err, results) => {
    if (err) throw err;

    // Prompt the user to select an employee to remove
    inquirer
      .prompt([
        {
          type: "list",
          name: "employeeId",
          message: "Which employee would you like to remove?",
          choices: results.map((employee) => ({
            name: `${employee.first_name} ${employee.last_name}`,
            value: employee.id,
          })),
        },
      ])
      .then((answer) => {
        // Execute the DELETE query to remove the selected employee
        connection.query(
          "DELETE FROM employees WHERE id = ?",
          [answer.employeeId],
          (err, results) => {
            if (err) throw err;
            console.log("Employee removed successfully!");
            // Display the main menu
            menu();
          }
        );
      });
  });
}

// Update Employee Role //

function updateEmployeeRole() {
  connection.query("SELECT * FROM employees", (err, results) => {
    if (err) throw err;

    inquirer
      .prompt([
        {
          name: "employeeId",
          type: "list",
          message: "Select the employee you want to update:",
          choices: () =>
            results.map((employee) => ({
              name: `${employee.first_name} ${employee.last_name}`,
              value: employee.id,
            })),
        },
        {
          name: "roleId",
          type: "list",
          message: "Select the new role for the employee:",
          choices: getRoleChoices,
        },
      ])
      .then((answer) => {
        connection.query(
          "UPDATE employees SET role_id = ? WHERE id = ?",
          [answer.roleId, answer.employeeId],
          (err, result) => {
            if (err) throw err;
            console.log("Employee role updated successfully!");
            menu();
          }
        );
      });
  });
}

function getRoleChoices() {
  return new Promise((resolve, reject) => {
    connection.query("SELECT * FROM roles", (err, results) => {
      if (err) reject(err);
      resolve(results.map((role) => ({ name: role.title, value: role.id })));
    });
  });
}

// Update Employee Manager //

function updateEmployeeManager() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "employeeId",
        message:
          "Enter the ID of the employee you want to update the manager for:",
      },
      {
        type: "input",
        name: "managerId",
        message: "Enter the ID of the new manager for the employee:",
      },
    ])
    .then((answer) => {
      connection.query(
        "UPDATE employees SET manager_id = ? WHERE id = ?",
        [answer.managerId, answer.employeeId],
        (err, res) => {
          if (err) throw err;
          console.log("Employee manager updated successfully");
          menu();
        }
      );
    });
}

// View All Roles //

function viewAllRoles() {
  connection.query("SELECT * FROM roles", (err, res) => {
    if (err) throw err;
    console.log("All roles:");
    console.table(res);
    menu();
  });
}

// Add Role //

function addRole() {
  inquirer.prompt([
    {
      type: 'input',
      name: 'title',
      message: 'What is the title of the new role?'
    },
    {
      type: 'input',
      name: 'salary',
      message: 'What is the salary for the new role?'
    },
    {
      type: 'input',
      name: 'department',
      message: 'What is the department ID for the new role?'
    }
  ]).then((answers) => {
    connection.query(
      'INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?)',
      [answers.title, answers.salary, answers.department],
      (err, res) => {
        if (err) throw err;
        console.log(`${answers.title} role has been added.`);
        menu();
      }
    );
  });
}


// Remove Role //

function removeRole() {
  // Query the database to get the list of roles
  connection.query("SELECT * FROM roles", (err, results) => {
    if (err) throw err;

    // Extract the role names from the results
    const roleNames = results.map((role) => role.title);

    // Prompt the user to select a role to remove
    inquirer
      .prompt([
        {
          type: "list",
          name: "role",
          message: "Select a role to remove:",
          choices: roleNames,
        },
      ])
      .then((answer) => {
        // Execute a DELETE query to remove the selected role from the database
        connection.query(
          "DELETE FROM roles WHERE ?",
          { title: answer.role },
          (err) => {
            if (err) throw err;
            console.log(`Successfully removed role: ${answer.role}`);
            // Call the menu function to display the main menu after removing the role
            menu();
          }
        );
      });
  });
}

