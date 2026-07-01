'use strict';
/**
 * Generates seed-data.sql from the hardcoded dump data.
 * Run: node seeders/generate-sql.js
 */
const fs = require('fs');
const path = require('path');

const out = [];
const w = (s) => out.push(s);

w('SET FOREIGN_KEY_CHECKS = 0;\n');

// ── USERS ──────────────────────────────────────────────────────────────────
w(`CREATE TABLE IF NOT EXISTS \`Users\` (
  \`id\` int NOT NULL AUTO_INCREMENT, \`first_name\` varchar(255), \`last_name\` varchar(255),
  \`email\` varchar(255), \`password\` varchar(255), \`googleId\` varchar(255),
  \`isAdmin\` tinyint(1), \`createdAt\` datetime NOT NULL, \`updatedAt\` datetime NOT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n`);

const users = [
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
];
const esc = (v) => v === null ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`;
const row = (arr) => `(${arr.map(esc).join(',')})`;
w(`INSERT IGNORE INTO \`Users\` (id,first_name,last_name,email,password,googleId,isAdmin,createdAt,updatedAt) VALUES\n${users.map(row).join(',\n')};\n`);
