# VetAgenda# VeTurnos — Sistema de Gestión de Turnos Veterinarios

¡Bienvenido al repositorio oficial de **VeTurnos**! Esta aplicación móvil multiplataforma permite optimizar y agilizar la reserva, gestión y seguimiento de turnos en clínicas veterinarias, integrando perfiles diferenciados para Clientes y Veterinarios. Proyecto desarrollado para la cátedra **Desarrollo de Aplicaciones Móviles** (2026).

---

## 👥 Integrantes — Grupo 07

* **Balda, Matías**
* **Conti, Brenda Belén**
* **Flores, Lautaro Ezequiel**
* **Oyhenart, Franco**
* **Romero Olmo, Macarena**

---

## 🛠️ Stack Tecnológico y Arquitectura

El sistema se implementó bajo una arquitectura cliente-servidor de tres capas:
* **Frontend (Móvil):** React Native (v0.74) + Expo SDK 51.
* **Gestión de Estado:** Context API (`AuthContext`) con persistencia local en `AsyncStorage`.
* **Backend (API REST):** Spring Boot + Java 21 (Patrón Controller ➔ Service ➔ Repository).
* **Base de Datos:** PostgreSQL alojado en la nube mediante Supabase.

---

## 🚀 Instalación y Configuración del Entorno

Seguí estos pasos en orden para clonar el proyecto, configurar las variables de entorno de forma segura y ejecutar tanto el servidor como la aplicación móvil.

### 📋 Requisitos Previos Mínimos
Antes de arrancar, asegurense de tener instalado en la máquina:
* **Java JDK 21** (Se recomienda Amazon Corretto, Eclipse Temurin o Azul Zulu de Java 21).
* **Git** configurado en el sistema.
* **IntelliJ IDEA** (Versión 2023.3 o posterior, para tener soporte total nativo de Java 21).
* **Node.js** (Versión LTS recomendada) para el entorno móvil.
* **Expo Go** instalado en tu dispositivo móvil (o un emulador Android configurado).

---

###  Pasos para levantar la aplicacion 
1-clonar el repositorio
2-entrar a la carpeta del repositorio 
3- asegurar la ultima version mediante el comando 
    git pull origin main
4-nos posicionamos en la carpeta Backend y ejecutamos 
    npm install
    npm run dev 
    Sabremos que levanto correctamente por que la consola mostrará un mensaje "conectado con exito"
5-abrimos otra terminal 
6-nos posicionamos en la carpeta del frontend 
    npm install
    npm run dev 
    La consola debera mostrar un enlace local, haciendo Ctrl+Clic podremos acceder a la aplicacion en el navegadpo
---