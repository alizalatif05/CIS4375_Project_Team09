USE MilitiaProtection;

CREATE TABLE IF NOT EXISTS User (
    UserID INT PRIMARY KEY AUTO_INCREMENT,
    User_fName VARCHAR(255) NOT NULL,
    User_lName VARCHAR(255) NOT NULL,
    UserPassword VARCHAR(255) NOT NULL,
    Username VARCHAR(255) UNIQUE NOT NULL,
    Deleted ENUM('Yes', 'No') DEFAULT 'No',
    UserType VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS Inventory (
    SKU_Number INT PRIMARY KEY AUTO_INCREMENT,
    ItemName VARCHAR(255) NOT NULL,
    Item_Desc TEXT,
    Item_Quantity INT NOT NULL CHECK (Item_Quantity >= 0),
    Deleted ENUM('Yes', 'No') DEFAULT 'No'
);

CREATE TABLE IF NOT EXISTS Customer (
    CustomerID INT PRIMARY KEY AUTO_INCREMENT,
    Customer_fName VARCHAR(255) NOT NULL,
    Customer_lName VARCHAR(255) NOT NULL,
    CustomerAddress VARCHAR(255) NOT NULL,
    CustomerPhone VARCHAR(20) NOT NULL,
    Deleted ENUM('Yes', 'No') DEFAULT 'No'
);

CREATE TABLE IF NOT EXISTS Technician (
    TechID INT PRIMARY KEY AUTO_INCREMENT,
    UserID INT,
    Tech_fName VARCHAR(255) NOT NULL,
    Tech_lName VARCHAR(255) NOT NULL,
    Deleted ENUM('Yes', 'No') DEFAULT 'No',
    FOREIGN KEY (UserID) REFERENCES User(UserID) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS SalesRep (
    SalesRepID INT PRIMARY KEY AUTO_INCREMENT,
    UserID INT,
    SalesRep_fName VARCHAR(255) NOT NULL,
    SalesRep_lName VARCHAR(255) NOT NULL,
    Deleted ENUM('Yes', 'No') DEFAULT 'No',
    FOREIGN KEY (UserID) REFERENCES User(UserID) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Admin (
    AdminID INT PRIMARY KEY AUTO_INCREMENT,
    UserID INT,
    Admin_fName VARCHAR(255) NOT NULL,
    Admin_lName VARCHAR(255) NOT NULL,
    FOREIGN KEY (UserID) REFERENCES User(UserID) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `Order` (
    OrderID INT PRIMARY KEY AUTO_INCREMENT,
    CustomerID INT NOT NULL,
    TechID INT NOT NULL,
    SalesRepID INT NOT NULL,
    Deleted ENUM('Yes', 'No') DEFAULT 'No',
    FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID) ON DELETE CASCADE,
    FOREIGN KEY (TechID) REFERENCES Technician(TechID) ON DELETE CASCADE,
    FOREIGN KEY (SalesRepID) REFERENCES SalesRep(SalesRepID) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS OrderItems (
    SKU_Number INT NOT NULL,
    OrderID INT NOT NULL,
    Deleted ENUM('Yes', 'No') DEFAULT 'No',
    PRIMARY KEY (SKU_Number, OrderID),
    FOREIGN KEY (SKU_Number) REFERENCES Inventory(SKU_Number) ON DELETE CASCADE,
    FOREIGN KEY (OrderID) REFERENCES `Order`(OrderID) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS TechInventory (
    SKU_Number INT NOT NULL,
    TechID INT NOT NULL,
    Deleted ENUM('Yes', 'No') DEFAULT 'No',
    PRIMARY KEY (SKU_Number, TechID),
    FOREIGN KEY (SKU_Number) REFERENCES Inventory(SKU_Number) ON DELETE CASCADE,
    FOREIGN KEY (TechID) REFERENCES Technician(TechID) ON DELETE CASCADE
);
