package org.example.configs;

import io.github.cdimascio.dotenv.Dotenv;

public class AppConfig {
    private static final Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();

    public static String getDbUrl() {
        return getRequiredEnv("DB_URL");
    }

    public static String getDbUsername() {
        return getRequiredEnv("DB_USERNAME");
    }

    public static String getDbPassword() {
        return getRequiredEnv("DB_PASSWORD");
    }

    public static int getDbMaxPoolSize() {
        return Integer.parseInt(dotenv.get("DB_MAX_POOL_SIZE", "10"));
    }

    public static int getServerPort() {
        return Integer.parseInt(dotenv.get("SERVER_PORT", "7070"));
    }

    public static String getServerHost() {
        return dotenv.get("SERVER_HOST", "localhost");
    }

    private static String getRequiredEnv(String key) {
        String value = dotenv.get(key);
        if (value == null || value.trim().isEmpty()) {
            System.err.println("Error: La variable de entorno requerida '" + key + "' no está definida.");
            System.err.println("Asegúrate de tener un archivo .env válido en la raíz del proyecto.");
            throw new IllegalStateException("Variable de entorno requerida no encontrada: " + key);
        }
        return value;
    }
}