'use strict';
/**
 * Seed script: creates missing tables and inserts all data from the local DB dump
 * into the Aiven MySQL database. Safe to re-run (uses INSERT IGNORE).
 *
 * Usage:  node seeders/seed-from-dump.js
 */
require('dotenv').config();
const fs   = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');

// ── SSL ────────────────────────────────────────────────────────────────────
const caPemPath = path.resolve(__dirname, '..', 'ca.pem');
const dialectOptions = fs.existsSync(caPemPath)
  ? { ssl: { rejectUnauthorized: true, ca: fs.readFileSync(caPemPath).toString() } }
  : {};

const sequelize = new Sequelize(
  process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS,
  { host: process.env.DB_HOST, port: Number(process.env.DB_PORT) || 3306,
    dialect: 'mysql', dialectOptions, logging: false }
);

const q = (sql) => sequelize.query(sql, { raw: true });

// ── Main ───────────────────────────────────────────────────────────────────
async function run() {
  await sequelize.authenticate();
  console.log('✔  Connected to Aiven DB');
  await q('SET FOREIGN_KEY_CHECKS = 0');

  /* ═══════════════════════════════════════════════════════════════
     1. USERS  (migration created "Users", model uses "users" –
        we keep both in sync by inserting into Users)
  ═══════════════════════════════════════════════════════════════ */
  await q(`CREATE TABLE IF NOT EXISTS \`Users\` (
    id int NOT NULL AUTO_INCREMENT, first_name varchar(255),
    last_name varchar(255), email varchar(255), password varchar(255),
    googleId varchar(255), isAdmin tinyint(1),
    createdAt datetime NOT NULL, updatedAt datetime NOT NULL,
    PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  await q(`INSERT IGNORE INTO \`Users\`
    (id,first_name,last_name,email,password,googleId,isAdmin,createdAt,updatedAt) VALUES
    (1,'Maheesha','Nidushani','maheeshaecc18@gmail.com','$2b$10$7tfNLl5keoGmhQdVDlSM2.fifdB2uZP.0QGLoBY6EBhWEhfelGxg.',NULL,0,'2026-05-02 09:28:44','2026-05-02 09:28:44'),
    (2,'dimuthu','tharuka','dimuthu@gmail.com','$2b$10$JDzrMgPmI/U7.cMRW0tQIOcXisJdYf1jetIu9LMSoV9RGBrORmhoC',NULL,0,'2026-05-02 16:50:26','2026-05-02 16:50:26'),
    (3,'Admin','User','admin@gmail.com','admin123',NULL,1,'2026-05-02 22:28:42','2026-05-02 22:28:42'),
    (4,'John','Doe','john1@gmail.com','pass123',NULL,0,'2026-05-04 21:01:12','2026-05-04 21:01:12'),
    (5,'Jane','Smith','jane1@gmail.com','pass123',NULL,0,'2026-05-04 21:01:12','2026-05-04 21:01:12'),
    (6,'Michael','Brown','michael@gmail.com','pass123',NULL,0,'2026-05-04 21:01:12','2026-05-04 21:01:12'),
    (7,'Emily','Davis','emily@gmail.com','pass123',NULL,0,'2026-05-04 21:01:12','2026-05-04 21:01:12'),
    (8,'Daniel','Wilson','daniel@gmail.com','pass123',NULL,0,'2026-05-04 21:01:12','2026-05-04 21:01:12'),
    (9,'Olivia','Taylor','olivia@gmail.com','pass123',NULL,0,'2026-05-04 21:01:12','2026-05-04 21:01:12'),
    (10,'Matthew','Anderson','matthew@gmail.com','pass123',NULL,0,'2026-05-04 21:01:12','2026-05-04 21:01:12'),
    (11,'Sophia','Thomas','sophia@gmail.com','pass123',NULL,0,'2026-05-04 21:01:12','2026-05-04 21:01:12'),
    (12,'David','Jackson','david@gmail.com','pass123',NULL,0,'2026-05-04 21:01:12','2026-05-04 21:01:12'),
    (13,'Isabella','White','isabella@gmail.com','pass123',NULL,1,'2026-05-04 21:01:12','2026-05-04 21:01:12'),
    (16,'Shasidu','Lakshan','shasi@gmail.com','$2b$10$rEo235kbabYULtoQK50E7O7vph7j.pfHbMvqhgLoeBQ0ggYM1k3q6',NULL,0,'2026-05-06 15:30:22','2026-05-06 15:30:22'),
    (17,'kalidu','dahanayaka','kali@gmail.com','$2b$10$I0u3Hrp2L3YsayTWOBS2j.acPwZkXwvLrRfXfbWTQS9iarjrz5xXi',NULL,0,'2026-05-06 15:34:20','2026-05-06 15:34:20'),
    (18,'Chavi','Nisha','chavinisha12@gmail.com',NULL,'102495407217672568079',0,'2026-05-06 15:47:56','2026-05-06 15:47:56'),
    (19,'clikk','12','clikk136@gmail.com',NULL,'107442422009831204813',0,'2026-05-06 20:39:52','2026-05-06 20:39:52'),
    (20,'Chanudi','Sihansa','chanu@gmail.com','$2b$10$aKE6Yw8q0VEyfqcVYgtE1efquwUzNBAh0BrBlleCWFvS33dlEcWpu',NULL,0,'2026-05-07 23:56:42','2026-05-07 23:56:42'),
    (21,'navodya','hansini','navodya@gmail.com','$2b$10$lYFLWKDOnM54V/xy2gt3cuPDDUCqEe8dq1R6J1asmvgAvGsEt8m6W',NULL,0,'2026-05-08 00:11:19','2026-05-08 00:11:19'),
    (22,'tanushi','dilrangani','tanushi@gmail.com','$2b$10$p.xTBlVmt4uFXBNhPUnIwuECIH4H.D7jEJ7aXFHLRd5T4rOiG8vAq',NULL,0,'2026-05-08 00:14:23','2026-05-08 00:14:23'),
    (23,'sadun','bagya','sadun@gmail.com','$2b$10$B6UOo3g08uAFHXuo1an1lu2CqbNcKc2ute1eK8BrMh3F4rMTW3GFW',NULL,0,'2026-05-08 00:16:01','2026-05-08 00:16:01'),
    (24,'rashmika','nilupul','nilupul@gmail.com','$2b$10$ysHhDQVPDJ8h0RK4pap6DOw9sKzLn6EaLdKpEMmoDItdusXaAkWFS',NULL,0,'2026-05-08 00:17:41','2026-05-08 00:17:41'),
    (25,'senith','sasi','senith@gmail.com','$2b$10$w4lxVPYi3Ijwprata9jbEOIdjtro4iqvqHUuN2qBw48pUR9JDe3/.',NULL,0,'2026-05-08 00:19:11','2026-05-08 00:19:11'),
    (26,'Gayan','madushanka','gayan@gmail.com','$2b$10$TpRU20BgITUXUpxoB2OK2eFWOnZrFvYc0WzVzwXka2KQsNycAq3ma',NULL,0,'2026-05-23 16:24:44','2026-05-23 16:24:44')`);
  console.log('✔  Users');

  /* ═══════════════════════════ 2. CATEGORIES ══════════════════════════════ */
  await q(`CREATE TABLE IF NOT EXISTS \`categories\` (
    id int NOT NULL AUTO_INCREMENT, name varchar(50) NOT NULL,
    createdAt datetime NOT NULL, updatedAt datetime NOT NULL,
    PRIMARY KEY (id), UNIQUE KEY name (name)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  await q(`INSERT IGNORE INTO \`categories\` (id,name,createdAt,updatedAt) VALUES
    (2,'shirts','2026-05-04 21:18:22','2026-05-04 21:18:22'),
    (3,'shorts','2026-05-04 21:18:22','2026-05-04 21:18:22'),
    (4,'pants','2026-05-04 21:18:22','2026-05-04 21:18:22'),
    (5,'denims','2026-05-04 21:18:22','2026-05-04 21:18:22'),
    (6,'tshirts','2026-05-04 21:18:22','2026-05-04 21:18:22'),
    (7,'arm cuts','2026-05-04 21:18:22','2026-05-04 21:18:22'),
    (8,'hoodie','2026-05-04 21:18:22','2026-05-04 21:18:22'),
    (9,'long sleeves','2026-05-04 21:18:22','2026-05-04 21:18:22'),
    (10,'accessories','2026-05-04 21:18:22','2026-05-04 21:18:22')`);
  console.log('✔  categories');

  /* ═══════════════════════════ 3. PRODUCTS ════════════════════════════════ */
  await q(`CREATE TABLE IF NOT EXISTS \`products\` (
    id int NOT NULL AUTO_INCREMENT, name varchar(255), description text,
    price decimal(10,2), categoryId int,
    createdAt datetime NOT NULL, updatedAt datetime NOT NULL,
    PRIMARY KEY (id), KEY categoryId (categoryId),
    CONSTRAINT products_cat_fk FOREIGN KEY (categoryId) REFERENCES \`categories\` (id) ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  await q(`INSERT IGNORE INTO \`products\` (id,name,description,price,categoryId,createdAt,updatedAt) VALUES
    (1,'Printed shirts','Stylish printed shirts for casual wear',2250.00,2,'2026-05-05 15:06:13','2026-05-05 15:06:13'),
    (2,'Striped lin','Lightweight striped shirt for everyday comfort',2800.00,2,'2026-05-05 15:06:13','2026-05-05 15:06:13'),
    (3,'Striped linen','Breathable linen striped shirt',2800.00,2,'2026-05-05 15:06:13','2026-05-05 15:06:13'),
    (4,'Striped shirt','Classic striped shirt design',2800.00,2,'2026-05-05 15:06:13','2026-05-05 15:06:13'),
    (5,'Two tone shirt','Modern two-tone shirt',2850.00,2,'2026-05-05 15:06:13','2026-05-05 15:06:13'),
    (6,'Linen print shirt','Printed linen shirt for a stylish look',2650.00,2,'2026-05-05 15:06:13','2026-05-05 15:06:13'),
    (7,'Plain linen shirt','Minimal plain linen shirt',2800.00,2,'2026-05-05 15:06:13','2026-05-05 15:06:13'),
    (8,'Acid wash shirt','Vintage acid wash shirt',2900.00,2,'2026-05-05 15:06:13','2026-05-05 15:06:13'),
    (9,'Cuban collar shirt','Relaxed Cuban collar shirt',2600.00,2,'2026-05-05 15:06:13','2026-05-05 15:06:13'),
    (10,'Denim pocket shorts','Denim shorts with multiple pockets',2400.00,3,'2026-05-05 15:06:13','2026-05-05 15:06:13'),
    (11,'Acid wash denim shorts','Stylish acid wash denim shorts',2300.00,3,'2026-05-05 15:06:13','2026-05-05 15:06:13'),
    (12,'Denim patch short','Denim shorts with patch design',2300.00,3,'2026-05-05 15:06:13','2026-05-05 15:06:13'),
    (13,'Cargo pants','Utility cargo pants with pockets',3200.00,4,'2026-05-05 15:06:13','2026-05-05 15:06:13'),
    (14,'Print cargo pant','Printed cargo pants',2950.00,4,'2026-05-05 15:06:13','2026-05-05 15:06:13'),
    (15,'Cargo pocket pant','Cargo pants with extra pockets',3200.00,4,'2026-05-05 15:06:13','2026-05-05 15:06:13'),
    (16,'Plain denim','Classic plain denim jeans',4200.00,5,'2026-05-05 15:06:13','2026-05-05 15:06:13'),
    (17,'Big fold denim','Denim with big fold style',4200.00,5,'2026-05-05 15:06:13','2026-05-05 15:06:13'),
    (18,'Big fold denim trouser','Folded denim trousers',4200.00,5,'2026-05-05 15:06:13','2026-05-05 15:06:13'),
    (19,'Knee patch denim','Denim with knee patch design',4250.00,5,'2026-05-05 15:06:13','2026-05-05 15:06:13'),
    (20,'Denim side pocket','Denim with side pockets',4600.00,5,'2026-05-05 15:06:13','2026-05-05 15:06:13'),
    (21,'Ash color plain denim','Ash color denim jeans',4200.00,5,'2026-05-05 15:06:13','2026-05-05 15:06:13'),
    (22,'Black plain denim','Black denim jeans',4200.00,5,'2026-05-05 15:06:13','2026-05-05 15:06:13'),
    (23,'Denim full patch trousers','Full patch denim trousers',4300.00,5,'2026-05-05 15:06:13','2026-05-05 15:06:13'),
    (24,'Pocket denim trouser','Denim trousers with pockets',4600.00,5,'2026-05-05 15:06:13','2026-05-05 15:06:13'),
    (25,'Zip collar line','T-shirt with zip collar design',2700.00,6,'2026-05-05 15:06:13','2026-05-05 15:06:13'),
    (26,'Hot wheel collar t shirt','Graphic collar t-shirt',2850.00,6,'2026-05-05 15:06:13','2026-05-05 15:06:13'),
    (27,'Emirates acid wash','Acid wash t-shirt style',2000.00,6,'2026-05-05 15:06:13','2026-05-05 15:06:13'),
    (28,'Two tone edge t shirt','Two tone modern t-shirt',2400.00,6,'2026-05-05 15:06:13','2026-05-05 15:06:13'),
    (29,'Click collar t shirt','Collar style t-shirt',1950.00,6,'2026-05-05 15:06:13','2026-05-05 15:06:13'),
    (30,'Back print t shirt','T-shirt with back print',2690.00,6,'2026-05-05 15:06:13','2026-05-05 15:06:13'),
    (31,'Puff back print','Puff print t-shirt design',2350.00,6,'2026-05-05 15:06:13','2026-05-05 15:06:13'),
    (32,'Click white collar t shirt','White collar t-shirt',2200.00,6,'2026-05-05 15:06:13','2026-05-05 15:06:13'),
    (33,'Striped t shirt','Striped casual t-shirt',2100.00,6,'2026-05-05 15:06:13','2026-05-05 15:06:13'),
    (34,'Puff print t shirt','Puff print styled t-shirt',2250.00,6,'2026-05-05 15:06:13','2026-05-05 15:06:13'),
    (35,'Unisex t shirt (2000)','Unisex t-shirt basic',2000.00,6,'2026-05-05 15:06:13','2026-05-05 15:06:13'),
    (36,'Unisex t shirt (2250)','Unisex t-shirt premium',2250.00,6,'2026-05-05 15:06:13','2026-05-05 15:06:13'),
    (37,'Front print t shirt','Front print t-shirt',2250.00,6,'2026-05-05 15:06:13','2026-05-05 15:06:13'),
    (38,'Lufa outfit t shirt','Stylish outfit t-shirt',2400.00,6,'2026-05-05 15:06:13','2026-05-05 15:06:13'),
    (39,'Arm cuts','Sleeveless arm cut shirt',500.00,7,'2026-05-05 15:06:13','2026-05-05 15:06:13'),
    (40,'Adidas hoodie','Warm Adidas style hoodie',3000.00,8,'2026-05-05 15:06:13','2026-05-05 15:06:13'),
    (41,'Nike hoodie','Comfortable Nike style hoodie',2800.00,8,'2026-05-05 15:06:13','2026-05-05 15:06:13'),
    (42,'Harly long sleeve','Long sleeve casual shirt',2800.00,9,'2026-05-05 15:06:13','2026-05-05 15:06:13'),
    (43,'Half zip full sleeve','Half zip full sleeve shirt',3200.00,9,'2026-05-05 15:06:13','2026-05-05 15:06:13'),
    (44,'Cap','Casual wear cap',1000.00,10,'2026-05-05 15:06:13','2026-05-05 15:06:13')`);
  console.log('✔  products');

  /* ═══════════════════════════ 4. PRODUCT_VARIANTS ════════════════════════ */
  await q(`CREATE TABLE IF NOT EXISTS \`product_variants\` (
    id int NOT NULL AUTO_INCREMENT, productId int NOT NULL,
    size varchar(10) NOT NULL, color varchar(30) NOT NULL,
    quantity int NOT NULL DEFAULT 0, imageUrl varchar(500),
    createdAt datetime NOT NULL, updatedAt datetime NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_pv (productId,size,color),
    CONSTRAINT pv_prod_fk FOREIGN KEY (productId) REFERENCES \`products\` (id) ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  // Load variants from a companion SQL file
  const variantsSQL = fs.readFileSync(path.join(__dirname, 'variants-data.sql'), 'utf8');
  // Split on semicolons to get individual INSERT statements
  const variantStmts = variantsSQL.split(';').map(s => s.trim()).filter(Boolean);
  for (const stmt of variantStmts) {
    await q(stmt);
  }
  console.log('✔  product_variants');

  /* ═══════════════════════════ 5. CUSTOMERS ═══════════════════════════════ */
  await q(`CREATE TABLE IF NOT EXISTS \`customers\` (
    id int NOT NULL AUTO_INCREMENT, userId int NOT NULL,
    first_name varchar(100) NOT NULL, last_name varchar(100) NOT NULL,
    email varchar(100) NOT NULL, address varchar(255), city varchar(100),
    district varchar(100), province varchar(100), phone varchar(20),
    createdAt datetime NOT NULL, updatedAt datetime NOT NULL,
    PRIMARY KEY (id), KEY userId (userId),
    CONSTRAINT cust_user_fk FOREIGN KEY (userId) REFERENCES \`Users\` (id) ON UPDATE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  await q(`INSERT IGNORE INTO \`customers\` (id,userId,first_name,last_name,email,address,city,district,province,phone,createdAt,updatedAt) VALUES
    (1,1,'Maheesha','Nidushani','maheeshaecc18@gmail.com','Dehiowita','Awissawella','Kegalle','Sabaragamuwa Province','0788721193','2026-05-05 00:16:31','2026-05-23 16:22:41'),
    (2,2,'dimuthu','tharuka','dimuthu@gmail.com','Dehiowita','Awissawella','Kalutara','Eastern Province','0788721193','2026-05-05 00:16:31','2026-05-23 07:14:42'),
    (3,5,'Jane','Smith','jane1@gmail.com','No 8, Lake View','Kandy','Kandy','Central','0761122334','2026-05-05 00:16:31','2026-05-05 00:16:31'),
    (4,6,'Michael','Brown','michael@gmail.com','No 77, Main Street','Galle','Galle','Southern','0759988776','2026-05-05 00:16:31','2026-05-05 00:16:31'),
    (5,9,'Olivia','Taylor','olivia@gmail.com','No 23, Beach Road','Matara','Matara','Southern','0784455667','2026-05-05 00:16:31','2026-05-05 00:16:31'),
    (6,10,'Matthew','Anderson','matthew@gmail.com','No 90, Hill Street','Nuwara Eliya','Nuwara Eliya','Central','0776677889','2026-05-05 00:16:31','2026-05-05 00:16:31'),
    (7,16,'Shasidu','Lakshan','shasi@gmail.com','No 123, Main Street','Colombo','Colombo','Western','0771234567','2026-05-06 21:36:22','2026-05-06 21:36:22'),
    (8,20,'chanudi','sihansa','chanudi@gmail.com','wadduwa','kalutara','Kalutara','Western Province','0112365987','2026-05-07 23:59:57','2026-05-08 00:52:21'),
    (9,21,'navodya','hansini','navodya@gmail.com','deraniyagala','Awissawella','Kegalle','Sabaragamuwa Province','0788721193','2026-05-08 00:24:20','2026-05-08 04:58:39'),
    (10,26,'Maheesha','nidushani','gayan@gmail.com','avissawella','colombo','Colombo','Western Province','0788721193','2026-05-24 04:52:33','2026-05-24 10:46:18')`);
  console.log('✔  customers');

  /* ═══════════════════════════ 6. ORDERS ══════════════════════════════════ */
  await q(`CREATE TABLE IF NOT EXISTS \`orders\` (
    id int NOT NULL AUTO_INCREMENT, userId int, status varchar(255) DEFAULT 'pending',
    createdAt datetime NOT NULL, updatedAt datetime NOT NULL,
    customerId int, order_number varchar(255), payment_method varchar(255),
    payment_slip varchar(255), delivery_charges decimal(10,2) DEFAULT 0.00,
    total_bill decimal(10,2), payment_status varchar(255) DEFAULT 'PENDING',
    PRIMARY KEY (id), KEY userId (userId), KEY customerId (customerId),
    CONSTRAINT ord_user_fk FOREIGN KEY (userId) REFERENCES \`Users\` (id) ON UPDATE CASCADE,
    CONSTRAINT ord_cust_fk FOREIGN KEY (customerId) REFERENCES \`customers\` (id) ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  await q(`INSERT IGNORE INTO \`orders\` (id,userId,status,createdAt,updatedAt,customerId,order_number,payment_method,payment_slip,delivery_charges,total_bill,payment_status) VALUES
    (20,1,'pending','2026-05-04 22:14:02','2026-05-07 03:12:30',1,'ORD105','Cash on Delivery',NULL,300.00,4800.00,'PENDING'),
    (21,2,'confirmed','2026-05-04 22:14:02','2026-05-07 03:12:30',2,'ORD106','Bank Transfer','slip3.jpg',300.00,6500.00,'PENDING'),
    (22,1,'shipped','2026-05-04 22:14:02','2026-05-07 03:12:30',1,'ORD107','Cash on Delivery',NULL,300.00,7300.00,'PENDING'),
    (23,2,'delivered','2026-05-04 22:14:02','2026-05-07 03:12:30',2,'ORD108','Bank Transfer','slip4.jpg',300.00,3000.00,'PENDING'),
    (24,5,'pending','2026-05-04 22:14:02','2026-05-07 03:12:30',3,'ORD109','Cash on Delivery',NULL,300.00,5500.00,'PENDING'),
    (25,6,'confirmed','2026-05-04 23:56:42','2026-05-07 03:12:30',4,'ORD110','Cash on Delivery',NULL,300.00,8600.00,'PENDING'),
    (26,6,'shipped','2026-05-04 23:56:42','2026-05-07 03:12:30',4,'ORD111','Cash on Delivery',NULL,300.00,4200.00,'PENDING'),
    (27,7,'delivered','2026-05-05 00:18:02','2026-05-24 06:58:30',7,'ORD112','Bank Transfer','slip5.jpg',300.00,9800.00,'Confirmed'),
    (28,2,'delivered','2026-05-05 00:18:02','2026-05-07 20:27:51',2,'ORD113','Cash on Delivery',NULL,0.00,5100.00,'Confirmed'),
    (29,9,'pending','2026-05-05 00:18:02','2026-05-07 03:12:30',5,'ORD114','Cash on Delivery',NULL,0.00,3700.00,'PENDING'),
    (30,10,'shipped','2026-05-05 00:18:02','2026-05-07 03:12:30',6,'ORD115','Cash on Delivery',NULL,0.00,4600.00,'PENDING'),
    (31,1,'shipped','2026-05-05 23:53:42','2026-05-07 03:12:30',1,'ORD116','Cash on Delivery',NULL,0.00,2500.00,'PENDING'),
    (32,16,'shipped','2026-05-06 21:36:22','2026-05-07 03:12:30',7,'ORD117','Cash on Delivery',NULL,0.00,9900.00,'PENDING'),
    (33,20,'pending','2026-05-07 23:59:57','2026-05-07 23:59:57',NULL,'ORD-20260508-3414','cod',NULL,500.00,3500.00,'PENDING'),
    (34,21,'pending','2026-05-08 00:24:20','2026-05-08 00:24:20',NULL,'ORD-20260508-8519','cod',NULL,500.00,6100.00,'PENDING'),
    (35,20,'pending','2026-05-08 00:52:21','2026-05-24 06:57:49',NULL,'ORD-20260508-3206','bank','https://res.cloudinary.com/dv4ubqk9d/image/upload/v1778201541/click_clothing_slips/jwbxsqj0gfxc9yuqand1.jpg',500.00,2500.00,'Cancelled'),
    (36,21,'pending','2026-05-08 04:58:39','2026-05-08 04:58:39',NULL,'ORD-20260508-8988','cod',NULL,500.00,3100.00,'PENDING'),
    (37,2,'shipped','2026-05-08 05:07:16','2026-05-08 05:10:01',NULL,'ORD-20260508-5321','cod',NULL,500.00,3300.00,'Confirmed'),
    (38,2,'delivered','2026-05-08 05:33:50','2026-05-08 05:37:59',NULL,'ORD-20260508-8581','cod',NULL,500.00,3400.00,'Confirmed'),
    (39,2,'pending','2026-05-13 17:08:50','2026-05-13 17:08:50',NULL,'ORD-20260513-2675','cod',NULL,500.00,3700.00,'PENDING'),
    (40,1,'pending','2026-05-15 02:40:27','2026-05-15 02:40:27',NULL,'ORD-20260515-5460','cod',NULL,500.00,3400.00,'PENDING'),
    (41,1,'pending','2026-05-22 14:50:31','2026-05-22 14:50:31',NULL,'ORD-20260522-5124','cod',NULL,500.00,2450.00,'PENDING'),
    (42,2,'pending','2026-05-22 14:54:50','2026-05-22 14:54:50',NULL,'ORD-20260522-8878','cod',NULL,500.00,6100.00,'PENDING'),
    (43,2,'delivered','2026-05-22 14:57:09','2026-05-22 15:01:59',NULL,'ORD-20260522-8410','cod',NULL,500.00,1500.00,'Confirmed'),
    (44,1,'pending','2026-05-23 05:31:28','2026-05-23 05:31:28',NULL,'ORD-20260523-2643','cod',NULL,500.00,6200.00,'PENDING'),
    (45,1,'pending','2026-05-23 05:56:57','2026-05-23 05:56:57',NULL,'ORD-20260523-3195','cod',NULL,500.00,3300.00,'PENDING'),
    (46,1,'pending','2026-05-23 05:59:09','2026-05-23 05:59:09',NULL,'ORD-20260523-5180','cod',NULL,500.00,5300.00,'PENDING'),
    (47,1,'pending','2026-05-23 06:04:00','2026-05-23 06:04:00',NULL,'ORD-20260523-7828','cod',NULL,500.00,4700.00,'PENDING'),
    (48,1,'pending','2026-05-23 06:06:13','2026-05-23 06:06:13',NULL,'ORD-20260523-8323','cod',NULL,500.00,3100.00,'PENDING'),
    (49,2,'delivered','2026-05-23 07:14:42','2026-05-23 12:04:41',NULL,'ORD-20260523-6911','cod',NULL,500.00,3300.00,'Confirmed'),
    (50,1,'pending','2026-05-23 13:31:59','2026-05-23 13:31:59',NULL,'ORD-20260523-9619','cod',NULL,500.00,4700.00,'PENDING'),
    (51,1,'pending','2026-05-23 14:17:13','2026-05-23 14:17:13',NULL,'ORD-20260523-8235','cod',NULL,500.00,3300.00,'PENDING'),
    (52,1,'pending','2026-05-23 16:22:41','2026-05-23 16:22:41',NULL,'ORD-20260523-4747','cod',NULL,500.00,3300.00,'PENDING'),
    (53,1,'pending','2026-05-23 16:39:01','2026-05-23 16:39:01',NULL,'ORD-20260523-9218','cod',NULL,500.00,3400.00,'PENDING'),
    (54,26,'shipped','2026-05-24 04:52:33','2026-05-24 05:03:08',NULL,'ORD-20260524-7943','cod',NULL,500.00,2850.00,'PENDING'),
    (55,26,'delivered','2026-05-24 04:57:07','2026-05-24 05:03:22',NULL,'ORD-20260524-9690','cod',NULL,500.00,2750.00,'Confirmed'),
    (56,26,'delivered','2026-05-24 05:00:37','2026-05-24 05:02:56',NULL,'ORD-20260524-2334','cod',NULL,500.00,2750.00,'Confirmed'),
    (57,1,'confirmed','2026-05-24 06:54:03','2026-05-24 09:14:44',NULL,'ORD-20260524-6605','bank','https://res.cloudinary.com/dv4ubqk9d/image/upload/v1779613997/click_clothing_slips/pcwqqcbtsznxmtkgrfws.jpg',500.00,3300.00,'Confirmed'),
    (58,26,'delivered','2026-05-24 10:09:37','2026-05-24 10:16:23',NULL,'ORD-20260524-4067','bank','https://res.cloudinary.com/dv4ubqk9d/image/upload/v1779617714/click_clothing_slips/a5cbqhjvqoyxxetgckok.jpg',500.00,3500.00,'Confirmed'),
    (59,26,'shipped','2026-05-24 10:46:18','2026-05-24 10:49:44',NULL,'ORD-20260524-1669','bank','https://res.cloudinary.com/dv4ubqk9d/image/upload/v1779619630/click_clothing_slips/fpmxuyneh9mhwlmhyuh1.jpg',400.00,3300.00,'Confirmed')`);
  console.log('✔  orders');

  /* ════════════════════════ 7. ORDER_ITEMS (migration table) ══════════════ */
  await q(`CREATE TABLE IF NOT EXISTS \`order_items\` (
    id int NOT NULL AUTO_INCREMENT, orderId int, productId int,
    size varchar(255), color varchar(255), quantity int, price decimal(10,2),
    createdAt datetime NOT NULL, updatedAt datetime NOT NULL,
    PRIMARY KEY (id), KEY orderId (orderId), KEY productId (productId),
    CONSTRAINT oi_ord_fk FOREIGN KEY (orderId) REFERENCES \`orders\` (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT oi_prod_fk FOREIGN KEY (productId) REFERENCES \`products\` (id) ON UPDATE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  await q(`INSERT IGNORE INTO \`order_items\` (id,orderId,productId,size,color,quantity,price,createdAt,updatedAt) VALUES
    (10,25,29,'M','Black',1,2250.00,'2026-05-05 00:04:08','2026-05-05 00:04:08'),
    (11,25,30,'M','Blue',1,2400.00,'2026-05-05 00:04:08','2026-05-05 00:04:08'),
    (12,26,31,'L','Black',1,2400.00,'2026-05-05 00:04:08','2026-05-05 00:04:08'),
    (13,25,29,'M','Black',1,2250.00,'2026-05-05 00:05:08','2026-05-05 00:05:08'),
    (14,25,30,'M','White',1,2800.00,'2026-05-05 00:05:08','2026-05-05 00:05:08'),
    (15,26,38,'M','Blue',1,2400.00,'2026-05-05 00:05:08','2026-05-05 00:05:08'),
    (16,20,41,'32','Black',1,3200.00,'2026-05-05 00:05:08','2026-05-05 00:05:08'),
    (17,21,44,'32','Blue',2,4200.00,'2026-05-05 00:05:08','2026-05-05 00:05:08'),
    (18,22,29,'L','Black',1,2250.00,'2026-05-05 00:05:08','2026-05-05 00:05:08'),
    (19,23,38,'M','Blue',3,2400.00,'2026-05-05 00:05:08','2026-05-05 00:05:08'),
    (20,24,41,'34','Black',1,3200.00,'2026-05-05 00:05:08','2026-05-05 00:05:08'),
    (21,31,1,'M','Black',2,2250.00,'2026-05-05 23:54:11','2026-05-05 23:54:11'),
    (22,31,2,'L','Blue',1,2400.00,'2026-05-05 23:54:11','2026-05-05 23:54:11'),
    (23,31,3,'S','Red',3,2500.00,'2026-05-05 23:54:13','2026-05-05 23:54:13'),
    (24,32,1,'M','Blue',2,2250.00,'2026-05-06 21:36:22','2026-05-06 21:36:22'),
    (25,32,2,'L','Blue',1,2400.00,'2026-05-06 21:36:22','2026-05-06 21:36:22'),
    (26,32,3,'S','LightBrown',1,2500.00,'2026-05-06 21:36:22','2026-05-06 21:36:22'),
    (27,33,40,'M','Green',1,3000.00,'2026-05-07 23:59:57','2026-05-07 23:59:57'),
    (28,34,4,'M','LightBlue',2,2800.00,'2026-05-08 00:24:20','2026-05-08 00:24:20'),
    (29,35,27,'32','Black',1,2000.00,'2026-05-08 00:52:21','2026-05-08 00:52:21'),
    (30,36,9,'M','#000000',1,2600.00,'2026-05-08 04:58:39','2026-05-08 04:58:39'),
    (31,37,7,'M','#FF0000',1,2800.00,'2026-05-08 05:07:16','2026-05-08 05:07:16'),
    (32,38,8,'M','#FFA500',1,2900.00,'2026-05-08 05:33:50','2026-05-08 05:33:50'),
    (33,39,43,'M','Black',1,3200.00,'2026-05-13 17:08:50','2026-05-13 17:08:50'),
    (34,40,8,'M','Green',1,2900.00,'2026-05-15 02:40:27','2026-05-15 02:40:27'),
    (35,41,29,'M','Brown',1,1950.00,'2026-05-22 14:50:31','2026-05-22 14:50:31'),
    (36,42,2,'S','Green',2,2800.00,'2026-05-22 14:54:50','2026-05-22 14:54:50'),
    (37,43,44,'32','Black',1,1000.00,'2026-05-22 14:57:09','2026-05-22 14:57:09'),
    (38,44,5,'M','DarkBlue',2,2850.00,'2026-05-23 05:31:28','2026-05-23 05:31:28'),
    (39,45,2,'L','Pink',1,2800.00,'2026-05-23 05:56:57','2026-05-23 05:56:57'),
    (40,46,38,'M','Blue',2,2400.00,'2026-05-23 05:59:09','2026-05-23 05:59:09'),
    (41,47,22,'M','Blue',1,4200.00,'2026-05-23 06:04:00','2026-05-23 06:04:00'),
    (42,48,9,'M','Black',1,2600.00,'2026-05-23 06:06:13','2026-05-23 06:06:13'),
    (43,49,41,'32','Black',1,2800.00,'2026-05-23 07:14:42','2026-05-23 07:14:42'),
    (44,50,21,'M','Black',1,4200.00,'2026-05-23 13:31:59','2026-05-23 13:31:59'),
    (45,51,7,'M','Green',1,2800.00,'2026-05-23 14:17:13','2026-05-23 14:17:13'),
    (46,52,2,'L','Blue',1,2800.00,'2026-05-23 16:22:41','2026-05-23 16:22:41'),
    (47,53,8,'M','Black',1,2900.00,'2026-05-23 16:39:01','2026-05-23 16:39:01'),
    (48,54,31,'L','Black',1,2350.00,'2026-05-24 04:52:33','2026-05-24 04:52:33'),
    (49,55,34,'S','Bench',1,2250.00,'2026-05-24 04:57:07','2026-05-24 04:57:07'),
    (50,56,34,'L','Black',1,2250.00,'2026-05-24 05:00:37','2026-05-24 05:00:37'),
    (51,57,4,'M','LightBlue',1,2800.00,'2026-05-24 06:54:03','2026-05-24 06:54:03'),
    (52,58,40,'M','Maroon',1,3000.00,'2026-05-24 10:09:37','2026-05-24 10:09:37'),
    (53,59,8,'M','Green',1,2900.00,'2026-05-24 10:46:18','2026-05-24 10:46:18')`);
  console.log('✔  order_items');

  /* ════════════════════════ 8. ORDER_DETAILS ══════════════════════════════ */
  await q(`CREATE TABLE IF NOT EXISTS \`order_details\` (
    id int NOT NULL AUTO_INCREMENT, orderId int NOT NULL, barcode varchar(255) NOT NULL,
    createdAt datetime NOT NULL, updatedAt datetime NOT NULL,
    PRIMARY KEY (id), KEY orderId (orderId),
    CONSTRAINT od_ord_fk FOREIGN KEY (orderId) REFERENCES \`orders\` (id) ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  await q(`INSERT IGNORE INTO \`order_details\` (id,orderId,barcode,createdAt,updatedAt) VALUES
    (21,20,'BARCODE-ORD003','2026-05-05 00:24:18','2026-05-05 00:24:18'),
    (22,21,'BARCODE-ORD004','2026-05-05 00:24:18','2026-05-05 00:24:18'),
    (23,22,'BARCODE-ORD005','2026-05-05 00:24:18','2026-05-05 00:24:18'),
    (24,23,'BARCODE-ORD006','2026-05-05 00:24:18','2026-05-05 00:24:18'),
    (25,24,'BARCODE-ORD007','2026-05-05 00:24:18','2026-05-05 00:24:18'),
    (26,25,'BARCODE-ORD001','2026-05-05 00:24:18','2026-05-05 00:24:18'),
    (27,26,'BARCODE-ORD002','2026-05-05 00:24:18','2026-05-05 00:24:18'),
    (28,32,'BARCODE-ORD-SHASIDU-001','2026-05-06 21:36:22','2026-05-06 21:36:22'),
    (29,31,'BARCODE-ORD116','2026-05-08 05:01:49','2026-05-08 05:01:49'),
    (30,30,'BARCODE-ORD115','2026-05-08 05:01:49','2026-05-08 05:01:49'),
    (31,29,'BARCODE-ORD114','2026-05-08 05:01:49','2026-05-08 05:01:49'),
    (32,28,'BARCODE-ORD113','2026-05-08 05:01:49','2026-05-08 05:01:49'),
    (33,27,'BARCODE-ORD112','2026-05-08 05:01:49','2026-05-08 05:01:49'),
    (34,33,'CKS202605082798152','2026-05-07 23:59:57','2026-05-07 23:59:57'),
    (35,34,'CKS202605086022415','2026-05-08 00:24:20','2026-05-08 00:24:20'),
    (36,35,'CKS202605089050149','2026-05-08 00:52:21','2026-05-08 00:52:21'),
    (37,36,'CKS202605088618610','2026-05-08 04:58:39','2026-05-08 04:58:39'),
    (38,37,'CKS202605088220484','2026-05-08 05:07:16','2026-05-08 05:07:16'),
    (39,38,'CKS202605082747583','2026-05-08 05:33:51','2026-05-08 05:33:51'),
    (40,39,'CKS202605139304596','2026-05-13 17:08:50','2026-05-13 17:08:50'),
    (41,40,'CKS202605159545102','2026-05-15 02:40:27','2026-05-15 02:40:27'),
    (42,41,'CKS202605223739288','2026-05-22 14:50:31','2026-05-22 14:50:31'),
    (43,42,'CKS202605228185480','2026-05-22 14:54:50','2026-05-22 14:54:50'),
    (44,43,'CKS202605224786001','2026-05-22 14:57:09','2026-05-22 14:57:09'),
    (45,44,'CKS202605232158441','2026-05-23 05:31:28','2026-05-23 05:31:28'),
    (46,45,'CKS202605234513910','2026-05-23 05:56:57','2026-05-23 05:56:57'),
    (47,46,'CKS202605231099657','2026-05-23 05:59:09','2026-05-23 05:59:09'),
    (48,47,'CKS202605233821416','2026-05-23 06:04:00','2026-05-23 06:04:00'),
    (49,48,'CKS202605230654260','2026-05-23 06:06:13','2026-05-23 06:06:13'),
    (50,49,'CKS202605235322560','2026-05-23 07:14:42','2026-05-23 07:14:42'),
    (51,50,'CKS202605233501286','2026-05-23 13:31:59','2026-05-23 13:31:59'),
    (52,51,'CKS202605239131427','2026-05-23 14:17:13','2026-05-23 14:17:13'),
    (53,52,'CKS202605236512270','2026-05-23 16:22:41','2026-05-23 16:22:41'),
    (54,53,'CKS202605230381122','2026-05-23 16:39:01','2026-05-23 16:39:01'),
    (55,54,'CKS202605246855125','2026-05-24 04:52:33','2026-05-24 04:52:33'),
    (56,55,'CKS202605246510921','2026-05-24 04:57:08','2026-05-24 04:57:08'),
    (57,56,'CKS202605243206694','2026-05-24 05:00:37','2026-05-24 05:00:37'),
    (58,57,'CKS202605247457641','2026-05-24 06:54:03','2026-05-24 06:54:03'),
    (59,58,'CKS202605241906790','2026-05-24 10:09:37','2026-05-24 10:09:37'),
    (60,59,'CKS202605244125066','2026-05-24 10:46:18','2026-05-24 10:46:18')`);
  console.log('✔  order_details');

  /* ═══════════════════════════ 9. CARTS ═══════════════════════════════════ */
  await q(`CREATE TABLE IF NOT EXISTS \`carts\` (
    id int NOT NULL AUTO_INCREMENT, userId int, productId int,
    size varchar(255), color varchar(255), quantity int DEFAULT 1,
    createdAt datetime NOT NULL, updatedAt datetime NOT NULL,
    PRIMARY KEY (id), KEY userId (userId), KEY productId (productId),
    CONSTRAINT cart_user_fk FOREIGN KEY (userId) REFERENCES \`Users\` (id) ON UPDATE CASCADE,
    CONSTRAINT cart_prod_fk FOREIGN KEY (productId) REFERENCES \`products\` (id) ON UPDATE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  await q(`INSERT IGNORE INTO \`carts\` (id,userId,productId,size,color,quantity,createdAt,updatedAt) VALUES
    (20,2,1,'L','Blue',1,'2026-05-04 04:39:56','2026-05-13 10:11:03'),
    (26,2,23,'32','Black',1,'2026-05-04 23:56:12','2026-05-04 23:56:12'),
    (30,3,44,'32','Blue',1,'2026-05-05 00:04:58','2026-05-05 00:04:58'),
    (31,19,44,'','',1,'2026-05-06 20:48:57','2026-05-06 20:48:57'),
    (35,16,1,'','',3,'2026-05-06 20:55:08','2026-05-06 21:03:25'),
    (36,16,39,'','',1,'2026-05-06 21:02:32','2026-05-06 21:02:32'),
    (37,16,8,'','',1,'2026-05-06 21:05:06','2026-05-06 21:05:06'),
    (39,16,8,'','',1,'2026-05-07 09:33:43','2026-05-07 09:33:43'),
    (44,21,6,'L','Orange',1,'2026-05-08 00:12:52','2026-05-08 00:12:52'),
    (46,22,30,'XL','Yellow',1,'2026-05-08 00:14:51','2026-05-08 00:14:51'),
    (47,22,31,'L','Lavender',1,'2026-05-08 00:15:05','2026-05-08 00:15:05'),
    (48,22,34,'L','Black',1,'2026-05-08 00:15:15','2026-05-08 00:15:15'),
    (49,23,13,'M','Badge',1,'2026-05-08 00:16:19','2026-05-08 00:16:19'),
    (50,23,43,'L','Dark Blue',1,'2026-05-08 00:16:37','2026-05-08 00:16:37'),
    (51,24,39,'L','Green',1,'2026-05-08 00:17:59','2026-05-08 00:17:59'),
    (52,25,3,'L','LightBrown',1,'2026-05-08 00:19:41','2026-05-08 00:19:41'),
    (53,25,4,'M','Maroon',1,'2026-05-08 00:20:08','2026-05-08 00:20:08'),
    (54,20,1,'','',1,'2026-05-08 00:49:02','2026-05-08 00:49:02'),
    (66,3,9,'L','Badge',1,'2026-05-23 16:20:42','2026-05-23 16:20:42'),
    (67,3,2,'L','Green',1,'2026-05-23 16:20:55','2026-05-23 16:20:55'),
    (68,26,9,'M','Badge',1,'2026-05-23 16:29:07','2026-05-23 16:29:07'),
    (69,26,6,'L','Blue',1,'2026-05-23 16:29:21','2026-05-23 16:29:21'),
    (70,26,2,'L','Blue',1,'2026-05-23 16:29:33','2026-05-23 16:29:33'),
    (71,26,4,'M','Black',1,'2026-05-24 04:31:11','2026-05-24 04:31:11'),
    (77,1,2,'M','Blue',1,'2026-05-24 06:52:25','2026-05-24 06:52:25'),
    (78,1,1,'M','Blue',1,'2026-05-24 06:52:37','2026-05-24 06:52:37')`);
  console.log('✔  carts');

  /* ═══════════════════ 10. BANK_DETAILS ══════════════════════════════════ */
  await q(`CREATE TABLE IF NOT EXISTS \`bank_details\` (
    id int NOT NULL AUTO_INCREMENT, bankName varchar(255) NOT NULL,
    accountName varchar(255) NOT NULL, accountNumber varchar(255) NOT NULL,
    branch varchar(255) NOT NULL, isActive tinyint(1) DEFAULT 1,
    createdAt datetime NOT NULL, updatedAt datetime NOT NULL,
    PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  await q(`INSERT IGNORE INTO \`bank_details\` (id,bankName,accountName,accountNumber,branch,isActive,createdAt,updatedAt) VALUES
    (1,'Bank of Ceylon','CLICK SUPER MALL PRIVATE LIMITED','94233271','Avissawella',1,'2026-05-08 05:57:33','2026-05-08 05:57:33')`);
  console.log('✔  bank_details');

  /* ═══════════════════ 11. CONTACTS ══════════════════════════════════════ */
  await q(`CREATE TABLE IF NOT EXISTS \`contacts\` (
    id int NOT NULL AUTO_INCREMENT, name varchar(255) NOT NULL,
    phone varchar(255) NOT NULL, email varchar(255) NOT NULL,
    comment text NOT NULL, createdAt datetime NOT NULL, updatedAt datetime NOT NULL,
    PRIMARY KEY (id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  await q(`INSERT IGNORE INTO \`contacts\` (id,name,phone,email,comment,createdAt,updatedAt) VALUES
    (1,'Maheesha Nidushani','+94788721193','maheeshaecc18@gmail.com','hi yaluwee','2026-05-03 06:16:26','2026-05-03 06:16:26'),
    (2,'Maheesha Nidushani','+94788721193','maheeshaecc18@gmail.com','helloo','2026-05-03 06:35:01','2026-05-03 06:35:01')`);
  console.log('✔  contacts');

  /* ═══════════════════ 12. RETURNS ════════════════════════════════════════ */
  await q(`CREATE TABLE IF NOT EXISTS \`returns\` (
    id int NOT NULL AUTO_INCREMENT, userId int, orderId int,
    reason text, createdAt datetime NOT NULL, updatedAt datetime NOT NULL,
    products json NOT NULL, productId int,
    PRIMARY KEY (id), KEY userId (userId), KEY orderId (orderId), KEY productId (productId),
    CONSTRAINT ret_user_fk FOREIGN KEY (userId) REFERENCES \`Users\` (id) ON UPDATE CASCADE,
    CONSTRAINT ret_ord_fk FOREIGN KEY (orderId) REFERENCES \`orders\` (id) ON UPDATE CASCADE,
    CONSTRAINT ret_prod_fk FOREIGN KEY (productId) REFERENCES \`products\` (id) ON DELETE SET NULL ON UPDATE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  await q(`INSERT IGNORE INTO \`returns\` (id,userId,orderId,reason,createdAt,updatedAt,products,productId) VALUES
    (1,1,20,'Size too small','2026-05-04 21:50:03','2026-05-04 21:50:03','null',NULL),
    (2,5,21,'Damaged item','2026-05-04 21:50:03','2026-05-04 21:50:03','null',NULL),
    (6,1,31,'bb','2026-05-06 07:17:56','2026-05-06 07:17:56','[{"size":"M","color":"Black","quantity":1,"productId":1},{"size":"L","color":"Blue","quantity":1,"productId":2},{"size":"S","color":"Red","quantity":1,"productId":3}]',NULL),
    (9,1,22,'customer not responding','2026-05-06 23:45:22','2026-05-06 23:45:22','[{"size":"L","color":"Black","quantity":1,"productId":29}]',NULL)`);
  console.log('✔  returns');

  /* ═══════════════════ 13. WISHLISTS ══════════════════════════════════════ */
  await q(`CREATE TABLE IF NOT EXISTS \`wishlists\` (
    id int NOT NULL AUTO_INCREMENT, userId int, productId int,
    createdAt datetime NOT NULL, updatedAt datetime NOT NULL,
    PRIMARY KEY (id), KEY userId (userId), KEY productId (productId),
    CONSTRAINT wl_user_fk FOREIGN KEY (userId) REFERENCES \`Users\` (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT wl_prod_fk FOREIGN KEY (productId) REFERENCES \`products\` (id) ON UPDATE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  await q(`INSERT IGNORE INTO \`wishlists\` (id,userId,productId,createdAt,updatedAt) VALUES
    (1,NULL,NULL,'2026-05-04 22:01:02','2026-05-04 22:01:02'),
    (2,NULL,NULL,'2026-05-04 22:01:02','2026-05-04 22:01:02'),
    (3,1,29,'2026-05-05 00:06:46','2026-05-05 00:06:46'),
    (4,1,41,'2026-05-05 00:06:46','2026-05-05 00:06:46'),
    (6,16,8,'2026-05-06 20:32:46','2026-05-06 20:32:46'),
    (8,19,44,'2026-05-06 20:40:03','2026-05-06 20:40:03'),
    (9,16,39,'2026-05-06 21:02:19','2026-05-06 21:02:19'),
    (11,20,1,'2026-05-08 00:47:43','2026-05-08 00:47:43'),
    (12,20,32,'2026-05-08 00:48:02','2026-05-08 00:48:02'),
    (13,20,27,'2026-05-08 00:48:18','2026-05-08 00:48:18'),
    (14,2,8,'2026-05-23 08:28:48','2026-05-23 08:28:48'),
    (15,2,9,'2026-05-23 08:28:51','2026-05-23 08:28:51')`);
  console.log('✔  wishlists');

  /* ═══════════════════ 14. SELECTED_ITEMS ═════════════════════════════════ */
  await q(`CREATE TABLE IF NOT EXISTS \`selected_items\` (
    id int NOT NULL AUTO_INCREMENT, userId int NOT NULL, productId int NOT NULL,
    size varchar(255), color varchar(255), price decimal(10,2) NOT NULL,
    quantity int NOT NULL DEFAULT 1, imageUrl varchar(255),
    createdAt datetime NOT NULL, updatedAt datetime NOT NULL,
    PRIMARY KEY (id), KEY userId (userId), KEY productId (productId),
    CONSTRAINT si_user_fk FOREIGN KEY (userId) REFERENCES \`Users\` (id) ON UPDATE CASCADE,
    CONSTRAINT si_prod_fk FOREIGN KEY (productId) REFERENCES \`products\` (id) ON UPDATE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  await q(`INSERT IGNORE INTO \`selected_items\` (id,userId,productId,size,color,price,quantity,imageUrl,createdAt,updatedAt) VALUES
    (33,3,44,'32','Blue',1000.00,1,'https://res.cloudinary.com/dv4ubqk9d/image/upload/v1777987804/tjlberdwy4vpdr9fk7rz.jpg','2026-05-23 16:21:05','2026-05-23 16:21:05')`);
  console.log('✔  selected_items');

  /* ═══════════════════ 15. USER_ADDRESSES ════════════════════════════════ */
  await q(`CREATE TABLE IF NOT EXISTS \`user_addresses\` (
    id int NOT NULL AUTO_INCREMENT, userId int NOT NULL,
    label varchar(100) DEFAULT 'Home', first_name varchar(100) NOT NULL,
    last_name varchar(100) NOT NULL, address varchar(255) NOT NULL,
    city varchar(100) NOT NULL, district varchar(100) NOT NULL,
    province varchar(100) NOT NULL, phone varchar(20) NOT NULL,
    is_default tinyint(1) DEFAULT 0,
    createdAt datetime NOT NULL, updatedAt datetime NOT NULL,
    PRIMARY KEY (id), KEY userId (userId),
    CONSTRAINT ua_user_fk FOREIGN KEY (userId) REFERENCES \`Users\` (id) ON UPDATE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  await q(`INSERT IGNORE INTO \`user_addresses\` (id,userId,label,first_name,last_name,address,city,district,province,phone,is_default,createdAt,updatedAt) VALUES
    (1,1,'Home','Maheesha','Nidushani','Dehiowita','Awissawella','Kegalle','Sabaragamuwa Province','0788721193',1,'2026-05-23 16:22:24','2026-05-23 16:22:24'),
    (2,26,'Work','Gayan','madushanka','hinguralakanda','dehiowita','Kegalle','Sabaragamuwa Province','0743145791',0,'2026-05-23 16:30:39','2026-05-23 16:32:39'),
    (3,26,'Home','Maheesha','nidushani','avissawella','colombo','Colombo','Western Province','0788721193',1,'2026-05-23 16:32:18','2026-05-23 16:32:39')`);
  console.log('✔  user_addresses');

  /* ═══════════════════ 16. CUSTOMER_ADDRESSES ════════════════════════════ */
  await q(`CREATE TABLE IF NOT EXISTS \`customer_addresses\` (
    id int NOT NULL AUTO_INCREMENT, userId int NOT NULL, customerId int,
    addressLabel varchar(50) DEFAULT 'Home', firstName varchar(100) NOT NULL,
    lastName varchar(100) NOT NULL, address varchar(255) NOT NULL,
    city varchar(100) NOT NULL, district varchar(100) NOT NULL,
    province varchar(100) NOT NULL, phone varchar(20) NOT NULL,
    isDefault tinyint(1) DEFAULT 0,
    createdAt datetime NOT NULL, updatedAt datetime NOT NULL,
    PRIMARY KEY (id), KEY userId (userId), KEY customerId (customerId),
    CONSTRAINT ca_user_fk FOREIGN KEY (userId) REFERENCES \`Users\` (id) ON UPDATE CASCADE,
    CONSTRAINT ca_cust_fk FOREIGN KEY (customerId) REFERENCES \`customers\` (id) ON DELETE SET NULL ON UPDATE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
  console.log('✔  customer_addresses (empty)');

  /* ═══════════════════ 17. RECENTLYVIEWEDS ════════════════════════════════ */
  await q(`CREATE TABLE IF NOT EXISTS \`recentlyvieweds\` (
    id int NOT NULL AUTO_INCREMENT, userId int, productId int, viewedAt datetime,
    createdAt datetime NOT NULL, updatedAt datetime NOT NULL,
    PRIMARY KEY (id), KEY userId (userId), KEY productId (productId),
    CONSTRAINT rv_user_fk FOREIGN KEY (userId) REFERENCES \`Users\` (id) ON UPDATE CASCADE,
    CONSTRAINT rv_prod_fk FOREIGN KEY (productId) REFERENCES \`products\` (id) ON UPDATE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
  console.log('✔  recentlyvieweds (empty)');

  /* ═══════════════════ 18. ORDERITEMS (legacy table) ═════════════════════ */
  await q(`CREATE TABLE IF NOT EXISTS \`orderitems\` (
    id int NOT NULL AUTO_INCREMENT, orderId int NOT NULL, productId int NOT NULL,
    productName varchar(200) NOT NULL, size varchar(20), color varchar(50),
    quantity int NOT NULL DEFAULT 1, price decimal(10,2) NOT NULL,
    createdAt datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id), KEY orderId (orderId),
    CONSTRAINT legoi_ord_fk FOREIGN KEY (orderId) REFERENCES \`orders\` (id) ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
  console.log('✔  orderitems (empty legacy table)');

  await q('SET FOREIGN_KEY_CHECKS = 1');
  console.log('\n✅  All data seeded successfully!');
  await sequelize.close();
}

run().catch((err) => {
  console.error('❌  Seed failed:', err.message);
  process.exit(1);
});
