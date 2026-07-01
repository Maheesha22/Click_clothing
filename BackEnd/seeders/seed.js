'use strict';
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const CA = path.resolve(__dirname, '..', 'ca.pem');

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    ssl: fs.existsSync(CA) ? { rejectUnauthorized: true, ca: fs.readFileSync(CA) } : undefined,
    multipleStatements: true,
  });
  console.log('Connected');

  await conn.query('SET FOREIGN_KEY_CHECKS=0');

  // Add missing columns to Users table if they don't exist yet
  const [cols] = await conn.query("SHOW COLUMNS FROM `Users`");
  const colNames = cols.map(c => c.Field);
  if (!colNames.includes('first_name')) await conn.query("ALTER TABLE `Users` ADD COLUMN `first_name` varchar(255) DEFAULT NULL AFTER `id`");
  if (!colNames.includes('last_name'))  await conn.query("ALTER TABLE `Users` ADD COLUMN `last_name`  varchar(255) DEFAULT NULL AFTER `first_name`");
  if (!colNames.includes('googleId'))   await conn.query("ALTER TABLE `Users` ADD COLUMN `googleId`   varchar(255) DEFAULT NULL AFTER `password`");
  if (!colNames.includes('isAdmin'))    await conn.query("ALTER TABLE `Users` ADD COLUMN `isAdmin`    tinyint(1)   DEFAULT NULL AFTER `googleId`");
  console.log('Users columns checked/updated');

  // helper: bulk insert rows ignoring duplicates (batched to avoid huge packets)
  const ins = async (table, cols, rows) => {
    if (!rows.length) return;
    const colStr = cols.map(c=>'`'+c+'`').join(',');
    const BATCH = 200;
    for (let i=0; i<rows.length; i+=BATCH) {
      const batch = rows.slice(i, i+BATCH);
      const ph = batch.map(()=>`(${cols.map(()=>'?').join(',')})`).join(',');
      const vals = batch.flat();
      await conn.execute(`INSERT IGNORE INTO \`${table}\` (${colStr}) VALUES ${ph}`, vals);
    }
    console.log(`  ${table}: ${rows.length} rows`);
  };

  // ── CREATE TABLES ─────────────────────────────────────────────────────────
  await conn.query(`
    CREATE TABLE IF NOT EXISTS \`Users\` (
      id int NOT NULL AUTO_INCREMENT, first_name varchar(255), last_name varchar(255),
      email varchar(255), password varchar(255), googleId varchar(255), isAdmin tinyint(1),
      createdAt datetime NOT NULL, updatedAt datetime NOT NULL, PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS \`categories\` (
      id int NOT NULL AUTO_INCREMENT, name varchar(50) NOT NULL,
      createdAt datetime NOT NULL, updatedAt datetime NOT NULL,
      PRIMARY KEY (id), UNIQUE KEY name (name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS \`products\` (
      id int NOT NULL AUTO_INCREMENT, name varchar(255), description text,
      price decimal(10,2), categoryId int,
      createdAt datetime NOT NULL, updatedAt datetime NOT NULL,
      PRIMARY KEY (id), KEY categoryId (categoryId),
      CONSTRAINT products_cat_fk FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS \`product_variants\` (
      id int NOT NULL AUTO_INCREMENT, productId int NOT NULL,
      size varchar(10) NOT NULL, color varchar(30) NOT NULL,
      quantity int NOT NULL DEFAULT 0, imageUrl varchar(500),
      createdAt datetime NOT NULL, updatedAt datetime NOT NULL,
      PRIMARY KEY (id), UNIQUE KEY uq_pv (productId,size,color),
      CONSTRAINT pv_prod_fk FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS \`customers\` (
      id int NOT NULL AUTO_INCREMENT, userId int NOT NULL,
      first_name varchar(100) NOT NULL, last_name varchar(100) NOT NULL,
      email varchar(100) NOT NULL, address varchar(255), city varchar(100),
      district varchar(100), province varchar(100), phone varchar(20),
      createdAt datetime NOT NULL, updatedAt datetime NOT NULL,
      PRIMARY KEY (id), KEY userId (userId),
      CONSTRAINT cust_user_fk FOREIGN KEY (userId) REFERENCES \`Users\`(id) ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS \`orders\` (
      id int NOT NULL AUTO_INCREMENT, userId int, status varchar(255) DEFAULT 'pending',
      createdAt datetime NOT NULL, updatedAt datetime NOT NULL,
      customerId int, order_number varchar(255), payment_method varchar(255),
      payment_slip varchar(255), delivery_charges decimal(10,2) DEFAULT 0.00,
      total_bill decimal(10,2), payment_status varchar(255) DEFAULT 'PENDING',
      PRIMARY KEY (id), KEY userId (userId), KEY customerId (customerId),
      CONSTRAINT ord_user_fk FOREIGN KEY (userId) REFERENCES \`Users\`(id) ON UPDATE CASCADE,
      CONSTRAINT ord_cust_fk FOREIGN KEY (customerId) REFERENCES customers(id) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS \`order_items\` (
      id int NOT NULL AUTO_INCREMENT, orderId int, productId int,
      size varchar(255), color varchar(255), quantity int, price decimal(10,2),
      createdAt datetime NOT NULL, updatedAt datetime NOT NULL,
      PRIMARY KEY (id), KEY orderId (orderId), KEY productId (productId),
      CONSTRAINT oi_ord_fk FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT oi_prod_fk FOREIGN KEY (productId) REFERENCES products(id) ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS \`order_details\` (
      id int NOT NULL AUTO_INCREMENT, orderId int NOT NULL, barcode varchar(255) NOT NULL,
      createdAt datetime NOT NULL, updatedAt datetime NOT NULL,
      PRIMARY KEY (id), KEY orderId (orderId),
      CONSTRAINT od_ord_fk FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS \`carts\` (
      id int NOT NULL AUTO_INCREMENT, userId int, productId int,
      size varchar(255), color varchar(255), quantity int DEFAULT 1,
      createdAt datetime NOT NULL, updatedAt datetime NOT NULL,
      PRIMARY KEY (id), KEY userId (userId), KEY productId (productId),
      CONSTRAINT cart_user_fk FOREIGN KEY (userId) REFERENCES \`Users\`(id) ON UPDATE CASCADE,
      CONSTRAINT cart_prod_fk FOREIGN KEY (productId) REFERENCES products(id) ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS \`bank_details\` (
      id int NOT NULL AUTO_INCREMENT, bankName varchar(255) NOT NULL,
      accountName varchar(255) NOT NULL, accountNumber varchar(255) NOT NULL,
      branch varchar(255) NOT NULL, isActive tinyint(1) DEFAULT 1,
      createdAt datetime NOT NULL, updatedAt datetime NOT NULL, PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS \`contacts\` (
      id int NOT NULL AUTO_INCREMENT, name varchar(255) NOT NULL,
      phone varchar(255) NOT NULL, email varchar(255) NOT NULL, comment text NOT NULL,
      createdAt datetime NOT NULL, updatedAt datetime NOT NULL, PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS \`returns\` (
      id int NOT NULL AUTO_INCREMENT, userId int NOT NULL, orderId int NOT NULL,
      products json NOT NULL, reason text, status varchar(255) DEFAULT 'pending',
      createdAt datetime NOT NULL, updatedAt datetime NOT NULL,
      PRIMARY KEY (id), KEY userId (userId), KEY orderId (orderId),
      CONSTRAINT ret_user_fk FOREIGN KEY (userId) REFERENCES \`Users\`(id) ON UPDATE CASCADE ON DELETE CASCADE,
      CONSTRAINT ret_ord_fk FOREIGN KEY (orderId) REFERENCES \`Orders\`(id) ON UPDATE CASCADE ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS \`wishlists\` (
      id int NOT NULL AUTO_INCREMENT, userId int, productId int,
      createdAt datetime NOT NULL, updatedAt datetime NOT NULL,
      PRIMARY KEY (id), KEY userId (userId), KEY productId (productId),
      CONSTRAINT wl_user_fk FOREIGN KEY (userId) REFERENCES \`Users\`(id) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT wl_prod_fk FOREIGN KEY (productId) REFERENCES products(id) ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS \`selected_items\` (
      id int NOT NULL AUTO_INCREMENT, userId int NOT NULL, productId int NOT NULL,
      size varchar(255), color varchar(255), price decimal(10,2) NOT NULL,
      quantity int NOT NULL DEFAULT 1, imageUrl varchar(255),
      createdAt datetime NOT NULL, updatedAt datetime NOT NULL,
      PRIMARY KEY (id), KEY userId (userId), KEY productId (productId),
      CONSTRAINT si_user_fk FOREIGN KEY (userId) REFERENCES \`Users\`(id) ON UPDATE CASCADE,
      CONSTRAINT si_prod_fk FOREIGN KEY (productId) REFERENCES products(id) ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS \`user_addresses\` (
      id int NOT NULL AUTO_INCREMENT, userId int NOT NULL,
      label varchar(100) DEFAULT 'Home', first_name varchar(100) NOT NULL,
      last_name varchar(100) NOT NULL, address varchar(255) NOT NULL,
      city varchar(100) NOT NULL, district varchar(100) NOT NULL,
      province varchar(100) NOT NULL, phone varchar(20) NOT NULL,
      is_default tinyint(1) DEFAULT 0,
      createdAt datetime NOT NULL, updatedAt datetime NOT NULL,
      PRIMARY KEY (id), KEY userId (userId),
      CONSTRAINT ua_user_fk FOREIGN KEY (userId) REFERENCES \`Users\`(id) ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS \`customer_addresses\` (
      id int NOT NULL AUTO_INCREMENT, userId int NOT NULL, customerId int,
      addressLabel varchar(50) DEFAULT 'Home', firstName varchar(100) NOT NULL,
      lastName varchar(100) NOT NULL, address varchar(255) NOT NULL,
      city varchar(100) NOT NULL, district varchar(100) NOT NULL,
      province varchar(100) NOT NULL, phone varchar(20) NOT NULL,
      isDefault tinyint(1) DEFAULT 0,
      createdAt datetime NOT NULL, updatedAt datetime NOT NULL,
      PRIMARY KEY (id), KEY userId (userId), KEY customerId (customerId),
      CONSTRAINT ca_user_fk FOREIGN KEY (userId) REFERENCES \`Users\`(id) ON UPDATE CASCADE,
      CONSTRAINT ca_cust_fk FOREIGN KEY (customerId) REFERENCES customers(id) ON DELETE SET NULL ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS \`recentlyvieweds\` (
      id int NOT NULL AUTO_INCREMENT, userId int, productId int, viewedAt datetime,
      createdAt datetime NOT NULL, updatedAt datetime NOT NULL,
      PRIMARY KEY (id), KEY userId (userId), KEY productId (productId),
      CONSTRAINT rv_user_fk FOREIGN KEY (userId) REFERENCES \`Users\`(id) ON UPDATE CASCADE,
      CONSTRAINT rv_prod_fk FOREIGN KEY (productId) REFERENCES products(id) ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS \`orderitems\` (
      id int NOT NULL AUTO_INCREMENT, orderId int NOT NULL, productId int NOT NULL,
      productName varchar(200) NOT NULL, size varchar(20), color varchar(50),
      quantity int NOT NULL DEFAULT 1, price decimal(10,2) NOT NULL,
      createdAt datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id), KEY orderId (orderId),
      CONSTRAINT legoi_ord_fk FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  console.log('All tables created');

  // ── DATA ──────────────────────────────────────────────────────────────────
  const C = ['id','first_name','last_name','email','password','googleId','isAdmin','createdAt','updatedAt'];
  await ins('Users', C, [
    [1,'Maheesha','Nidushani','maheeshaecc18@gmail.com','$2b$10$7tfNLl5keoGmhQdVDlSM2.fifdB2uZP.0QGLoBY6EBhWEhfelGxg.',null,0,'2026-05-02 09:28:44','2026-05-02 09:28:44'],
    [2,'dimuthu','tharuka','dimuthu@gmail.com','$2b$10$JDzrMgPmI/U7.cMRW0tQIOcXisJdYf1jetIu9LMSoV9RGBrORmhoC',null,0,'2026-05-02 16:50:26','2026-05-02 16:50:26'],
    [3,'Admin','User','admin@gmail.com','admin123',null,1,'2026-05-02 22:28:42','2026-05-02 22:28:42'],
    [4,'John','Doe','john1@gmail.com','pass123',null,0,'2026-05-04 21:01:12','2026-05-04 21:01:12'],
    [5,'Jane','Smith','jane1@gmail.com','pass123',null,0,'2026-05-04 21:01:12','2026-05-04 21:01:12'],
    [6,'Michael','Brown','michael@gmail.com','pass123',null,0,'2026-05-04 21:01:12','2026-05-04 21:01:12'],
    [7,'Emily','Davis','emily@gmail.com','pass123',null,0,'2026-05-04 21:01:12','2026-05-04 21:01:12'],
    [8,'Daniel','Wilson','daniel@gmail.com','pass123',null,0,'2026-05-04 21:01:12','2026-05-04 21:01:12'],
    [9,'Olivia','Taylor','olivia@gmail.com','pass123',null,0,'2026-05-04 21:01:12','2026-05-04 21:01:12'],
    [10,'Matthew','Anderson','matthew@gmail.com','pass123',null,0,'2026-05-04 21:01:12','2026-05-04 21:01:12'],
    [11,'Sophia','Thomas','sophia@gmail.com','pass123',null,0,'2026-05-04 21:01:12','2026-05-04 21:01:12'],
    [12,'David','Jackson','david@gmail.com','pass123',null,0,'2026-05-04 21:01:12','2026-05-04 21:01:12'],
    [13,'Isabella','White','isabella@gmail.com','pass123',null,1,'2026-05-04 21:01:12','2026-05-04 21:01:12'],
    [16,'Shasidu','Lakshan','shasi@gmail.com','$2b$10$rEo235kbabYULtoQK50E7O7vph7j.pfHbMvqhgLoeBQ0ggYM1k3q6',null,0,'2026-05-06 15:30:22','2026-05-06 15:30:22'],
    [17,'kalidu','dahanayaka','kali@gmail.com','$2b$10$I0u3Hrp2L3YsayTWOBS2j.acPwZkXwvLrRfXfbWTQS9iarjrz5xXi',null,0,'2026-05-06 15:34:20','2026-05-06 15:34:20'],
    [18,'Chavi','Nisha','chavinisha12@gmail.com',null,'102495407217672568079',0,'2026-05-06 15:47:56','2026-05-06 15:47:56'],
    [19,'clikk','12','clikk136@gmail.com',null,'107442422009831204813',0,'2026-05-06 20:39:52','2026-05-06 20:39:52'],
    [20,'Chanudi','Sihansa','chanu@gmail.com','$2b$10$aKE6Yw8q0VEyfqcVYgtE1efquwUzNBAh0BrBlleCWFvS33dlEcWpu',null,0,'2026-05-07 23:56:42','2026-05-07 23:56:42'],
    [21,'navodya','hansini','navodya@gmail.com','$2b$10$lYFLWKDOnM54V/xy2gt3cuPDDUCqEe8dq1R6J1asmvgAvGsEt8m6W',null,0,'2026-05-08 00:11:19','2026-05-08 00:11:19'],
    [22,'tanushi','dilrangani','tanushi@gmail.com','$2b$10$p.xTBlVmt4uFXBNhPUnIwuECIH4H.D7jEJ7aXFHLRd5T4rOiG8vAq',null,0,'2026-05-08 00:14:23','2026-05-08 00:14:23'],
    [23,'sadun','bagya','sadun@gmail.com','$2b$10$B6UOo3g08uAFHXuo1an1lu2CqbNcKc2ute1eK8BrMh3F4rMTW3GFW',null,0,'2026-05-08 00:16:01','2026-05-08 00:16:01'],
    [24,'rashmika','nilupul','nilupul@gmail.com','$2b$10$ysHhDQVPDJ8h0RK4pap6DOw9sKzLn6EaLdKpEMmoDItdusXaAkWFS',null,0,'2026-05-08 00:17:41','2026-05-08 00:17:41'],
    [25,'senith','sasi','senith@gmail.com','$2b$10$w4lxVPYi3Ijwprata9jbEOIdjtro4iqvqHUuN2qBw48pUR9JDe3/.',null,0,'2026-05-08 00:19:11','2026-05-08 00:19:11'],
    [26,'Gayan','madushanka','gayan@gmail.com','$2b$10$TpRU20BgITUXUpxoB2OK2eFWOnZrFvYc0WzVzwXka2KQsNycAq3ma',null,0,'2026-05-23 16:24:44','2026-05-23 16:24:44'],
  ]);

  await ins('categories', ['id','name','createdAt','updatedAt'], [
    [2,'shirts','2026-05-04 21:18:22','2026-05-04 21:18:22'],
    [3,'shorts','2026-05-04 21:18:22','2026-05-04 21:18:22'],
    [4,'pants','2026-05-04 21:18:22','2026-05-04 21:18:22'],
    [5,'denims','2026-05-04 21:18:22','2026-05-04 21:18:22'],
    [6,'tshirts','2026-05-04 21:18:22','2026-05-04 21:18:22'],
    [7,'arm cuts','2026-05-04 21:18:22','2026-05-04 21:18:22'],
    [8,'hoodie','2026-05-04 21:18:22','2026-05-04 21:18:22'],
    [9,'long sleeves','2026-05-04 21:18:22','2026-05-04 21:18:22'],
    [10,'accessories','2026-05-04 21:18:22','2026-05-04 21:18:22'],
  ]);

  const PC = ['id','name','description','price','categoryId','createdAt','updatedAt'];
  await ins('products', PC, [
    [1,'Printed shirts','Stylish printed shirts for casual wear',2250.00,2,'2026-05-05 15:06:13','2026-05-05 15:06:13'],
    [2,'Striped lin','Lightweight striped shirt for everyday comfort',2800.00,2,'2026-05-05 15:06:13','2026-05-05 15:06:13'],
    [3,'Striped linen','Breathable linen striped shirt',2800.00,2,'2026-05-05 15:06:13','2026-05-05 15:06:13'],
    [4,'Striped shirt','Classic striped shirt design',2800.00,2,'2026-05-05 15:06:13','2026-05-05 15:06:13'],
    [5,'Two tone shirt','Modern two-tone shirt',2850.00,2,'2026-05-05 15:06:13','2026-05-05 15:06:13'],
    [6,'Linen print shirt','Printed linen shirt for a stylish look',2650.00,2,'2026-05-05 15:06:13','2026-05-05 15:06:13'],
    [7,'Plain linen shirt','Minimal plain linen shirt',2800.00,2,'2026-05-05 15:06:13','2026-05-05 15:06:13'],
    [8,'Acid wash shirt','Vintage acid wash shirt',2900.00,2,'2026-05-05 15:06:13','2026-05-05 15:06:13'],
    [9,'Cuban collar shirt','Relaxed Cuban collar shirt',2600.00,2,'2026-05-05 15:06:13','2026-05-05 15:06:13'],
    [10,'Denim pocket shorts','Denim shorts with multiple pockets',2400.00,3,'2026-05-05 15:06:13','2026-05-05 15:06:13'],
    [11,'Acid wash denim shorts','Stylish acid wash denim shorts',2300.00,3,'2026-05-05 15:06:13','2026-05-05 15:06:13'],
    [12,'Denim patch short','Denim shorts with patch design',2300.00,3,'2026-05-05 15:06:13','2026-05-05 15:06:13'],
    [13,'Cargo pants','Utility cargo pants with pockets',3200.00,4,'2026-05-05 15:06:13','2026-05-05 15:06:13'],
    [14,'Print cargo pant','Printed cargo pants',2950.00,4,'2026-05-05 15:06:13','2026-05-05 15:06:13'],
    [15,'Cargo pocket pant','Cargo pants with extra pockets',3200.00,4,'2026-05-05 15:06:13','2026-05-05 15:06:13'],
    [16,'Plain denim','Classic plain denim jeans',4200.00,5,'2026-05-05 15:06:13','2026-05-05 15:06:13'],
    [17,'Big fold denim','Denim with big fold style',4200.00,5,'2026-05-05 15:06:13','2026-05-05 15:06:13'],
    [18,'Big fold denim trouser','Folded denim trousers',4200.00,5,'2026-05-05 15:06:13','2026-05-05 15:06:13'],
    [19,'Knee patch denim','Denim with knee patch design',4250.00,5,'2026-05-05 15:06:13','2026-05-05 15:06:13'],
    [20,'Denim side pocket','Denim with side pockets',4600.00,5,'2026-05-05 15:06:13','2026-05-05 15:06:13'],
    [21,'Ash color plain denim','Ash color denim jeans',4200.00,5,'2026-05-05 15:06:13','2026-05-05 15:06:13'],
    [22,'Black plain denim','Black denim jeans',4200.00,5,'2026-05-05 15:06:13','2026-05-05 15:06:13'],
    [23,'Denim full patch trousers','Full patch denim trousers',4300.00,5,'2026-05-05 15:06:13','2026-05-05 15:06:13'],
    [24,'Pocket denim trouser','Denim trousers with pockets',4600.00,5,'2026-05-05 15:06:13','2026-05-05 15:06:13'],
    [25,'Zip collar line','T-shirt with zip collar design',2700.00,6,'2026-05-05 15:06:13','2026-05-05 15:06:13'],
    [26,'Hot wheel collar t shirt','Graphic collar t-shirt',2850.00,6,'2026-05-05 15:06:13','2026-05-05 15:06:13'],
    [27,'Emirates acid wash','Acid wash t-shirt style',2000.00,6,'2026-05-05 15:06:13','2026-05-05 15:06:13'],
    [28,'Two tone edge t shirt','Two tone modern t-shirt',2400.00,6,'2026-05-05 15:06:13','2026-05-05 15:06:13'],
    [29,'Click collar t shirt','Collar style t-shirt',1950.00,6,'2026-05-05 15:06:13','2026-05-05 15:06:13'],
    [30,'Back print t shirt','T-shirt with back print',2690.00,6,'2026-05-05 15:06:13','2026-05-05 15:06:13'],
    [31,'Puff back print','Puff print t-shirt design',2350.00,6,'2026-05-05 15:06:13','2026-05-05 15:06:13'],
    [32,'Click white collar t shirt','White collar t-shirt',2200.00,6,'2026-05-05 15:06:13','2026-05-05 15:06:13'],
    [33,'Striped t shirt','Striped casual t-shirt',2100.00,6,'2026-05-05 15:06:13','2026-05-05 15:06:13'],
    [34,'Puff print t shirt','Puff print styled t-shirt',2250.00,6,'2026-05-05 15:06:13','2026-05-05 15:06:13'],
    [35,'Unisex t shirt (2000)','Unisex t-shirt basic',2000.00,6,'2026-05-05 15:06:13','2026-05-05 15:06:13'],
    [36,'Unisex t shirt (2250)','Unisex t-shirt premium',2250.00,6,'2026-05-05 15:06:13','2026-05-05 15:06:13'],
    [37,'Front print t shirt','Front print t-shirt',2250.00,6,'2026-05-05 15:06:13','2026-05-05 15:06:13'],
    [38,'Lufa outfit t shirt','Stylish outfit t-shirt',2400.00,6,'2026-05-05 15:06:13','2026-05-05 15:06:13'],
    [39,'Arm cuts','Sleeveless arm cut shirt',500.00,7,'2026-05-05 15:06:13','2026-05-05 15:06:13'],
    [40,'Adidas hoodie','Warm Adidas style hoodie',3000.00,8,'2026-05-05 15:06:13','2026-05-05 15:06:13'],
    [41,'Nike hoodie','Comfortable Nike style hoodie',2800.00,8,'2026-05-05 15:06:13','2026-05-05 15:06:13'],
    [42,'Harly long sleeve','Long sleeve casual shirt',2800.00,9,'2026-05-05 15:06:13','2026-05-05 15:06:13'],
    [43,'Half zip full sleeve','Half zip full sleeve shirt',3200.00,9,'2026-05-05 15:06:13','2026-05-05 15:06:13'],
    [44,'Cap','Casual wear cap',1000.00,10,'2026-05-05 15:06:13','2026-05-05 15:06:13'],
  ]);

  const VC = ['id','productId','size','color','quantity','imageUrl','createdAt','updatedAt'];
  const DT = '2026-05-05 20:08:38';
  const imgs = {
    1: {Blue:'v1777975423/dezzmutkhryxic00kph8',Green:'v1777975485/rikzazogq5as8quxjyla',Brown:'v1777975523/swansjkqmm42ggv2zn19'},
    2: {Pink:'v1777975751/utedsfmisxv969jbs7os',Green:'v1777975799/ddhrrrdjv7q3q3ig9ta5',Blue:'v1777975852/rtduty3dqndc9uqaklbz',LightBrown:'v1777975901/lwhvlwvpcv9wfm4m1uln'},
    3: {LightBlue:'v1777976321/zjhghtlyztet6ytfik7z',LightBrown:'v1777976321/ij5s2veouyhq1t5tz7no'},
    4: {Black:'v1777976973/quovoqejstatogwm9xvn',LightBlue:'v1777977021/k9rvaadntmedtv6t5ctv',Maroon:'v1777976972/vv9hhzvtnn8i6u0qrt1d',Green:'v1777976972/drvndelqfnuikuzqkoy2'},
    5: {Purple:'v1777978238/yqnepumpffuns9zij6xi',LightBlue:'v1777978236/cqp0ho9xkqgswt7fdwuh',LightGreen:'v1777978240/qzglkdo5vrjspw0iqvov',DarkBlue:'v1777978239/ywt0l8r5ivb41fo2bqfs',Brown:'v1777978242/i8camig0qwmj046qpram',DarkGreen:'v1777978236/w1o2xf7n2hwhnrqmc2pu',Black:'v1777978238/dwtlujwq1rekdkiyd3wv',Red:'v1777978235/u8thn3bzts5qfaqoqes1',Badge:'v1777978238/d8hsuodnfn7g003mtacj'},
    6: {Gray:'v1777978743/jzs9qnxepdxchgifltiz',Blue:'v1777978744/qxm1xjqb9eqyieowqdkg',Orange:'v1777978745/l1vvvgox2e4en3avdbza'},
    7: {Green:'v1777979056/qe7ushyhl76qltbfvzwl',Blue:'v1777979055/jugnkis6ntkrapkxjgh3',Black:'v1777979052/l9wc4p8qbhlcsjxbksvl',Red:'v1777979050/khapqzpgvjqvjvpxdq3u',White:'v1777979047/nmchlp4pua85wijyierp'},
    8: {Black:'v1777979671/t6wczex0zwgix5a0ivys',Orange:'v1777979675/kvkhe9gc9z1crwlzjtza',Green:'v1777979672/ojeyu5rnttv1icytzcra',Red:'v1777979673/lhfcfqpkxamfjgf2dzlb'},
    9: {Black:'v1777979991/hom16nttuiotxnkgzqpi',Badge:'v1777979993/ty85cj1o5tptjnf3dbz8',Green:'v1777979985/kiugcbqffbfc4lybxbth',White:'v1777979983/qhenune1nt6uukb9vzyp'},
  };
  const url = (v) => `https://res.cloudinary.com/dv4ubqk9d/image/upload/${v}.jpg`;
  const szS = ['S','M','L','XL','XXL'];
  const szD = ['28','29','30','32','34','36'];

  // products 1-9 (S/M/L/XL/XXL sizes)
  const variantRows = [];
  const stocks1 = {1:{Blue:10,Green:10,Brown:10},2:{Pink:[15,20,35,12,10],Green:[15,20,35,12,10],Blue:[15,20,35,12,10],LightBrown:[15,20,35,12,10]},3:{LightBlue:[20,25,35,25,15],LightBrown:[20,25,35,25,15]},4:{Black:[10,20,20,10,10],LightBlue:[10,19,20,10,10],Maroon:[10,20,20,10,10],Green:[10,20,20,10,10]},5:{Purple:[7,14,18,11,6],LightBlue:[8,15,19,12,7],LightGreen:[6,13,20,10,5],DarkBlue:[9,17,21,13,8],Brown:[7,16,22,14,6],DarkGreen:[8,15,19,11,7],Black:[10,18,24,13,9],Red:[8,14,20,12,7],Badge:[6,12,16,9,5]},6:{Gray:[8,16,20,12,7],Blue:[9,18,22,14,8],Orange:[7,15,19,11,6]},7:{Green:[6,14,20,12,7],Blue:[7,16,22,13,8],Black:[8,18,24,14,9],Red:[6,15,21,12,7],White:[5,13,19,11,6]},8:{Black:[7,16,22,12,8],Orange:[6,15,20,11,7],Green:[8,16,23,13,9],Red:[7,16,21,12,8]},9:{Black:[6,15,22,12,7],Badge:[5,14,20,11,6],Green:[7,16,23,13,8],White:[6,13,19,11,7]}};
  let id = 1;
  for (let p=1;p<=9;p++) {
    const colors = Object.keys(stocks1[p]);
    for (const color of colors) {
      const imgV = imgs[p][color] || Object.values(imgs[p])[0];
      const qtys = Array.isArray(stocks1[p][color]) ? stocks1[p][color] : Array(5).fill(stocks1[p][color]);
      szS.forEach((sz,i) => variantRows.push([id++,p,sz,color,qtys[i],url(imgV),id<=15?'2026-05-05 15:51:11':DT,id<=15?'2026-05-05 15:51:11':DT]));
    }
  }
  // product 10 & 12: waist sizes, Black+Blue
  const waistImg = {10:{Black:'v1777980186/fjak99r1ktz7ztcbq6cm',Blue:'v1777980188/drfnlb79a3g4zz5v65pq'},12:{Black:'v1777980693/hjaammxg48zsdfrrnxge',Blue:'v1777980690/youaao6mkffaxhsun1pn'}};
  const waistQty = {10:{Black:[6,10,18,20,12,8],Blue:[5,9,17,21,13,7]},12:{Black:[6,11,19,22,14,8],Blue:[5,10,18,21,13,7]}};
  for (const p of [10,12]) {
    for (const color of ['Black','Blue']) {
      szD.forEach((sz,i) => variantRows.push([id++,p,sz,color,waistQty[p][color][i],url(waistImg[p][color]),DT,DT]));
    }
  }
  // product 11: waist sizes, Black+Blue
  szD.forEach((sz,i)=>variantRows.push([id++,11,sz,'Black',[6,10,18,22,14,8][i],url('v1777980419/ggwjjsy4xzqmsmjcsdbg'),'2026-05-05 20:10:21','2026-05-05 20:10:21']));
  szD.forEach((sz,i)=>variantRows.push([id++,11,sz,'Blue',[5,9,17,21,13,7][i],url('v1777980444/cko041rwdu6uvm3u4esu'),'2026-05-05 20:10:21','2026-05-05 20:10:21']));
  // product 13: M/L/XL/XXL only
  const sz13=['M','L','XL','XXL'];
  [{c:'Blue',v:'v1777980906/fewfh4w8kiw4728zkeiq',q:[14,22,13,8]},{c:'Green',v:'v1777980917/hfonxcsz8m93ajnxj1lw',q:[13,21,12,7]},{c:'Badge',v:'v1777980912/jv00dq3etjqk5yazizgj',q:[12,20,11,6]},{c:'Black',v:'v1777980908/pasbtcp7f8ztbmjqjcm9',q:[15,24,14,9]}].forEach(({c,v,q})=>sz13.forEach((sz,i)=>variantRows.push([id++,13,sz,c,q[i],url(v),DT,DT])));
  // product 14: FREE SIZE
  [{c:'Black',v:'v1777983386/gfd7s6srtj4sndh7lk5h',q:18},{c:'Green',v:'v1777983388/cq3c9vb0ghq4xq5nlach',q:22},{c:'White',v:'v1777983386/wb0rqu4mq9iuy3hpov3z',q:16}].forEach(({c,v,q})=>variantRows.push([id++,14,'FREE SIZE',c,q,url(v),'2026-05-05 20:08:39','2026-05-05 20:08:39']));
  // product 15: FREE SIZE
  [{c:'Black',v:'v1777983630/qwluqnpix5wrepljpt05',q:20},{c:'Gray',v:'v1777983631/ip9eo8wcfzk5sjnrqhmo',q:18},{c:'Blue',v:'v1777983628/oaya4lia2y7ebh5f90gq',q:22},{c:'Beige',v:'v1777983627/stvjo0hjc4f6ntpufq70',q:16}].forEach(({c,v,q})=>variantRows.push([id++,15,'FREE SIZE',c,q,url(v),'2026-05-05 20:11:37','2026-05-05 20:11:37']));
  await ins('product_variants', VC, variantRows);

  // products 16-44 variants (exact from dump)
  const vRows2 = [];
  let id2 = 250;
  const DT2 = '2026-05-05 20:11:37';
  // 16: waist Dark Blue + Light Blue
  szD.forEach((sz,i)=>vRows2.push([id2++,16,sz,'Dark Blue',[6,10,18,22,14,8][i],url('v1777989953/p90xzhxagn09tkmhu1ea'),DT2,DT2]));
  szD.forEach((sz,i)=>vRows2.push([id2++,16,sz,'Light Blue',[5,9,17,21,13,7][i],url('v1777989953/rathn3krd9jxzae94zij'),DT2,DT2]));
  // 17: waist Black+Gray+Blue
  szD.forEach((sz,i)=>vRows2.push([id2++,17,sz,'Black',[7,11,19,23,15,9][i],url('v1777990382/udrpavcujjjnxls2vgmj'),DT2,DT2]));
  szD.forEach((sz,i)=>vRows2.push([id2++,17,sz,'Gray',[6,10,18,22,14,8][i],url('v1777990384/otc8759y83srm3zkysm0'),DT2,DT2]));
  szD.forEach((sz,i)=>vRows2.push([id2++,17,sz,'Blue',[8,12,20,24,16,10][i],url('v1777990385/risskfsl9thobr8opot5'),DT2,DT2]));
  // 18: S-XXL Black+Blue
  szS.forEach((sz,i)=>vRows2.push([id2++,18,sz,'Black',[8,14,20,13,7][i],url('v1777990565/xvfrjwthm6qknxepschu'),DT2,DT2]));
  szS.forEach((sz,i)=>vRows2.push([id2++,18,sz,'Blue',[9,15,21,12,6][i],url('v1777990565/xvfrjwthm6qknxepschu'),DT2,DT2]));
  // 19: S-XXL Black
  szS.forEach((sz,i)=>vRows2.push([id2++,19,sz,'Black',[8,14,22,13,7][i],url('v1777990732/hjlvutegj7sgugpdlyjc'),DT2,DT2]));
  // 20: waist Dark Blue + Blue
  szD.forEach((sz,i)=>vRows2.push([id2++,20,sz,'Dark Blue',[6,10,18,22,14,8][i],url('v1777991061/bjlr7bw6and8sjfihc65'),DT2,DT2]));
  szD.forEach((sz,i)=>vRows2.push([id2++,20,sz,'Blue',[5,9,17,21,13,7][i],url('v1777991062/tnqdgsqqmammw4y6xx4t'),DT2,DT2]));
  // 21: waist Ash
  szD.forEach((sz,i)=>vRows2.push([id2++,21,sz,'Ash',[6,10,18,22,14,8][i],url(i<3?'v1777991364/i7hkcmdhjooxgwccitae':'v1777991383/iksj7pyihtoiehvm54ad'),DT2,DT2]));
  // 22: waist Black (28/30/32/34/36)
  ['28','30','32','34','36'].forEach((sz,i)=>vRows2.push([id2++,22,sz,'Black',[5,7,9,11,13][i],url('v1777977375/zkggbt5gu643nieduhmh'),'2026-05-05 20:13:38','2026-05-05 20:13:38']));
  // 23: waist Gray+Black+Dark Blue+Light Blue (28/30/32/34/36)
  const wSz23=['28','30','32','34','36'];
  [{c:'Gray',v:'v1777977689/r3mufw3rjtjzenbxwokf'},{c:'Black',v:'v1777977734/rqx8jkrdyhwygalgtrsw'},{c:'Dark Blue',v:'v1777977809/fsqdloa3jvv6qlwgdkmx'},{c:'Light Blue',v:'v1777977863/v1ihtrsmruyxflc8mgqo'}].forEach(({c,v})=>wSz23.forEach((sz,i)=>vRows2.push([id2++,23,sz,c,[5,7,9,11,13][i],url(v),'2026-05-05 20:14:07','2026-05-05 20:14:07'])));
  // 24: waist Black+Ash+Blue (30/32/34/36)
  const wSz24=['30','32','34','36'];
  [{c:'Black',v:'v1777978163/doo6nhkaxwmetfudi63i'},{c:'Ash',v:'v1777978201/vg5zivit5waxurvlurso'},{c:'Blue',v:'v1777978256/tekgntdmqp6cmgqvrgxy'}].forEach(({c,v})=>wSz24.forEach((sz,i)=>vRows2.push([id2++,24,sz,c,[5,7,9,11][i],url(v),'2026-05-05 20:14:30','2026-05-05 20:14:30'])));
  await ins('product_variants', VC, vRows2);

  // products 25-44 variants (all S-XXL, exact from dump)
  const vRows3 = [];
  const DT3='2026-05-05 20:19:37'; const DT4='2026-05-05 20:20:51'; const DT5='2026-05-05 20:20:52';
  const q10=Array(5).fill(10);
  // 25
  [{c:'Green',v:'v1777978498/rbfkuaybdtyfcgpparsi'},{c:'White',v:'v1777978540/jtb3yn8qihthrw2p0mzv'},{c:'Black',v:'v1777978588/pbq0ro4uwmvthbamqitq'},{c:'Red',v:'v1777978625/yz1j9bv7zx9kuo09nnsi'},{c:'Brown',v:'v1777978706/yo1bh710i1mxpypmawcg'}].forEach(({c,v})=>szS.forEach((sz,i)=>vRows3.push([0,25,sz,c,q10[i],url(v),DT3,DT3])));
  // 26
  [{c:'Black',v:'v1777978984/iqbkp2k0w8zxssyzdpad'},{c:'Sky Blue',v:'v1777979023/tdqtdydmijhmyhkv06zk'},{c:'Brown',v:'v1777979064/htfmiyhplexh0d0dtqge'},{c:'Light Green',v:'v1777979110/qbzm9oabdp9zcze4o8gx'},{c:'Blue',v:'v1777979150/ko8fbxrjte9puhkjagjs'}].forEach(({c,v})=>szS.forEach((sz,i)=>vRows3.push([0,26,sz,c,q10[i],url(v),DT3,DT3])));
  // 27
  [{c:'Brown',v:'v1777979381/sdfae0ktjkzlhswjl1c4'},{c:'Black',v:'v1777979431/bimtn5xoqjcmuj5sjdou'},{c:'Ash',v:'v1777979480/vwrbzj2f482rnuh9ts2m'},{c:'Green',v:'v1777979524/gbk4ysi95ci8ymrnz8we'},{c:'Blue',v:'v1777979591/uawyqlsdbh35tp4cozs3'}].forEach(({c,v})=>szS.forEach((sz,i)=>vRows3.push([0,27,sz,c,q10[i],url(v),DT3,DT3])));
  // 28
  [{c:'Blue',v:'v1777979782/exkjgihuh7iqsoneri8h'},{c:'Black',v:'v1777979833/uhndm4vzlom5c1da2bqx'}].forEach(({c,v})=>szS.forEach((sz,i)=>vRows3.push([0,28,sz,c,q10[i],url(v),DT3,DT3])));
  // 29
  [{c:'Black',v:'v1777980173/lejdckpc8uwxlcyyxine',q:[5,7,9,11,13]},{c:'Green',v:'v1777980219/sodlqqzbeovoqcuztuiu',q:[5,7,9,11,13]},{c:'Light Green',v:'v1777980273/tkj22mm0usf2gpiifyzx',q:[5,7,9,11,13]},{c:'Brown',v:'v1777980330/htkygmwpzvi0u5qn6x5z',q:[5,7,9,11,13]}].forEach(({c,v,q})=>szS.forEach((sz,i)=>vRows3.push([0,29,sz,c,q[i],url(v),DT3,DT3])));
  // 30
  [{c:'Red',v:'v1777980669/p2dhv32gbyd0ifsezcxk',q:[5,7,9,11,13]},{c:'Yellow',v:'v1777980718/ua6r42mk0unypf6npxkz',q:[5,7,9,11,13]},{c:'White',v:'v1777980760/nba1fz8iwxtfwwdk7dhw',q:[5,7,9,11,13]},{c:'Red & White',v:'v1777980803/p1uehlqqaadwlasgx9m2',q:[5,7,9,11,13]}].forEach(({c,v,q})=>szS.forEach((sz,i)=>vRows3.push([0,30,sz,c,q[i],url(v),DT3,DT3])));
  // 31
  [{c:'Black',v:'v1777981200/f4m1yhcvnupulyzn9xqs',q:[5,7,9,11,13]},{c:'Navy Blue',v:'v1777981245/lyb1jaltqvydswmdz6hp',q:[5,7,9,11,13]},{c:'Light Brown',v:'v1777981315/gt4uyiygkl2itdcqmxi6',q:[5,7,9,11,13]},{c:'Lavender',v:'v1777981370/tzfahmmhm53ov4sb3wg0',q:[5,7,9,11,13]},{c:'White',v:'v1777981422/j6qxmc8im2lyaxjseq3j',q:[5,7,9,11,13]}].forEach(({c,v,q})=>szS.forEach((sz,i)=>vRows3.push([0,31,sz,c,q[i],url(v),DT3,DT3])));
  // 32
  [{c:'Black',v:'v1777981611/rjqw1hjikdcxheoppyrz',q:[12,14,16,18,20]},{c:'White',v:'v1777981674/yte5euzikkgwfpkuh5s8',q:[12,14,16,18,20]}].forEach(({c,v,q})=>szS.forEach((sz,i)=>vRows3.push([0,32,sz,c,q[i],url(v),DT3,DT3])));
  // 33
  [{c:'Bench',v:'v1777981888/oy38vcyhncispmjywoyg'},{c:'Sky Blue',v:'v1777981933/bdvdd8brsstfzyjnfp3n'},{c:'Black',v:'v1777981980/pzpfi41zmeve6aszyzlg'},{c:'Red',v:'v1777982021/pjoyjm4d36yxsfqqbwtf'},{c:'Navy Blue',v:'v1777982073/iss538qkvmtvtgx37zl3'},{c:'White',v:'v1777982121/xiwnxinzjnrwh6zglse6'}].forEach(({c,v})=>szS.forEach((sz,i)=>vRows3.push([0,33,sz,c,[12,14,16,18,20][i],url(v),DT3,DT3])));
  // 34
  [{c:'Purple',v:'v1777982437/pa3iyd5dwxkfxjz2ko2d'},{c:'Green',v:'v1777982491/ux6ifkma0vdeqbus9zfp'},{c:'White',v:'v1777982536/iabdbqsnfjmuarfkpi9e'},{c:'Sky Blue',v:'v1777982579/ygemyxwf2roffmowh8cd'},{c:'Light Blue',v:'v1777982625/m4xeqpi7ptket5myelua'},{c:'Black',v:'v1777982672/xmsgb4mtytmgnrpfooh0'},{c:'Navy Blue',v:'v1777982711/kx5bgnrsw3bvx5rvtyyk'},{c:'Bench',v:'v1777982768/yoij2emgqylfxz2omiqe'},{c:'Orange',v:'v1777982832/imr4zzathon0netalz7y'}].forEach(({c,v})=>szS.forEach((sz,i)=>vRows3.push([0,34,sz,c,[12,14,16,18,20][i],url(v),DT3,DT3])));
  await ins('product_variants', VC, vRows3.map(r=>{r[0]=0;return r;}));

  const vRows4 = [];
  // 35
  [{c:'Dark Yellow',v:'v1777983239/fl1owa0jkoj2hixw7cvb'},{c:'Light Green',v:'v1777983327/oc0lidid6zuvsso579ri'},{c:'Black',v:'v1777983380/b8cjwnyacnpbyvwh4s61'},{c:'Maroon',v:'v1777983425/hishcejfamn5ndknjpvv'},{c:'White',v:'v1777983501/t17wgw7nuocjdvjnfaj3'},{c:'Pink',v:'v1777983555/phnugujoqedgv156dn5j'}].forEach(({c,v})=>szS.forEach((sz,i)=>vRows4.push([0,35,sz,c,[12,14,16,18,20][i],url(v),'2026-05-05 20:20:51','2026-05-05 20:20:51'])));
  // 36
  [{c:'Light Blue',v:'v1777983868/gq2112nqzvlijrxmejfk'},{c:'Dark Green',v:'v1777983914/nhdirptmarmhy1g045j4'},{c:'Light Green',v:'v1777983975/nsbil0i37diwpvm2yhcu'},{c:'Sky Blue',v:'v1777984048/gvytjzaczehic4hqkfan'},{c:'Highlight Green',v:'v1777984307/iq4q0laazpmtuju0vjix'},{c:'Pink',v:'v1777984353/mtgrmip7p8f258gzthpe'}].forEach(({c,v})=>szS.forEach((sz,i)=>vRows4.push([0,36,sz,c,[12,14,16,18,20][i],url(v),'2026-05-05 20:20:51','2026-05-05 20:20:51'])));
  // 37
  [{c:'Blue',v:'v1777984604/y3thmxwfn1ez0g0hxsg1'},{c:'Ash',v:'v1777984659/chue2wxotek1mqpczd0r'},{c:'White',v:'v1777984717/cuqkwjvvzbezjywjn8uu'},{c:'Green',v:'v1777984760/injufnthoihmjhqrlfef'}].forEach(({c,v})=>szS.forEach((sz,i)=>vRows4.push([0,37,sz,c,[12,14,16,18,20][i],url(v),'2026-05-05 20:20:51','2026-05-05 20:20:51'])));
  // 38
  [{c:'Bench',v:'v1777985026/jlcquuir1uk6tgwyugqw'},{c:'Black',v:'v1777985070/gkr97swd7nbbpyzpzsxy'},{c:'Ash',v:'v1777985113/ifs0tdljjnztaalfcvcp'}].forEach(({c,v})=>szS.forEach((sz,i)=>vRows4.push([0,38,sz,c,[12,14,16,18,20][i],url(v),'2026-05-05 20:20:52','2026-05-05 20:20:52'])));
  // 39
  [{c:'Red',v:'v1777985549/obz7kohwdyz1fmp11e7q'},{c:'Green',v:'v1777985593/coe4xwnytdqqjloansjm'},{c:'Blue',v:'v1777985635/vjerzefeteuj2l5yzfdx'},{c:'Black',v:'v1777985681/pzchlxwc7jtcacjswjjx'}].forEach(({c,v})=>szS.forEach((sz,i)=>vRows4.push([0,39,sz,c,[12,14,16,18,20][i],url(v),'2026-05-05 20:20:52','2026-05-05 20:20:52'])));
  // 40
  [{c:'Black',v:'v1777985931/hseu4lgw9vb87m8ijtbw'},{c:'Navy Blue',v:'v1777985967/vwzfyohd9xkvcekehj4f'},{c:'Light Blue',v:'v1777986018/afj9glxu3tdssfzgeksp'},{c:'Green',v:'v1777986066/bxyljwypzobjhdvblvui'},{c:'Purple',v:'v1777986131/zyfr1tc56j7wv9asnkqn'},{c:'Maroon',v:'v1777986204/qnec8t8mwg36afbl7th9'}].forEach(({c,v})=>szS.forEach((sz,i)=>vRows4.push([0,40,sz,c,[12,14,16,18,20][i],url(v),'2026-05-05 20:20:52','2026-05-05 20:20:52'])));
  // 41
  [{c:'Green',v:'v1777986406/lirsesyt7cmknf71qbco'},{c:'Navy Blue',v:'v1777986478/ljmovcqnpvozyouwgrxl'},{c:'Black',v:'v1777986515/not78ejxkyqdax3tzciz'},{c:'Orange',v:'v1777986561/hjdu71bzshmyfk6mwxpt'},{c:'Ash',v:'v1777986608/lqxdyuunc1d6qpdcnczf'},{c:'Sky Blue',v:'v1777986655/qlhkngcv4mmw2jrnymmm'}].forEach(({c,v})=>szS.forEach((sz,i)=>vRows4.push([0,41,sz,c,[12,14,16,18,20][i],url(v),'2026-05-05 20:20:52','2026-05-05 20:20:52'])));
  // 42
  [{c:'Green',v:'v1777986847/zjyksvblfc8tuyki05x1'},{c:'Blue',v:'v1777986894/e3e04lnrmr2hoiilufub'},{c:'Light Green',v:'v1777986937/cwlnezzfxfqymtebdcyr'},{c:'Ash',v:'v1777986986/w4ojtmxisx9768wssume'},{c:'Yellow',v:'v1777987037/fjwt6z4wdr9wkkdgaisn'}].forEach(({c,v})=>szS.forEach((sz,i)=>vRows4.push([0,42,sz,c,[12,14,16,18,20][i],url(v),'2026-05-05 20:20:52','2026-05-05 20:20:52'])));
  // 43
  [{c:'Black',v:'v1777987257/prjtarmpyicjte0ngfxe'},{c:'Green',v:'v1777987308/qiquauopd5jmyiv4qrlw'},{c:'Navy Blue',v:'v1777987344/n5moycwxiutb7dpohb7n'},{c:'Light Blue',v:'v1777987388/yxbuuoe3peneh6lrbfmp'},{c:'Dark Blue',v:'v1777987490/qzsmf670hhitpeolqokk'},{c:'Red',v:'v1777987545/q6nt6ern5gwvmsqmvpbi'}].forEach(({c,v})=>szS.forEach((sz,i)=>vRows4.push([0,43,sz,c,[12,14,16,18,20][i],url(v),'2026-05-05 20:20:52','2026-05-05 20:20:52'])));
  // 44
  vRows4.push([0,44,'FREE SIZE','Black',10,url('v1777987804/tjlberdwy4vpdr9fk7rz'),'2026-05-05 20:22:57','2026-05-05 20:22:57']);

  // strip IDs (use 0 = auto-increment), but we need exact IDs from dump...
  // Actually for variants 25+ we don't need exact IDs so let DB assign them
  await ins('product_variants', VC, vRows4.map(r=>{r[0]=null;return r;}));
  console.log('product_variants done');

  await ins('customers', ['id','userId','first_name','last_name','email','address','city','district','province','phone','createdAt','updatedAt'], [
    [1,1,'Maheesha','Nidushani','maheeshaecc18@gmail.com','Dehiowita','Awissawella','Kegalle','Sabaragamuwa Province','0788721193','2026-05-05 00:16:31','2026-05-23 16:22:41'],
    [2,2,'dimuthu','tharuka','dimuthu@gmail.com','Dehiowita','Awissawella','Kalutara','Eastern Province','0788721193','2026-05-05 00:16:31','2026-05-23 07:14:42'],
    [3,5,'Jane','Smith','jane1@gmail.com','No 8, Lake View','Kandy','Kandy','Central','0761122334','2026-05-05 00:16:31','2026-05-05 00:16:31'],
    [4,6,'Michael','Brown','michael@gmail.com','No 77, Main Street','Galle','Galle','Southern','0759988776','2026-05-05 00:16:31','2026-05-05 00:16:31'],
    [5,9,'Olivia','Taylor','olivia@gmail.com','No 23, Beach Road','Matara','Matara','Southern','0784455667','2026-05-05 00:16:31','2026-05-05 00:16:31'],
    [6,10,'Matthew','Anderson','matthew@gmail.com','No 90, Hill Street','Nuwara Eliya','Nuwara Eliya','Central','0776677889','2026-05-05 00:16:31','2026-05-05 00:16:31'],
    [7,16,'Shasidu','Lakshan','shasi@gmail.com','No 123, Main Street','Colombo','Colombo','Western','0771234567','2026-05-06 21:36:22','2026-05-06 21:36:22'],
    [8,20,'chanudi','sihansa','chanudi@gmail.com','wadduwa','kalutara','Kalutara','Western Province','0112365987','2026-05-07 23:59:57','2026-05-08 00:52:21'],
    [9,21,'navodya','hansini','navodya@gmail.com','deraniyagala','Awissawella','Kegalle','Sabaragamuwa Province','0788721193','2026-05-08 00:24:20','2026-05-08 04:58:39'],
    [10,26,'Maheesha','nidushani','gayan@gmail.com','avissawella','colombo','Colombo','Western Province','0788721193','2026-05-24 04:52:33','2026-05-24 10:46:18'],
  ]);

  await ins('orders', ['id','userId','status','createdAt','updatedAt','customerId','order_number','payment_method','payment_slip','delivery_charges','total_bill','payment_status'], [
    [20,1,'pending','2026-05-04 22:14:02','2026-05-07 03:12:30',1,'ORD105','Cash on Delivery',null,300.00,4800.00,'PENDING'],
    [21,2,'confirmed','2026-05-04 22:14:02','2026-05-07 03:12:30',2,'ORD106','Bank Transfer','slip3.jpg',300.00,6500.00,'PENDING'],
    [22,1,'shipped','2026-05-04 22:14:02','2026-05-07 03:12:30',1,'ORD107','Cash on Delivery',null,300.00,7300.00,'PENDING'],
    [23,2,'delivered','2026-05-04 22:14:02','2026-05-07 03:12:30',2,'ORD108','Bank Transfer','slip4.jpg',300.00,3000.00,'PENDING'],
    [24,5,'pending','2026-05-04 22:14:02','2026-05-07 03:12:30',3,'ORD109','Cash on Delivery',null,300.00,5500.00,'PENDING'],
    [25,6,'confirmed','2026-05-04 23:56:42','2026-05-07 03:12:30',4,'ORD110','Cash on Delivery',null,300.00,8600.00,'PENDING'],
    [26,6,'shipped','2026-05-04 23:56:42','2026-05-07 03:12:30',4,'ORD111','Cash on Delivery',null,300.00,4200.00,'PENDING'],
    [27,7,'delivered','2026-05-05 00:18:02','2026-05-24 06:58:30',7,'ORD112','Bank Transfer','slip5.jpg',300.00,9800.00,'Confirmed'],
    [28,2,'delivered','2026-05-05 00:18:02','2026-05-07 20:27:51',2,'ORD113','Cash on Delivery',null,0.00,5100.00,'Confirmed'],
    [29,9,'pending','2026-05-05 00:18:02','2026-05-07 03:12:30',5,'ORD114','Cash on Delivery',null,0.00,3700.00,'PENDING'],
    [30,10,'shipped','2026-05-05 00:18:02','2026-05-07 03:12:30',6,'ORD115','Cash on Delivery',null,0.00,4600.00,'PENDING'],
    [31,1,'shipped','2026-05-05 23:53:42','2026-05-07 03:12:30',1,'ORD116','Cash on Delivery',null,0.00,2500.00,'PENDING'],
    [32,16,'shipped','2026-05-06 21:36:22','2026-05-07 03:12:30',7,'ORD117','Cash on Delivery',null,0.00,9900.00,'PENDING'],
    [33,20,'pending','2026-05-07 23:59:57','2026-05-07 23:59:57',null,'ORD-20260508-3414','cod',null,500.00,3500.00,'PENDING'],
    [34,21,'pending','2026-05-08 00:24:20','2026-05-08 00:24:20',null,'ORD-20260508-8519','cod',null,500.00,6100.00,'PENDING'],
    [35,20,'pending','2026-05-08 00:52:21','2026-05-24 06:57:49',null,'ORD-20260508-3206','bank','https://res.cloudinary.com/dv4ubqk9d/image/upload/v1778201541/click_clothing_slips/jwbxsqj0gfxc9yuqand1.jpg',500.00,2500.00,'Cancelled'],
    [36,21,'pending','2026-05-08 04:58:39','2026-05-08 04:58:39',null,'ORD-20260508-8988','cod',null,500.00,3100.00,'PENDING'],
    [37,2,'shipped','2026-05-08 05:07:16','2026-05-08 05:10:01',null,'ORD-20260508-5321','cod',null,500.00,3300.00,'Confirmed'],
    [38,2,'delivered','2026-05-08 05:33:50','2026-05-08 05:37:59',null,'ORD-20260508-8581','cod',null,500.00,3400.00,'Confirmed'],
    [39,2,'pending','2026-05-13 17:08:50','2026-05-13 17:08:50',null,'ORD-20260513-2675','cod',null,500.00,3700.00,'PENDING'],
    [40,1,'pending','2026-05-15 02:40:27','2026-05-15 02:40:27',null,'ORD-20260515-5460','cod',null,500.00,3400.00,'PENDING'],
    [41,1,'pending','2026-05-22 14:50:31','2026-05-22 14:50:31',null,'ORD-20260522-5124','cod',null,500.00,2450.00,'PENDING'],
    [42,2,'pending','2026-05-22 14:54:50','2026-05-22 14:54:50',null,'ORD-20260522-8878','cod',null,500.00,6100.00,'PENDING'],
    [43,2,'delivered','2026-05-22 14:57:09','2026-05-22 15:01:59',null,'ORD-20260522-8410','cod',null,500.00,1500.00,'Confirmed'],
    [44,1,'pending','2026-05-23 05:31:28','2026-05-23 05:31:28',null,'ORD-20260523-2643','cod',null,500.00,6200.00,'PENDING'],
    [45,1,'pending','2026-05-23 05:56:57','2026-05-23 05:56:57',null,'ORD-20260523-3195','cod',null,500.00,3300.00,'PENDING'],
    [46,1,'pending','2026-05-23 05:59:09','2026-05-23 05:59:09',null,'ORD-20260523-5180','cod',null,500.00,5300.00,'PENDING'],
    [47,1,'pending','2026-05-23 06:04:00','2026-05-23 06:04:00',null,'ORD-20260523-7828','cod',null,500.00,4700.00,'PENDING'],
    [48,1,'pending','2026-05-23 06:06:13','2026-05-23 06:06:13',null,'ORD-20260523-8323','cod',null,500.00,3100.00,'PENDING'],
    [49,2,'delivered','2026-05-23 07:14:42','2026-05-23 12:04:41',null,'ORD-20260523-6911','cod',null,500.00,3300.00,'Confirmed'],
    [50,1,'pending','2026-05-23 13:31:59','2026-05-23 13:31:59',null,'ORD-20260523-9619','cod',null,500.00,4700.00,'PENDING'],
    [51,1,'pending','2026-05-23 14:17:13','2026-05-23 14:17:13',null,'ORD-20260523-8235','cod',null,500.00,3300.00,'PENDING'],
    [52,1,'pending','2026-05-23 16:22:41','2026-05-23 16:22:41',null,'ORD-20260523-4747','cod',null,500.00,3300.00,'PENDING'],
    [53,1,'pending','2026-05-23 16:39:01','2026-05-23 16:39:01',null,'ORD-20260523-9218','cod',null,500.00,3400.00,'PENDING'],
    [54,26,'shipped','2026-05-24 04:52:33','2026-05-24 05:03:08',null,'ORD-20260524-7943','cod',null,500.00,2850.00,'PENDING'],
    [55,26,'delivered','2026-05-24 04:57:07','2026-05-24 05:03:22',null,'ORD-20260524-9690','cod',null,500.00,2750.00,'Confirmed'],
    [56,26,'delivered','2026-05-24 05:00:37','2026-05-24 05:02:56',null,'ORD-20260524-2334','cod',null,500.00,2750.00,'Confirmed'],
    [57,1,'confirmed','2026-05-24 06:54:03','2026-05-24 09:14:44',null,'ORD-20260524-6605','bank','https://res.cloudinary.com/dv4ubqk9d/image/upload/v1779613997/click_clothing_slips/pcwqqcbtsznxmtkgrfws.jpg',500.00,3300.00,'Confirmed'],
    [58,26,'delivered','2026-05-24 10:09:37','2026-05-24 10:16:23',null,'ORD-20260524-4067','bank','https://res.cloudinary.com/dv4ubqk9d/image/upload/v1779617714/click_clothing_slips/a5cbqhjvqoyxxetgckok.jpg',500.00,3500.00,'Confirmed'],
    [59,26,'shipped','2026-05-24 10:46:18','2026-05-24 10:49:44',null,'ORD-20260524-1669','bank','https://res.cloudinary.com/dv4ubqk9d/image/upload/v1779619630/click_clothing_slips/fpmxuyneh9mhwlmhyuh1.jpg',400.00,3300.00,'Confirmed'],
  ]);

  await ins('order_items', ['id','orderId','productId','size','color','quantity','price','createdAt','updatedAt'], [
    [10,25,29,'M','Black',1,2250.00,'2026-05-05 00:04:08','2026-05-05 00:04:08'],
    [11,25,30,'M','Blue',1,2400.00,'2026-05-05 00:04:08','2026-05-05 00:04:08'],
    [12,26,31,'L','Black',1,2400.00,'2026-05-05 00:04:08','2026-05-05 00:04:08'],
    [13,25,29,'M','Black',1,2250.00,'2026-05-05 00:05:08','2026-05-05 00:05:08'],
    [14,25,30,'M','White',1,2800.00,'2026-05-05 00:05:08','2026-05-05 00:05:08'],
    [15,26,38,'M','Blue',1,2400.00,'2026-05-05 00:05:08','2026-05-05 00:05:08'],
    [16,20,41,'32','Black',1,3200.00,'2026-05-05 00:05:08','2026-05-05 00:05:08'],
    [17,21,44,'32','Blue',2,4200.00,'2026-05-05 00:05:08','2026-05-05 00:05:08'],
    [18,22,29,'L','Black',1,2250.00,'2026-05-05 00:05:08','2026-05-05 00:05:08'],
    [19,23,38,'M','Blue',3,2400.00,'2026-05-05 00:05:08','2026-05-05 00:05:08'],
    [20,24,41,'34','Black',1,3200.00,'2026-05-05 00:05:08','2026-05-05 00:05:08'],
    [21,31,1,'M','Black',2,2250.00,'2026-05-05 23:54:11','2026-05-05 23:54:11'],
    [22,31,2,'L','Blue',1,2400.00,'2026-05-05 23:54:11','2026-05-05 23:54:11'],
    [23,31,3,'S','Red',3,2500.00,'2026-05-05 23:54:13','2026-05-05 23:54:13'],
    [24,32,1,'M','Blue',2,2250.00,'2026-05-06 21:36:22','2026-05-06 21:36:22'],
    [25,32,2,'L','Blue',1,2400.00,'2026-05-06 21:36:22','2026-05-06 21:36:22'],
    [26,32,3,'S','LightBrown',1,2500.00,'2026-05-06 21:36:22','2026-05-06 21:36:22'],
    [27,33,40,'M','Green',1,3000.00,'2026-05-07 23:59:57','2026-05-07 23:59:57'],
    [28,34,4,'M','LightBlue',2,2800.00,'2026-05-08 00:24:20','2026-05-08 00:24:20'],
    [29,35,27,'32','Black',1,2000.00,'2026-05-08 00:52:21','2026-05-08 00:52:21'],
    [30,36,9,'M','#000000',1,2600.00,'2026-05-08 04:58:39','2026-05-08 04:58:39'],
    [31,37,7,'M','#FF0000',1,2800.00,'2026-05-08 05:07:16','2026-05-08 05:07:16'],
    [32,38,8,'M','#FFA500',1,2900.00,'2026-05-08 05:33:50','2026-05-08 05:33:50'],
    [33,39,43,'M','Black',1,3200.00,'2026-05-13 17:08:50','2026-05-13 17:08:50'],
    [34,40,8,'M','Green',1,2900.00,'2026-05-15 02:40:27','2026-05-15 02:40:27'],
    [35,41,29,'M','Brown',1,1950.00,'2026-05-22 14:50:31','2026-05-22 14:50:31'],
    [36,42,2,'S','Green',2,2800.00,'2026-05-22 14:54:50','2026-05-22 14:54:50'],
    [37,43,44,'32','Black',1,1000.00,'2026-05-22 14:57:09','2026-05-22 14:57:09'],
    [38,44,5,'M','DarkBlue',2,2850.00,'2026-05-23 05:31:28','2026-05-23 05:31:28'],
    [39,45,2,'L','Pink',1,2800.00,'2026-05-23 05:56:57','2026-05-23 05:56:57'],
    [40,46,38,'M','Blue',2,2400.00,'2026-05-23 05:59:09','2026-05-23 05:59:09'],
    [41,47,22,'M','Blue',1,4200.00,'2026-05-23 06:04:00','2026-05-23 06:04:00'],
    [42,48,9,'M','Black',1,2600.00,'2026-05-23 06:06:13','2026-05-23 06:06:13'],
    [43,49,41,'32','Black',1,2800.00,'2026-05-23 07:14:42','2026-05-23 07:14:42'],
    [44,50,21,'M','Black',1,4200.00,'2026-05-23 13:31:59','2026-05-23 13:31:59'],
    [45,51,7,'M','Green',1,2800.00,'2026-05-23 14:17:13','2026-05-23 14:17:13'],
    [46,52,2,'L','Blue',1,2800.00,'2026-05-23 16:22:41','2026-05-23 16:22:41'],
    [47,53,8,'M','Black',1,2900.00,'2026-05-23 16:39:01','2026-05-23 16:39:01'],
    [48,54,31,'L','Black',1,2350.00,'2026-05-24 04:52:33','2026-05-24 04:52:33'],
    [49,55,34,'S','Bench',1,2250.00,'2026-05-24 04:57:07','2026-05-24 04:57:07'],
    [50,56,34,'L','Black',1,2250.00,'2026-05-24 05:00:37','2026-05-24 05:00:37'],
    [51,57,4,'M','LightBlue',1,2800.00,'2026-05-24 06:54:03','2026-05-24 06:54:03'],
    [52,58,40,'M','Maroon',1,3000.00,'2026-05-24 10:09:37','2026-05-24 10:09:37'],
    [53,59,8,'M','Green',1,2900.00,'2026-05-24 10:46:18','2026-05-24 10:46:18'],
  ]);

  await ins('order_details', ['id','orderId','barcode','createdAt','updatedAt'], [
    [21,20,'BARCODE-ORD003','2026-05-05 00:24:18','2026-05-05 00:24:18'],[22,21,'BARCODE-ORD004','2026-05-05 00:24:18','2026-05-05 00:24:18'],
    [23,22,'BARCODE-ORD005','2026-05-05 00:24:18','2026-05-05 00:24:18'],[24,23,'BARCODE-ORD006','2026-05-05 00:24:18','2026-05-05 00:24:18'],
    [25,24,'BARCODE-ORD007','2026-05-05 00:24:18','2026-05-05 00:24:18'],[26,25,'BARCODE-ORD001','2026-05-05 00:24:18','2026-05-05 00:24:18'],
    [27,26,'BARCODE-ORD002','2026-05-05 00:24:18','2026-05-05 00:24:18'],[28,32,'BARCODE-ORD-SHASIDU-001','2026-05-06 21:36:22','2026-05-06 21:36:22'],
    [29,31,'BARCODE-ORD116','2026-05-08 05:01:49','2026-05-08 05:01:49'],[30,30,'BARCODE-ORD115','2026-05-08 05:01:49','2026-05-08 05:01:49'],
    [31,29,'BARCODE-ORD114','2026-05-08 05:01:49','2026-05-08 05:01:49'],[32,28,'BARCODE-ORD113','2026-05-08 05:01:49','2026-05-08 05:01:49'],
    [33,27,'BARCODE-ORD112','2026-05-08 05:01:49','2026-05-08 05:01:49'],[34,33,'CKS202605082798152','2026-05-07 23:59:57','2026-05-07 23:59:57'],
    [35,34,'CKS202605086022415','2026-05-08 00:24:20','2026-05-08 00:24:20'],[36,35,'CKS202605089050149','2026-05-08 00:52:21','2026-05-08 00:52:21'],
    [37,36,'CKS202605088618610','2026-05-08 04:58:39','2026-05-08 04:58:39'],[38,37,'CKS202605088220484','2026-05-08 05:07:16','2026-05-08 05:07:16'],
    [39,38,'CKS202605082747583','2026-05-08 05:33:51','2026-05-08 05:33:51'],[40,39,'CKS202605139304596','2026-05-13 17:08:50','2026-05-13 17:08:50'],
    [41,40,'CKS202605159545102','2026-05-15 02:40:27','2026-05-15 02:40:27'],[42,41,'CKS202605223739288','2026-05-22 14:50:31','2026-05-22 14:50:31'],
    [43,42,'CKS202605228185480','2026-05-22 14:54:50','2026-05-22 14:54:50'],[44,43,'CKS202605224786001','2026-05-22 14:57:09','2026-05-22 14:57:09'],
    [45,44,'CKS202605232158441','2026-05-23 05:31:28','2026-05-23 05:31:28'],[46,45,'CKS202605234513910','2026-05-23 05:56:57','2026-05-23 05:56:57'],
    [47,46,'CKS202605231099657','2026-05-23 05:59:09','2026-05-23 05:59:09'],[48,47,'CKS202605233821416','2026-05-23 06:04:00','2026-05-23 06:04:00'],
    [49,48,'CKS202605230654260','2026-05-23 06:06:13','2026-05-23 06:06:13'],[50,49,'CKS202605235322560','2026-05-23 07:14:42','2026-05-23 07:14:42'],
    [51,50,'CKS202605233501286','2026-05-23 13:31:59','2026-05-23 13:31:59'],[52,51,'CKS202605239131427','2026-05-23 14:17:13','2026-05-23 14:17:13'],
    [53,52,'CKS202605236512270','2026-05-23 16:22:41','2026-05-23 16:22:41'],[54,53,'CKS202605230381122','2026-05-23 16:39:01','2026-05-23 16:39:01'],
    [55,54,'CKS202605246855125','2026-05-24 04:52:33','2026-05-24 04:52:33'],[56,55,'CKS202605246510921','2026-05-24 04:57:08','2026-05-24 04:57:08'],
    [57,56,'CKS202605243206694','2026-05-24 05:00:37','2026-05-24 05:00:37'],[58,57,'CKS202605247457641','2026-05-24 06:54:03','2026-05-24 06:54:03'],
    [59,58,'CKS202605241906790','2026-05-24 10:09:37','2026-05-24 10:09:37'],[60,59,'CKS202605244125066','2026-05-24 10:46:18','2026-05-24 10:46:18'],
  ]);

  await ins('carts', ['id','userId','productId','size','color','quantity','createdAt','updatedAt'], [
    [20,2,1,'L','Blue',1,'2026-05-04 04:39:56','2026-05-13 10:11:03'],[26,2,23,'32','Black',1,'2026-05-04 23:56:12','2026-05-04 23:56:12'],
    [30,3,44,'32','Blue',1,'2026-05-05 00:04:58','2026-05-05 00:04:58'],[31,19,44,'','',1,'2026-05-06 20:48:57','2026-05-06 20:48:57'],
    [35,16,1,'','',3,'2026-05-06 20:55:08','2026-05-06 21:03:25'],[36,16,39,'','',1,'2026-05-06 21:02:32','2026-05-06 21:02:32'],
    [37,16,8,'','',1,'2026-05-06 21:05:06','2026-05-06 21:05:06'],[39,16,8,'','',1,'2026-05-07 09:33:43','2026-05-07 09:33:43'],
    [44,21,6,'L','Orange',1,'2026-05-08 00:12:52','2026-05-08 00:12:52'],[46,22,30,'XL','Yellow',1,'2026-05-08 00:14:51','2026-05-08 00:14:51'],
    [47,22,31,'L','Lavender',1,'2026-05-08 00:15:05','2026-05-08 00:15:05'],[48,22,34,'L','Black',1,'2026-05-08 00:15:15','2026-05-08 00:15:15'],
    [49,23,13,'M','Badge',1,'2026-05-08 00:16:19','2026-05-08 00:16:19'],[50,23,43,'L','Dark Blue',1,'2026-05-08 00:16:37','2026-05-08 00:16:37'],
    [51,24,39,'L','Green',1,'2026-05-08 00:17:59','2026-05-08 00:17:59'],[52,25,3,'L','LightBrown',1,'2026-05-08 00:19:41','2026-05-08 00:19:41'],
    [53,25,4,'M','Maroon',1,'2026-05-08 00:20:08','2026-05-08 00:20:08'],[54,20,1,'','',1,'2026-05-08 00:49:02','2026-05-08 00:49:02'],
    [66,3,9,'L','Badge',1,'2026-05-23 16:20:42','2026-05-23 16:20:42'],[67,3,2,'L','Green',1,'2026-05-23 16:20:55','2026-05-23 16:20:55'],
    [68,26,9,'M','Badge',1,'2026-05-23 16:29:07','2026-05-23 16:29:07'],[69,26,6,'L','Blue',1,'2026-05-23 16:29:21','2026-05-23 16:29:21'],
    [70,26,2,'L','Blue',1,'2026-05-23 16:29:33','2026-05-23 16:29:33'],[71,26,4,'M','Black',1,'2026-05-24 04:31:11','2026-05-24 04:31:11'],
    [77,1,2,'M','Blue',1,'2026-05-24 06:52:25','2026-05-24 06:52:25'],[78,1,1,'M','Blue',1,'2026-05-24 06:52:37','2026-05-24 06:52:37'],
  ]);

  await ins('bank_details', ['id','bankName','accountName','accountNumber','branch','isActive','createdAt','updatedAt'], [
    [1,'Bank of Ceylon','CLICK SUPER MALL PRIVATE LIMITED','94233271','Avissawella',1,'2026-05-08 05:57:33','2026-05-08 05:57:33'],
  ]);

  await ins('contacts', ['id','name','phone','email','comment','createdAt','updatedAt'], [
    [1,'Maheesha Nidushani','+94788721193','maheeshaecc18@gmail.com','hi yaluwee','2026-05-03 06:16:26','2026-05-03 06:16:26'],
    [2,'Maheesha Nidushani','+94788721193','maheeshaecc18@gmail.com','helloo','2026-05-03 06:35:01','2026-05-03 06:35:01'],
  ]);

  await ins('returns', ['id','userId','orderId','reason','createdAt','updatedAt','products'], [
    [1,1,20,'Size too small','2026-05-04 21:50:03','2026-05-04 21:50:03','[]'],
    [2,5,21,'Damaged item','2026-05-04 21:50:03','2026-05-04 21:50:03','[]'],
    [6,1,31,'bb','2026-05-06 07:17:56','2026-05-06 07:17:56','[{"size":"M","color":"Black","quantity":1,"productId":1},{"size":"L","color":"Blue","quantity":1,"productId":2},{"size":"S","color":"Red","quantity":1,"productId":3}]'],
    [9,1,22,'customer not responding','2026-05-06 23:45:22','2026-05-06 23:45:22','[{"size":"L","color":"Black","quantity":1,"productId":29}]'],
  ]);

  await ins('wishlists', ['id','userId','productId','createdAt','updatedAt'], [
    [1,null,null,'2026-05-04 22:01:02','2026-05-04 22:01:02'],[2,null,null,'2026-05-04 22:01:02','2026-05-04 22:01:02'],
    [3,1,29,'2026-05-05 00:06:46','2026-05-05 00:06:46'],[4,1,41,'2026-05-05 00:06:46','2026-05-05 00:06:46'],
    [6,16,8,'2026-05-06 20:32:46','2026-05-06 20:32:46'],[8,19,44,'2026-05-06 20:40:03','2026-05-06 20:40:03'],
    [9,16,39,'2026-05-06 21:02:19','2026-05-06 21:02:19'],[11,20,1,'2026-05-08 00:47:43','2026-05-08 00:47:43'],
    [12,20,32,'2026-05-08 00:48:02','2026-05-08 00:48:02'],[13,20,27,'2026-05-08 00:48:18','2026-05-08 00:48:18'],
    [14,2,8,'2026-05-23 08:28:48','2026-05-23 08:28:48'],[15,2,9,'2026-05-23 08:28:51','2026-05-23 08:28:51'],
  ]);

  await ins('selected_items', ['id','userId','productId','size','color','price','quantity','imageUrl','createdAt','updatedAt'], [
    [33,3,44,'32','Blue',1000.00,1,'https://res.cloudinary.com/dv4ubqk9d/image/upload/v1777987804/tjlberdwy4vpdr9fk7rz.jpg','2026-05-23 16:21:05','2026-05-23 16:21:05'],
  ]);

  await ins('user_addresses', ['id','userId','label','first_name','last_name','address','city','district','province','phone','is_default','createdAt','updatedAt'], [
    [1,1,'Home','Maheesha','Nidushani','Dehiowita','Awissawella','Kegalle','Sabaragamuwa Province','0788721193',1,'2026-05-23 16:22:24','2026-05-23 16:22:24'],
    [2,26,'Work','Gayan','madushanka','hinguralakanda','dehiowita','Kegalle','Sabaragamuwa Province','0743145791',0,'2026-05-23 16:30:39','2026-05-23 16:32:39'],
    [3,26,'Home','Maheesha','nidushani','avissawella','colombo','Colombo','Western Province','0788721193',1,'2026-05-23 16:32:18','2026-05-23 16:32:39'],
  ]);

  await conn.query('SET FOREIGN_KEY_CHECKS=1');
  console.log('\n✅  All done!');
  await conn.end();
}

run().catch(err => { console.error('❌', err.message); process.exit(1); });
