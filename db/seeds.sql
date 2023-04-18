
INSERT INTO departments (name)
VALUES  ('Sales'),
        ('Engineering'),
        ('Finance'),
        ('Human Resources');

INSERT INTO roles (title, salary, department_id)
VALUES  ('Sales Lead', 100000.00, 1),
        ('Salesperson', 80000.00, 1),
        ('Lead Engineer', 150000.00, 2),
        ('Software Engineer', 120000.00, 2),
        ('Lead Accountant', 125000.00, 3),
        ('Accountant', 100000.00, 3),
        ('Human Resources', 90000.00, 4);

INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES  ('Michael', 'Scott', 1, NULL),
        ('Jim', 'Halpert', 1, 1),
        ('Kelly', 'Kapoor', 2, 1),
        ('Ryan', 'Howard', 2, 3),
        ('Angela', 'Martin', 3, 1),
        ('Kevin', 'Malone', 3, 5),
        ('Toby', 'Flenderson', 4, NULL);