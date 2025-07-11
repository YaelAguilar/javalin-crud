plugins {
    id("java")
    id("application")
}

group = "org.example"
version = "1.0-SNAPSHOT"

repositories {
    mavenCentral()
}

dependencies {
    // --- Framework Web ---
    implementation("io.javalin:javalin-bundle:5.6.1") // Javalin con plugins comunes

    // --- Manejo de JSON ---
    implementation("com.fasterxml.jackson.core:jackson-databind:2.15.2")
    implementation("com.fasterxml.jackson.datatype:jackson-datatype-jsr310:2.15.2") // Soporte para Java Time

    // --- Base de Datos ---
    implementation("com.zaxxer:HikariCP:5.0.1")       // Pool de conexiones
    implementation("mysql:mysql-connector-java:8.0.33") // Driver de MySQL

    // --- Utilidades ---
    implementation("io.github.cdimascio:dotenv-java:3.0.0") // Para leer archivos .env
    implementation("org.jetbrains:annotations:24.0.0") // Para la anotación @Language
}

application {
    mainClass.set("org.example.Main")
}

tasks.test {
    useJUnitPlatform()
}