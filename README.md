# 💧 HydroRace 

![Estado del Proyecto: En Desarrollo](https://img.shields.io/badge/estado-En%20Desarrollo-yellow.svg)
![Plataforma: Azure](https://img.shields.io/badge/plataforma-Azure-0078D4.svg)

## 🚀 Acerca del Proyecto

**HydroRace** es una aplicación web que recibe datos de consumo de agua desde un dispositivo IoT (una botella inteligente). El objetivo es permitir a los usuarios monitorear sus hábitos de hidratación, pero con un giro: **la gamificación**.

Los usuarios podrán ver sus estadísticas, competir en tablas de clasificación (*leaderboards*), crear y unirse a retos de hidratación e invitar a sus amigos.

## 📋 Características Planeadas

* **🏠 Dashboard Personal:** Visualización de datos históricos de consumo, metas diarias y rachas.
* **🏆 Retos y Gamificación:** Creación y gestión de retos públicos o privados.
* **📊 Leaderboards:** Tablas de clasificación entre amigos o globales.
* **👤 Perfiles de Usuario:** Gestión de perfil, incluyendo subida de foto de avatar.
* **🔒 Autenticación:** Sistema seguro de registro e inicio de sesión.
* **🔄 Ingesta de Datos IoT:** Un *endpoint* de API dedicado para recibir datos de la botella inteligente.

## 🛠️ Stack Tecnológico (Planeado)

El proyecto será desplegado 100% en **Microsoft Azure**, utilizando los siguientes servicios:

* **API Backend:** `Azure Functions` (Serverless)
* **Frontend:** `Azure App Service` (Host para la WebApp en React, Vue o Angular)
* **Base de Datos:** `Azure SQL Database` (Para datos relacionales como usuarios, retos, etc.)
* **Almacenamiento de Archivos:** `Azure Blob Storage` (Para las fotos de perfil de usuario)
* **Infraestructura como Código (IaC):** `Bicep`

## 📂 Estructura del Repositorio
