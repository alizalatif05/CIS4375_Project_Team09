CREATE DATABASE militiaprotection;
USE militiaprotection;

CREATE TABLE IF NOT EXISTS User (
    UserID INT PRIMARY KEY AUTO_INCREMENT,
    User_fName VARCHAR(255) NOT NULL,
    User_lName VARCHAR(255) NOT NULL,
    UserPassword VARCHAR(255) NOT NULL,
    Username VARCHAR(255) UNIQUE NOT NULL,
    Deleted ENUM('Yes', 'No') DEFAULT 'No',
    UserType VARCHAR(50) NOT NULL
);

INSERT INTO User (User_fName, User_lName, UserPassword, Username, UserType) VALUES 
('John', 'Admin', 'admin123', 'admin', 'admin'),
('Sarah', 'Tech', 'tech123', 'technician1', 'technician'),
('Mark', 'Sales', 'sales123', 'salesrep1', 'sales'),
('Linda', 'User', 'user123', 'user1', 'standard');

CREATE TABLE IF NOT EXISTS Inventory (
    SKU_Number INT PRIMARY KEY AUTO_INCREMENT,
    ItemName VARCHAR(255) NOT NULL,
    Item_Desc TEXT,
    Item_Quantity INT,
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

INSERT INTO Customer (Customer_fName, Customer_lName, CustomerAddress, CustomerPhone) VALUES 
('Robert', 'Johnson', '123 Main St, Anytown, USA', '555-123-4567'),
('Jennifer', 'Smith', '456 Oak Ave, Springfield, USA', '555-987-6543'),
('Michael', 'Williams', '789 Pine Rd, Liberty, USA', '555-456-7890');

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
    DateCreated DATETIME DEFAULT CURRENT_TIMESTAMP,
    DateAssigned DATETIME NULL,
    DateCompleted DATETIME NULL,
    LastModified DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID) ON DELETE CASCADE,
    FOREIGN KEY (TechID) REFERENCES Technician(TechID) ON DELETE CASCADE,
    FOREIGN KEY (SalesRepID) REFERENCES SalesRep(SalesRepID) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS OrderItems (
    SKU_Number INT NOT NULL,
    OrderID INT NOT NULL,
    QTY INT,
    Deleted ENUM('Yes', 'No') DEFAULT 'No',
    DateAdded DATETIME DEFAULT CURRENT_TIMESTAMP,
    DateUsed DATETIME NULL,
    PRIMARY KEY (SKU_Number, OrderID),
    FOREIGN KEY (SKU_Number) REFERENCES Inventory(SKU_Number) ON DELETE CASCADE,
    FOREIGN KEY (OrderID) REFERENCES `Order`(OrderID) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS TechInventory (
    SKU_Number INT NOT NULL,
    TechID INT NOT NULL,
    QTY INT,
    Deleted ENUM('Yes', 'No') DEFAULT 'No',
    PRIMARY KEY (SKU_Number, TechID),
    FOREIGN KEY (SKU_Number) REFERENCES Inventory(SKU_Number) ON DELETE CASCADE,
    FOREIGN KEY (TechID) REFERENCES Technician(TechID) ON DELETE CASCADE
);

INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('1000ft CAT5e Cable', NULL, 0);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('1000ft CAT6', NULL, 26);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('1000ft CAT6a Wire', NULL, 1);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('1000ft CAT6 Plenum Wire', NULL, 1);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('1000ft RG59 Black', NULL, 4);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('100ft HDMI', NULL, 0);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('100 Watt 6.5" Flush Ceiling Speaker', NULL, 16);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('10 Port POE Switch', NULL, 12);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('10tb HDD', NULL, -2);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('16ch DVR w/ HDD', NULL, -1);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('16 Port Ethernet Switch', NULL, 1);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('18ch Power Supply 20 amp', NULL, 2);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('18-port gigabit, with 16-port PoE+', NULL, 1);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('22/2 WIRE', NULL, 30);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('25ft HDMI', NULL, 0);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('2gig cell only', NULL, 3);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('2gig Edge Panel', NULL, 3);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('2gig Edge Remote Panel', NULL, 2);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('2gig GC2e Panel', NULL, 0);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('2gig GC2e Wireless Sensors', NULL, 30);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('2gig GC2 Panel', NULL, 4);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('2gig GC2 Wireless Recess Sensor', NULL, 13);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('2gig Glassbreak', NULL, 18);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('2gig Keyfob', NULL, 9);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('2gig Panic Button', NULL, 4);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('2gig Transciever', NULL, 3);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('2gig TS1', NULL, 1);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('2gig Wireless Motion', NULL, 9);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('2gig Wireless Smoke', NULL, 11);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('2mp 24/7 Camera', NULL, 5);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('2mp Black Camera LTS', NULL, 0);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('2mp Bullet Cameras', NULL, 0);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('2mp Bullet Starlight Camera', NULL, 3);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('2mp Matrix Camera', NULL, 0);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('2mp White Camera', NULL, -55);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('2TB HDD', NULL, 2);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('32ch DVR with 8tb HDD', NULL, 3);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('32 Ch LTS Pro X NVR', NULL, 0);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('48 Port TP Link POE Switch', NULL, -1);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('4CH DVR 1 TB HDD', NULL, 11);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('4ch LTS DVR', NULL, -21);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('4k 4ch DVR', NULL, 0);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('4k NVR 8CH', NULL, -1);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('4mp 24/7 Bullet POE Camera', NULL, 1);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('4mp 24/7 With Mic POE Camera', NULL, 40);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('4mp LTS ProX Full Color POE Camera', NULL, -5);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('4mp Matrix Black POE Camera', NULL, 1);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('4mp Matrix White POE Camera', NULL, 1);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('4mp TURRET VC', NULL, 2);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('4mp With Mic POE Camera', NULL, 4);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('500ft Access Control Banana Wire', NULL, 2);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('500ft Black RG59 Wire', NULL, -2);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('500ft White RG59 Wire', NULL, 3);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('50ft CAT 5', NULL, 0);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('50ft HDMI', NULL, 0);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('52 port gigabit with 48 port PoE+', NULL, 2);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('5 AMP Power Supply', NULL, -1);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('5mp 24/7 Bullet Camera', NULL, 3);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('5mp 24/7 Turret Camera', NULL, 5);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('5MP DVR Camera With Mic', NULL, 14);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('5mp Turret Camera', NULL, 1);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('6150 Keypad', NULL, 0);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('620 Brass Deadbolt', NULL, 2);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('620 Bronze Deadbolt', NULL, 21);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('620 Chrome Deadbolt', NULL, 6);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('620 Nickle Deadbolt', NULL, 27);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('6 Plug Power Strip', NULL, 9);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('7.2 CH Surround Sound Reciever', NULL, 1);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('8ch 2mp DVR', NULL, -1);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('8ch 4k DVR', NULL, -2);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('8 CH w/ 2 HDD 2TB', NULL, 4);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('8mp LTS ProX Duo Splicing POE Camera', NULL, -7);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('8mp LTS ProX VF POE Camera', NULL, -1);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('8mp panoramic 24/7 color built in mic', NULL, 8);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('8mp POE Camera', NULL, 5);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('8mp Poe Varifocal', NULL, 2);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('912 Bronze Lever Lock', NULL, 4);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('912 Silver Lever Lock', NULL, 4);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('916 TS Bronze Deadbolt', NULL, 6);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('916 TS Silver Deadbolt', NULL, 6);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('918 chrome', NULL, 2);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('918 Matte Black', NULL, 2);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('AC ADC ET25 - 10 Digit Reader', NULL, 4);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('AC ADC Metal Expansion Box With Back Plate', NULL, 1);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('AC ADC MR50', NULL, 1);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('AC ADC MR52', NULL, -1);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('AC HES 8000C Recessed Electronic Strike', NULL, 1);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('AC HES 9400 1/2" Electric Strike', NULL, 1);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('AC HES 9600 3/4" Electric Strike', NULL, 1);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('AC HID Mini Grey Reader', NULL, 4);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('AC Proximity Cards', NULL, 67);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('ADC 128 GB SD Card', NULL, -118);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('ADC 16CH SVR 2TB', NULL, 0);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('ADC 256 GB SD Card', NULL, -4);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('ADC 512 GB SD Card', NULL, 8);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('ADC 515 Indoor Camera', NULL, 0);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('ADC 523 Indoor Camera', NULL, 36);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('ADC 622 Wellness Camera', NULL, 1);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('ADC 724 Camera', NULL, 50);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('ADC 727 POE Camera', NULL, 41);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('ADC 728 Camera', NULL, 5);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('ADC 750 DB Camera', NULL, 87);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('ADC 770 DB Camera', NULL, -52);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('ADC 827 Vandal Dome Camera', NULL, 0);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('ADC 838 Camera', NULL, 0);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('ADC Car Connect', NULL, 0);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('ADC ET10 Card Reader', NULL, -1);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('ADC Flex IO Cellular Sensor', NULL, 2);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('ADC LP 1502 Panel', NULL, 0);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('ADC Skybell II Bronze', NULL, 1);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('ADC Skybell II Silver', NULL, 1);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('ADC Smart Chime Box', NULL, 8);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('ADC Smart Water Valve', NULL, 1);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('ADC Thermostat', NULL, 6);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('ADC TS Color Thermostat', NULL, 1);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('Aeotec Smart Plug', NULL, 3);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('Battery Bank With Surge Protection', NULL, 5);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('Bosch Warehouse Motion', NULL, 4);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('CAMERA:1 TB HDD', '1 TB Hard Drive', 0);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('CAMERA:22/4 COIL WIRE', NULL, 16);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('CAMERA:2 MP TWO WAY VOICE SPOTLIGHT CAM', NULL, 1);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('CAMERA:4 CH DVR EPCOME', NULL, 7);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('CAMERA:4 MP IP CAMS FULL COLOR', NULL, 0);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('CAMERA:4 MP TURRET CAMERA', NULL, 0);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('CAMERA:4 MP VERIFOCAL CAMS', NULL, 0);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('CAMERA:ARM EXTENSIONS', NULL, 0);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('CAT5 Patch Cable', NULL, 21);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('Chamberlain 3/4HP Garage Motor', NULL, -6);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('Chime Kit', NULL, 14);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('Chime Kit Transformer', NULL, 10);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('DOOR LOCK:1200lb Double Door Maglock', NULL, 2);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('DOOR LOCK:620 Matte Black', NULL, 0);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('DSC NEO Keypad', NULL, 7);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('DSC SEM', NULL, 3);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('DVR Mic', NULL, 2);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('Epcom 2mp Camera', NULL, 32);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('Epcom 4K 4CH DVR w/ 2TB HDD', NULL, 4);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('Go Control Smart Bulb', NULL, 1);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('Hardwired Commercial Door Sensor', NULL, 9);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('Hardwired Glassbreak', NULL, -14);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('Hardwired Motion', NULL, 49);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('Hardwired Recessed Contacts (10pk)', NULL, 2);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('Hardwired Siren', NULL, 14);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('Hardwired Steel Commercial Door Sensor', NULL, 31);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('Hardwired Surface Mount Contacts (10pk)', NULL, 6);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('HDMI 10ft', NULL, 0);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('HDMI 5ft', NULL, 16);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('HDMI Extender Over CAT6', NULL, 6);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('HES 5200 Recessed Strike', NULL, 0);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('Honeywell 1625 Recessed Sensor', NULL, 1);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('Honeywell 4208U Zone Expander (Vista 15 & 20P)', NULL, 5);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('Honeywell 4219 Zone Expander (Vista 128)', NULL, 2);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('Honeywell 5800FL Flood', NULL, 3);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('Honeywell 5800 Mini Sensor', NULL, 1);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('Honeywell 5800SS Shock', NULL, 1);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('Honeywell 5815 Wireless Sensor', NULL, 1);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('Honeywell 5816 Wireless Sensor', NULL, 10);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('Honeywell 5817 Wireless Sensor', NULL, 1);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('Honeywell 5818 Wireless Recessed Sensor', NULL, 1);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('Honeywell Keyfob', NULL, 0);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('Honeywell Med Pendant', NULL, 0);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('Honeywell RF Keypad', NULL, 0);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('Honeywell SEM', NULL, -2);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('Honeywell Smoke Detector', NULL, 0);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('Honeywell Thermostat', NULL, -1);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('Honeywell Tilt Sensor', NULL, 1);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('Honeywell Vista 15p Kit', NULL, 3);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('Honeywell Wireless GB', NULL, 5);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('Honeywell Wireless Motion', NULL, 10);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('IQ 16 Zone Translator', NULL, 11);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('IQ2 Secondary Panel', NULL, 5);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('IQ4 DSC', NULL, 37);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('IQ4 Honeywell Panel', NULL, -3);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('IQ4 Panel', NULL, 97);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('IQ4 PG Remote Panel', 'Secondary Panel', 13);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('IQ A40 Shock Sensor', NULL, 1);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('IQ Keyfob', NULL, 11);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('IQ Med Pendant', NULL, 5);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('IQ Pro', NULL, 3);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('IQ Speaker Base', NULL, 1);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('IQ Tilt Sensor', NULL, 11);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('IQ Wireless Brown Sensor', NULL, 21);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('IQ Wireless Flood Sensor', NULL, 5);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('IQ Wireless Glassbreak', NULL, -2);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('IQ Wireless Motion', NULL, -2);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('IQ Wireless Shock Sensor', NULL, 1);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('IQ Wireless White Sensor', NULL, 529);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('Jasco Add On Switch', NULL, 20);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('Jasco Decora Dimming Smart Switch', NULL, 23);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('Jasco Decora Smart Switch', NULL, 18);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('Jasco Lamp Module', NULL, 22);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('Jasco Rocker Dimming Smart Switch', NULL, 18);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('Jasco Rocker Smart Switch', NULL, 13);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('Jasco Smart Light Bulb', NULL, 0);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('JUNCTION BOX', NULL, 12);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('MyQ Garage Opener', NULL, -1);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('OH Door Presure Plate Sensor', NULL, 19);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('OH Door Rail Mount Sensor', NULL, 0);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('Overhead Rail Sensor', NULL, 0);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('Panel Battery 5 AMP', NULL, 35);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('Panel Battery 7 AMP', NULL, 13);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('PG 8 Zone Expansion Board', NULL, -1);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('PG 9303 Wiress Sensor', NULL, 85);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('PG 9911 Siren With Strobe', NULL, 7);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('PG 9914 Wireless Motion', 'PG Motion Pet Immune', 41);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('PG 9922 Wireless GB', NULL, 171);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('PG 9936 Wireless Smoke', NULL, 37);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('PG 9945 HW To Wireless Sensor', NULL, 31);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('PG 9985 Flood Sensor', 'Wireless Glassbreak', 4);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('PG 9HRDW* Commercial Panel', NULL, 1);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('RE508X', NULL, 20);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('RE524X', NULL, 9);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('Recessed Daylight Lights', NULL, 12);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('Recessed Smart Lights', NULL, 22);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('Sansi D to D Spot Light', NULL, 3);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('Sansi Motion Spot Light', NULL, 5);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('Sansi Switch Spot Light', NULL, 5);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('Star Link Fire Cell Unit', NULL, 0);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('Surround Sound Vol Control', NULL, 9);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('Telgard TG1 Express Cell', NULL, 0);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('Telgard TG7 Fire Cell', NULL, 0);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('TP Link WiFi Ext', NULL, 13);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('TP Nano Antenna', NULL, 2);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('Ubiquiti Nano Antenna', NULL, 1);
INSERT INTO Inventory (ItemName, Item_Desc, Item_Quantity)
VALUES ('Z-Wave Garage Module', NULL, 5); 