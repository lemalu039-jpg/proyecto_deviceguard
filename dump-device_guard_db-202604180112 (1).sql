-- MySQL dump 10.13  Distrib 8.0.19, for Win64 (x86_64)
--
-- Host: localhost    Database: device_guard_db
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `correos`
--

DROP TABLE IF EXISTS `correos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `correos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `destinatario` varchar(255) DEFAULT NULL,
  `asunto` varchar(255) DEFAULT NULL,
  `mensaje` text,
  `fecha_envio` date DEFAULT NULL,
  `hora_envio` time DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `correos`
--

LOCK TABLES `correos` WRITE;
/*!40000 ALTER TABLE `correos` DISABLE KEYS */;
INSERT INTO `correos` VALUES (1,'correo@ejemplo.com','Salida de dispositivo','El dispositivo con serial 29389342 ha sido entregado correctamente.','2026-04-05','21:24:00'),(2,'correo@ejemplo.com','Salida de dispositivo','El dispositivo con serial 29389342 ha sido entregado correctamente.','2026-04-05','21:24:00'),(3,'maria.lopez@sena.edu.co','Salida de dispositivo','El dispositivo con serial SN-TB-003 ha sido entregado correctamente.','2026-04-05','10:09:00'),(4,'maria.lopez@sena.edu.co','Salida de dispositivo','El dispositivo con serial SN-TB-003 ha sido entregado correctamente.','2026-04-05','10:09:00'),(5,'maria.lopez@sena.edu.co','Salida de dispositivo','El dispositivo con serial ckja ha sido entregado correctamente.','2026-04-06','08:03:00'),(6,'maria.lopez@sena.edu.co','Salida de dispositivo','El dispositivo con serial ckja ha sido entregado correctamente.','2026-04-06','08:03:00'),(7,'device.guard02@gmail.com',' Nuevo dispositivo registrado — DeviceGuard','Dispositivo \"KAS\" registrado en el sistema','2026-04-11','14:09:00'),(8,'device.guard02@gmail.com','Inicio de mantenimiento — DeviceGuard','Dispositivo \"KAS\" inició mantenimiento','2026-04-11','14:11:00'),(9,'device.guard02@gmail.com','Mantenimiento finalizado — DeviceGuard','Dispositivo \"ksjdcndsj\" listo para entrega','2026-04-11','14:13:00'),(10,'device.guard02@gmail.com','Inicio de mantenimiento — DeviceGuard','Dispositivo \"KDJ\" inició mantenimiento','2026-04-11','14:14:00'),(11,'device.guard02@gmail.com','Inicio de mantenimiento — DeviceGuard','Dispositivo \"MNASNS SN \" inició mantenimiento','2026-04-11','14:18:00'),(12,'device.guard02@gmail.com','Inicio de mantenimiento — DeviceGuard','Dispositivo \"ikajsjsj\" inició mantenimiento','2026-04-11','14:21:00'),(13,'device.guard02@gmail.com','Mantenimiento finalizado — DeviceGuard','Dispositivo \"KAS\" listo para entrega','2026-04-11','14:22:00'),(14,'device.guard02@gmail.com','Inicio de mantenimiento — DeviceGuard','Dispositivo \"dnk\" inició mantenimiento','2026-04-11','14:23:00'),(15,'device.guard02@gmail.com','Mantenimiento finalizado — DeviceGuard','Dispositivo \"KDJ\" listo para entrega','2026-04-11','14:29:00'),(16,'device.guard02@gmail.com','Nuevo dispositivo registrado — DeviceGuard','Dispositivo \"KSD\" registrado en el sistema','2026-04-11','18:07:00'),(17,'device.guard02@gmail.com','Inicio de mantenimiento — DeviceGuard','Dispositivo \"KSD\" inició mantenimiento','2026-04-11','18:22:00'),(18,'device.guard02@gmail.com','Salida de dispositivo registrada — DeviceGuard','Dispositivo \"KAS\" entregado','2026-04-11','18:22:00'),(19,'device.guard02@gmail.com','Nuevo dispositivo registrado — DeviceGuard','Dispositivo \"KSD\" registrado en el sistema','2026-04-13','07:39:00'),(20,'device.guard02@gmail.com','Nuevo dispositivo registrado — DeviceGuard','Dispositivo \"arf\" registrado en el sistema','2026-04-15','14:45:00'),(21,'device.guard02@gmail.com','Nuevo dispositivo registrado — DeviceGuard','Dispositivo \"Asus\" registrado en el sistema','2026-04-15','18:14:00'),(22,'device.guard02@gmail.com','Inicio de mantenimiento — DeviceGuard','Dispositivo \"Asus\" inició mantenimiento','2026-04-16','19:55:00'),(23,'device.guard02@gmail.com','Salida de dispositivo registrada — DeviceGuard','Dispositivo \"Mackbook pro\" entregado','2026-04-17','20:59:00'),(24,'device.guard02@gmail.com','Inicio de mantenimiento — DeviceGuard','Dispositivo \"KSD\" inició mantenimiento','2026-04-17','21:00:00'),(25,'device.guard02@gmail.com','Mantenimiento finalizado — DeviceGuard','Dispositivo \"Asus\" listo para entrega','2026-04-17','21:01:00'),(26,'device.guard02@gmail.com','Inicio de mantenimiento — DeviceGuard','Dispositivo \"arf\" inició mantenimiento','2026-04-17','21:49:00'),(27,'device.guard02@gmail.com','Inicio de mantenimiento — DeviceGuard','Dispositivo \"MNASNS SN \" inició mantenimiento','2026-04-17','21:53:00'),(28,'device.guard02@gmail.com','Inicio de mantenimiento — DeviceGuard','Dispositivo \"LDF\" inició mantenimiento','2026-04-17','21:54:00'),(29,'device.guard02@gmail.com','Inicio de mantenimiento — DeviceGuard','Dispositivo \" DLP\" inició mantenimiento','2026-04-17','21:59:00'),(30,'device.guard02@gmail.com','Inicio de mantenimiento — DeviceGuard','Dispositivo \"2mac\" inició mantenimiento','2026-04-17','22:15:00'),(31,'device.guard02@gmail.com','Salida de dispositivo registrada — DeviceGuard','Dispositivo \"lenovo 5\" entregado','2026-04-17','22:21:00'),(32,'device.guard02@gmail.com','Mantenimiento finalizado — DeviceGuard','Dispositivo \"arf\" listo para entrega','2026-04-17','22:27:00'),(33,'device.guard02@gmail.com','Nuevo dispositivo registrado — DeviceGuard','Dispositivo \"skajd\" registrado en el sistema','2026-04-17','22:36:00'),(34,'device.guard02@gmail.com','Inicio de mantenimiento — DeviceGuard','Dispositivo \"skajd\" inició mantenimiento','2026-04-17','22:40:00'),(35,'device.guard02@gmail.com','Mantenimiento finalizado — DeviceGuard','Dispositivo \"skajd\" listo para entrega','2026-04-17','23:14:00'),(36,'device.guard02@gmail.com','Salida de dispositivo registrada — DeviceGuard','Dispositivo \"skajd\" entregado','2026-04-17','23:22:00'),(37,'device.guard02@gmail.com','Mantenimiento finalizado — DeviceGuard','Dispositivo \"KSD\" listo para entrega','2026-04-17','23:22:00'),(38,'device.guard02@gmail.com','Nuevo dispositivo registrado — DeviceGuard','Dispositivo \"jdshd\" registrado en el sistema','2026-04-17','23:25:00'),(39,'device.guard02@gmail.com','Inicio de mantenimiento — DeviceGuard','Dispositivo \"jdshd\" inició mantenimiento','2026-04-17','23:26:00'),(40,'device.guard02@gmail.com','Mantenimiento finalizado — DeviceGuard','Dispositivo \"jdshd\" listo para entrega','2026-04-17','23:45:00'),(41,'device.guard02@gmail.com','Nuevo dispositivo registrado — DeviceGuard','Dispositivo \"kfk\" registrado en el sistema','2026-04-17','23:55:00'),(42,'device.guard02@gmail.com','Inicio de mantenimiento — DeviceGuard','Dispositivo \"kfk\" inició mantenimiento','2026-04-18','00:04:00'),(43,'device.guard02@gmail.com','Mantenimiento finalizado — DeviceGuard','Dispositivo \"kfk\" listo para entrega','2026-04-18','00:10:00'),(44,'device.guard02@gmail.com','Salida de dispositivo registrada — DeviceGuard','Dispositivo \"kfk\" entregado','2026-04-18','01:06:00');
/*!40000 ALTER TABLE `correos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dispositivos`
--

DROP TABLE IF EXISTS `dispositivos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dispositivos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `serial` varchar(100) NOT NULL,
  `marca` varchar(50) NOT NULL,
  `modelo` varchar(50) DEFAULT NULL,
  `ubicacion` varchar(100) DEFAULT NULL,
  `fecha_registro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `hora_registro` time DEFAULT NULL,
  `archivo` varchar(255) DEFAULT NULL,
  `fecha_salida` date DEFAULT NULL,
  `hora_salida` time DEFAULT NULL,
  `descripcion` text,
  `estado_id` int DEFAULT NULL,
  `usuario_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `serial` (`serial`),
  KEY `fk_estado` (`estado_id`),
  KEY `fk_usuario` (`usuario_id`),
  CONSTRAINT `fk_estado` FOREIGN KEY (`estado_id`) REFERENCES `estados` (`id`),
  CONSTRAINT `fk_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=108 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dispositivos`
--

LOCK TABLES `dispositivos` WRITE;
/*!40000 ALTER TABLE `dispositivos` DISABLE KEYS */;
INSERT INTO `dispositivos` VALUES (1,'Laptop Dell','Computadora','SN-LT-001','Dell','XPS 15','Laboratorio 1','2026-03-17 00:00:00','15:49:00',NULL,'2026-03-25','00:29:00',NULL,4,3),(3,'Tablet Samsung','Tablet','SN-TB-003','Samsung','Galaxy Tab S7','Biblioteca','2026-03-17 00:00:00','22:49:00',NULL,'2026-04-06','10:08:00',NULL,4,3),(4,'Monitor LG','Pantalla','SN-MN-004','LG','27UK850-W','Almacen Central','2026-03-17 00:00:00','14:49:00',NULL,'2026-03-25','23:17:00',NULL,4,2),(7,'lenovo 5','portatil','98656','lenovo',NULL,'nave 6','2026-04-12 00:00:00','14:07:00',NULL,NULL,NULL,NULL,4,2),(24,'lenovo 8','Pantalla','29389342','hp',NULL,'nave 6','2026-03-20 00:00:00','22:48:00',NULL,'2026-04-06','21:24:00',NULL,4,3),(36,'Proyector Epson','proyector','894792','epson',NULL,'Almacen Central','2026-03-23 00:00:00','20:04:00',NULL,'2026-04-06','20:32:00',NULL,4,3),(44,'2mac','pc','65448','apple',NULL,'almacen','2026-04-12 00:00:00','18:20:00','archivo-1774238972193-774340774.jpg',NULL,NULL,NULL,2,2),(46,'Mackbook pro','portatil','211198','apple',NULL,'Sotano','2026-04-12 00:00:00','13:52:00',NULL,NULL,NULL,NULL,4,2),(92,'dnk','xnk','ckja','cw',NULL,'cwcw','2026-04-12 00:00:00','13:55:00','archivo-1775475396640-308547935.webp',NULL,NULL,NULL,2,2),(93,'Asus','portatil','834785385','ASUS',NULL,'Sotano','2026-04-06 00:00:00','06:39:00','archivo-1775475598242-726284779.webp',NULL,NULL,NULL,4,2),(94,' DLP','proyector','58888',' DLP',NULL,'Almacen Central','2026-04-12 00:00:00','13:31:00',NULL,NULL,NULL,'Lampara del proyector dañada',2,2),(95,'ikajsjsj','Pantalla','327493843','sjkdsjjd',NULL,'Almacen Central','2026-04-12 00:00:00','13:27:00',NULL,NULL,NULL,'Pantalla rayada',2,2),(96,'ksjdcndsj','portatil','843000','snmdms',NULL,'Almacen Central','2026-04-12 00:00:00','13:32:00',NULL,'2026-04-12','14:13:00',NULL,4,3),(97,'MNASNS SN ','Portatil','658999','MNASNS SN',NULL,'Almacen','2026-04-12 00:00:00','13:47:00',NULL,NULL,NULL,NULL,2,3),(98,'LDF','Portatil','09094','LDKJ',NULL,'Sotano','2026-04-12 00:00:00','13:56:00',NULL,NULL,NULL,NULL,2,3),(99,'KDJ','KJD','84784','MNC',NULL,'Sotano','2026-04-12 00:00:00','14:02:00',NULL,'2026-04-12','14:29:00',NULL,4,2),(100,'KAS','KJADS','4935','AHBSD',NULL,'Sotano','2026-04-12 00:00:00','18:13:00',NULL,'2026-04-12','14:22:00','',4,2),(101,'KSD','portatil','3488','KSK',NULL,'Sotano','2026-04-12 00:00:00','18:07:00',NULL,NULL,NULL,NULL,2,3),(102,'KSD','portatil','14771741','KSK',NULL,'Sotano','2026-04-14 00:00:00','07:39:00','archivo-1776170364175-638191411.jpg','2026-04-18','23:22:00',NULL,3,2),(103,'arf','portatil','37848','arf',NULL,'recepcion','2026-04-16 00:00:00','14:45:00',NULL,'2026-04-18','22:27:00','pantalla rayada',3,18),(104,'Asus','portatil','09560','arf',NULL,'recepcion','2026-04-16 00:00:00','18:14:00',NULL,'2026-04-18','21:01:00','Teclado sin tecla Enter',3,18),(105,'skajd','proyector','58580','dskjk',NULL,'recepcion','2026-04-18 00:00:00','22:36:00',NULL,'2026-04-18','23:14:00',NULL,4,2),(106,'jdshd','Pantalla','29012','jsksj',NULL,'recepcion','2026-04-18 00:00:00','23:25:00',NULL,'2026-04-18','23:45:00','rayada',3,3),(107,'kfk','portatil','08119','urmf',NULL,'recepcion','2026-04-18 00:00:00','23:55:00',NULL,'2026-04-18','00:10:00',NULL,4,2);
/*!40000 ALTER TABLE `dispositivos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estados`
--

DROP TABLE IF EXISTS `estados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estados` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estados`
--

LOCK TABLES `estados` WRITE;
/*!40000 ALTER TABLE `estados` DISABLE KEYS */;
INSERT INTO `estados` VALUES (1,'En Revision'),(2,'En Mantenimiento'),(3,'Listo para Entrega'),(4,'Entregado'),(5,''),(6,''),(7,''),(8,'');
/*!40000 ALTER TABLE `estados` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_dispositivos`
--

DROP TABLE IF EXISTS `historial_dispositivos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial_dispositivos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_dispositivo` int NOT NULL,
  `observacion` text NOT NULL,
  `fecha` datetime DEFAULT CURRENT_TIMESTAMP,
  `usuario_responsable` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_dispositivo` (`id_dispositivo`),
  CONSTRAINT `historial_dispositivos_ibfk_1` FOREIGN KEY (`id_dispositivo`) REFERENCES `dispositivos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_dispositivos`
--

LOCK TABLES `historial_dispositivos` WRITE;
/*!40000 ALTER TABLE `historial_dispositivos` DISABLE KEYS */;
/*!40000 ALTER TABLE `historial_dispositivos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mantenimiento`
--

DROP TABLE IF EXISTS `mantenimiento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mantenimiento` (
  `id` int NOT NULL AUTO_INCREMENT,
  `dispositivo_id` int NOT NULL,
  `fecha` datetime DEFAULT CURRENT_TIMESTAMP,
  `descripcion` text NOT NULL,
  `estado_mantenimiento` enum('Pendiente','En Proceso','Completado','Cancelado') NOT NULL,
  `tecnico_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `dispositivo_id` (`dispositivo_id`),
  KEY `fk_tecnico` (`tecnico_id`),
  CONSTRAINT `fk_tecnico` FOREIGN KEY (`tecnico_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `mantenimiento_ibfk_1` FOREIGN KEY (`dispositivo_id`) REFERENCES `dispositivos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mantenimiento`
--

LOCK TABLES `mantenimiento` WRITE;
/*!40000 ALTER TABLE `mantenimiento` DISABLE KEYS */;
INSERT INTO `mantenimiento` VALUES (1,4,'2026-03-16 19:55:49','Fallo en encendido, revision de placa base','En Proceso',NULL),(2,105,'2026-04-17 22:40:40','Ingreso a mantenimiento','Completado',20),(3,106,'2026-04-17 23:26:37','Ingreso a mantenimiento','En Proceso',19),(4,106,'2026-04-17 23:49:04','Mantenimiento completado - listo para entrega','Completado',19),(5,107,'2026-04-18 00:09:34','Inicio de mantenimiento','En Proceso',20),(6,107,'2026-04-18 00:10:26','Mantenimiento completado - listo para entrega','Completado',20),(7,107,'2026-04-18 01:06:37','Dispositivo entregado al cliente','Completado',19);
/*!40000 ALTER TABLE `mantenimiento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mensajes_internos`
--

DROP TABLE IF EXISTS `mensajes_internos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mensajes_internos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `remitente_id` int NOT NULL,
  `destinatario_id` int NOT NULL,
  `mensaje` text NOT NULL,
  `leido` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `remitente_id` (`remitente_id`),
  KEY `destinatario_id` (`destinatario_id`),
  CONSTRAINT `mensajes_internos_ibfk_1` FOREIGN KEY (`remitente_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `mensajes_internos_ibfk_2` FOREIGN KEY (`destinatario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mensajes_internos`
--

LOCK TABLES `mensajes_internos` WRITE;
/*!40000 ALTER TABLE `mensajes_internos` DISABLE KEYS */;
INSERT INTO `mensajes_internos` VALUES (4,2,3,'Holaaa',1,'2026-04-08 11:35:50'),(5,2,3,'holaaa',1,'2026-04-08 11:54:37'),(6,2,3,'holaa',1,'2026-04-08 20:48:56'),(7,3,2,'Hola',1,'2026-04-12 00:54:03'),(8,3,2,'....',1,'2026-04-12 15:54:23'),(12,2,3,'hollaaa',1,'2026-04-14 12:15:14'),(13,2,3,'..',1,'2026-04-14 12:15:16'),(14,3,2,'hyola',1,'2026-04-14 12:40:01'),(15,3,2,'como',1,'2026-04-14 13:09:21');
/*!40000 ALTER TABLE `mensajes_internos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prestamos`
--

DROP TABLE IF EXISTS `prestamos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prestamos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `dispositivo_id` int NOT NULL,
  `fecha_prestamo` datetime DEFAULT CURRENT_TIMESTAMP,
  `fecha_devolucion` datetime DEFAULT NULL,
  `estado_prestamo` enum('Activo','Devuelto','Atrasado') DEFAULT 'Activo',
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `dispositivo_id` (`dispositivo_id`),
  CONSTRAINT `prestamos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `prestamos_ibfk_2` FOREIGN KEY (`dispositivo_id`) REFERENCES `dispositivos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prestamos`
--

LOCK TABLES `prestamos` WRITE;
/*!40000 ALTER TABLE `prestamos` DISABLE KEYS */;
INSERT INTO `prestamos` VALUES (1,2,3,'2026-03-16 19:55:49',NULL,'Activo');
/*!40000 ALTER TABLE `prestamos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `contrasena` varchar(255) NOT NULL,
  `rol` enum('super_admin','tecnico','usuario') NOT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `correo` (`correo`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (2,'Maria Lopez','maria.lopez@sena.edu.co','123456','usuario','2026-03-17 00:55:49'),(3,'Carlos Ruiz','carlos.ruiz@sena.edu.co','123456','usuario','2026-03-17 00:55:49'),(17,'Andres Diaz','andres.admin@deviceguard.com','superadmin123','super_admin','2026-04-16 15:05:26'),(18,'Wilmar Rondon','wilmar.rondon08@gmail.com','1234567','usuario','2026-04-16 18:21:23'),(19,'Juan perez','juan.perez@sena.edu.co','juan123','tecnico','2026-04-16 21:22:57'),(20,'Jhon Ruiz','jhon.ruiz09@gmail.com','jh123','tecnico','2026-04-18 04:13:20');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'device_guard_db'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-18  1:12:04
